interface Env {
  CMC_API_KEY: string;
}

interface OrderBookEntry {
  price: number;
  numberOfShares: number;
}

interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  bestBid: number | null;
  bestAsk: number | null;
  midPrice: number | null;
}

const ALLOWED_ORIGINS = new Set([
  "https://qubicpulse.pages.dev",
  "http://localhost:5173",
]);
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const CMC_CACHE_TTL_SECONDS = 60;
const ORDERBOOK_CACHE_TTL_SECONDS = 60;
const QX_CONTRACT_INDEX = 1;
const QX_GET_ASSET_ASK_ORDER = 2;
const QX_GET_ASSET_BID_ORDER = 3;
const ORDERBOOK_REQUEST_SIZE = 48;
const ORDERBOOK_ORDER_SIZE = 48;
const ORDERBOOK_MAX_ORDERS = 256;
const requestCounts = new Map<string, { count: number; expiresAt: number }>();

function corsHeaders(origin: string | null): Headers {
  const headers = new Headers({
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  });
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return headers;
}

function json(data: unknown, status = 200, origin: string | null = null): Response {
  const headers = corsHeaders(origin);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { status, headers });
}

function clientKey(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "unknown";
}

function rateLimited(request: Request): boolean {
  const now = Date.now();
  const key = clientKey(request);
  const current = requestCounts.get(key);
  if (!current || current.expiresAt <= now) {
    requestCounts.set(key, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
}

async function cmc(env: Env, origin: string | null): Promise<Response> {
  const cacheKey = new Request("https://qubicpulse-api.internal/price");
  const cached = await caches.default.match(cacheKey);
  if (cached) {
    const response = new Response(cached.body, cached);
    const headers = corsHeaders(origin);
    headers.set("Content-Type", "application/json");
    headers.set("X-Cache", "HIT");
    return new Response(response.body, { status: response.status, headers });
  }

  const response = await fetch("https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=QUBIC,BTC,ETH&convert=USD", {
    headers: { "X-CMC_PRO_API_KEY": env.CMC_API_KEY },
  });
  if (!response.ok) return json({ error: "Market data provider failed" }, 502, origin);
  const payload = await response.json<{ data: Record<string, { quote: { USD: { price: number; market_cap?: number; percent_change_24h?: number } } }> }>();
  const qubic = payload.data.QUBIC?.quote.USD;
  const btc = payload.data.BTC?.quote.USD.price ?? 0;
  const eth = payload.data.ETH?.quote.USD.price ?? 0;
  if (!qubic) return json({ error: "QUBIC market data unavailable" }, 502, origin);
  const data = {
    usd: qubic.price,
    usd_24h_change: qubic.percent_change_24h ?? 0,
    usd_market_cap: qubic.market_cap ?? 0,
    btc: btc > 0 ? qubic.price / btc : 0,
    eth: eth > 0 ? qubic.price / eth : 0,
  };
  const cacheResponse = json(data);
  cacheResponse.headers.set(
    "Cache-Control",
    `public, max-age=${CMC_CACHE_TTL_SECONDS}`
  );
  await caches.default.put(cacheKey, cacheResponse);
  const result = json(data, 200, origin);
  result.headers.set("X-Cache", "MISS");
  return result;
}

function identityToBytes(identity: string): Uint8Array {
  const bytes = new Uint8Array(32);
  const view = new DataView(bytes.buffer);
  const alpha = 26n;
  for (let group = 0; group < 4; group++) {
    let value = 0n;
    for (let j = 13; j >= 0; j--) {
      value = value * alpha + BigInt(identity.charCodeAt(group * 14 + j) - 65);
    }
    view.setBigUint64(group * 8, value, true);
  }
  return bytes;
}

function buildOrderbookRequest(
  issuer: string,
  assetName: string,
  offset: number
): Uint8Array {
  const data = new Uint8Array(ORDERBOOK_REQUEST_SIZE);
  data.set(identityToBytes(issuer), 0);
  const encoder = new TextEncoder();
  const nameBytes = encoder.encode(assetName.toUpperCase());
  data.set(nameBytes.subarray(0, 8), 32);
  const offsetView = new DataView(data.buffer, 40, 8);
  offsetView.setBigUint64(0, BigInt(offset), true);
  return data;
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function queryQx(
  inputType: number,
  requestData: Uint8Array
): Promise<OrderBookEntry[]> {
  const response = await fetch(
    "https://rpc.qubic.org/v1/querySmartContract",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contractIndex: QX_CONTRACT_INDEX,
        inputType,
        inputSize: ORDERBOOK_REQUEST_SIZE,
        requestData: encodeBase64(requestData),
      }),
    }
  );
  if (!response.ok) throw new Error(`QX query failed: ${response.status}`);
  const payload = (await response.json()) as { responseData: string };
  const bytes = decodeBase64(payload.responseData);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const entries: OrderBookEntry[] = [];
  for (let i = 0; i < ORDERBOOK_MAX_ORDERS; i++) {
    const offset = i * ORDERBOOK_ORDER_SIZE;
    if (offset + ORDERBOOK_ORDER_SIZE > bytes.byteLength) break;
    const numberOfShares = Number(view.getBigInt64(offset + 40, true));
    if (numberOfShares <= 0) continue;
    entries.push({
      price: Number(view.getBigInt64(offset + 32, true)),
      numberOfShares,
    });
  }
  return entries;
}

