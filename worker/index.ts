interface Env {
  TELEGRAM_BOT_TOKEN: string;
  CMC_API_KEY: string;
}

const ALLOWED_ORIGINS = new Set([
  "https://qubicpulse.pages.dev",
  "http://localhost:5173",
]);
const MAX_BODY_BYTES = 8_192;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const CMC_CACHE_TTL_SECONDS = 60;
const requestCounts = new Map<string, { count: number; expiresAt: number }>();

function corsHeaders(origin: string | null): Headers {
  const headers = new Headers({
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  const contentLength = Number(request.headers.get("Content-Length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) return null;
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) return null;
  try {
    const value: unknown = JSON.parse(body);
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function validChatId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9-]{1,32}$/.test(value);
}

async function telegram(request: Request, env: Env, method: string, origin: string | null): Promise<Response> {
  if (method !== "sendMessage") return json({ error: "Method not allowed" }, 405, origin);
  const body = await readJson(request);
  if (!body || !validChatId(body.chat_id) || typeof body.text !== "string" || body.text.length < 1 || body.text.length > 4_000) {
    return json({ error: "Invalid Telegram payload" }, 400, origin);
  }
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: body.chat_id,
      text: body.text,
      parse_mode: body.parse_mode === "HTML" || body.parse_mode === "Markdown" ? body.parse_mode : undefined,
    }),
  });
  if (!response.ok) return json({ error: "Telegram request failed" }, 502, origin);
  const data = await response.json<unknown>();
  return json(data, 200, origin);
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders(origin) });
    if (origin && !ALLOWED_ORIGINS.has(origin)) return json({ error: "Origin not allowed" }, 403);
    if (rateLimited(request)) return json({ error: "Too many requests" }, 429, origin);

    const url = new URL(request.url);
    if (url.pathname === "/health") return json({ ok: true }, 200, origin);
    if (url.pathname === "/price") return cmc(env, origin);
    if (url.pathname.startsWith("/telegram/")) {
      if (!origin || !ALLOWED_ORIGINS.has(origin)) {
        return json({ error: "Origin required" }, 403);
      }
      return telegram(request, env, url.pathname.slice("/telegram/".length), origin);
    }
    return json({ error: "Not found" }, 404, origin);
  },
};