async function fetchOrderBook(
  issuer: string,
  assetName: string
): Promise<OrderBook> {
  const requestData = buildOrderbookRequest(issuer, assetName, 0);
  const [askEntries, bidEntries] = await Promise.all([
    queryQx(QX_GET_ASSET_ASK_ORDER, requestData),
    queryQx(QX_GET_ASSET_BID_ORDER, requestData),
  ]);

  const asks = askEntries.sort((a, b) => a.price - b.price);
  const bids = bidEntries.sort((a, b) => b.price - a.price);

  const bestAsk = asks.length > 0 ? asks[0].price : null;
  const bestBid = bids.length > 0 ? bids[0].price : null;
  const midPrice =
    bestBid !== null && bestAsk !== null
      ? (bestBid + bestAsk) / 2
      : bestBid ?? bestAsk;

  return { bids, asks, bestBid, bestAsk, midPrice };
}

async function orderbook(
  url: URL,
  origin: string | null
): Promise<Response> {
  const name = (url.searchParams.get("name") ?? "").trim().toUpperCase();
  const issuer = (url.searchParams.get("issuer") ?? "").trim();
  if (!name || !issuer) return json({ error: "Missing name or issuer" }, 400, origin);

  const cacheKey = new Request(
    `https://qubicpulse-api.internal/orderbook/${name}:${issuer}`
  );
  const cached = await caches.default.match(cacheKey);
  if (cached) {
    const response = new Response(cached.body, cached);
    const headers = corsHeaders(origin);
    headers.set("Content-Type", "application/json");
    headers.set("X-Cache", "HIT");
    return new Response(response.body, { status: response.status, headers });
  }

  let data: OrderBook;
  try {
    data = await fetchOrderBook(issuer, name);
  } catch {
    return json({ error: "Orderbook unavailable" }, 502, origin);
  }

  const cacheResponse = json(data);
  cacheResponse.headers.set(
    "Cache-Control",
    `public, max-age=${ORDERBOOK_CACHE_TTL_SECONDS}`
  );
  await caches.default.put(cacheKey, cacheResponse);
  const result = json(data, 200, origin);
  result.headers.set("X-Cache", "MISS");
  return result;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders(origin) });
    if (origin && !ALLOWED_ORIGINS.has(origin)) return json({ error: "Origin not allowed" }, 403);

    const url = new URL(request.url);
    if (url.pathname === "/orderbook") return orderbook(url, origin);

    if (rateLimited(request)) return json({ error: "Too many requests" }, 429, origin);

    if (url.pathname === "/health") return json({ ok: true }, 200, origin);
    if (url.pathname === "/price") return cmc(env, origin);
    return json({ error: "Not found" }, 404, origin);
  },
};
