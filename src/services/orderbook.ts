import { querySmartContract } from "./qubic-rpc";
import { QUBIC_API_URL } from "../utils/constants";

const QX_CONTRACT_INDEX = 1;
const QX_GET_ASSET_ASK_ORDER = 2;
const QX_GET_ASSET_BID_ORDER = 3;
const REQUEST_SIZE = 48;
const ORDER_SIZE = 48;
const MAX_ORDERS = 256;
const CACHE_TTL_MS = 60_000;

export interface OrderBookEntry {
  price: number;
  numberOfShares: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  bestBid: number | null;
  bestAsk: number | null;
  midPrice: number | null;
  loadedAt: number;
}

const cache = new Map<string, OrderBook>();

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

function buildRequestData(issuer: string, assetName: string, offset: number): Uint8Array {
  const data = new Uint8Array(REQUEST_SIZE);
  data.set(identityToBytes(issuer), 0);
  const encoder = new TextEncoder();
  const nameBytes = encoder.encode(assetName.toUpperCase());
  data.set(nameBytes.subarray(0, 8), 32);
  const offsetView = new DataView(data.buffer, 40, 8);
  offsetView.setBigUint64(0, BigInt(offset), true);
  return data;
}

function parseOrders(response: Uint8Array): OrderBookEntry[] {
  const entries: OrderBookEntry[] = [];
  const view = new DataView(response.buffer, response.byteOffset, response.byteLength);
  for (let i = 0; i < MAX_ORDERS; i++) {
    const offset = i * ORDER_SIZE;
    if (offset + ORDER_SIZE > response.byteLength) break;
    const numberOfShares = Number(view.getBigInt64(offset + 40, true));
    if (numberOfShares <= 0) continue;
    const price = Number(view.getBigInt64(offset + 32, true));
    entries.push({ price, numberOfShares });
  }
  return entries;
}

export function clearOrderBookCache(): void {
  cache.clear();
}

function buildOrderBook(
  askEntries: OrderBookEntry[],
  bidEntries: OrderBookEntry[]
): OrderBook {
  const asks = [...askEntries].sort((a, b) => a.price - b.price);
  const bids = [...bidEntries].sort((a, b) => b.price - a.price);
  const bestAsk = asks.length > 0 ? asks[0].price : null;
  const bestBid = bids.length > 0 ? bids[0].price : null;
  const midPrice =
    bestBid !== null && bestAsk !== null
      ? (bestBid + bestAsk) / 2
      : bestBid ?? bestAsk;
  return { bids, asks, bestBid, bestAsk, midPrice, loadedAt: Date.now() };
}

async function fetchOrderBookFromWorker(
  issuer: string,
  assetName: string
): Promise<OrderBook | null> {
  if (!QUBIC_API_URL) return null;
  const url = new URL(`${QUBIC_API_URL.replace(/\/$/, "")}/orderbook`);
  url.searchParams.set("name", assetName.toUpperCase());
  url.searchParams.set("issuer", issuer);
  const response = await fetch(url.toString());
  if (!response.ok) return null;
  const data = (await response.json()) as Omit<OrderBook, "loadedAt">;
  return { ...data, loadedAt: Date.now() };
}

export async function fetchOrderBook(
  issuer: string,
  assetName: string
): Promise<OrderBook> {
  const cacheKey = `${issuer}:${assetName.toUpperCase()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.loadedAt < CACHE_TTL_MS) {
    return cached;
  }

  const fromWorker = await fetchOrderBookFromWorker(issuer, assetName);
  if (fromWorker) {
    cache.set(cacheKey, fromWorker);
    return fromWorker;
  }

  const requestData = buildRequestData(issuer, assetName, 0);

  const [askResponse, bidResponse] = await Promise.all([
    querySmartContract(
      QX_CONTRACT_INDEX,
      QX_GET_ASSET_ASK_ORDER,
      REQUEST_SIZE,
      requestData,
      (data) => data
    ),
    querySmartContract(
      QX_CONTRACT_INDEX,
      QX_GET_ASSET_BID_ORDER,
      REQUEST_SIZE,
      requestData,
      (data) => data
    ),
  ]);

  const orderBook = buildOrderBook(
    parseOrders(askResponse),
    parseOrders(bidResponse)
  );

  cache.set(cacheKey, orderBook);
  return orderBook;
}

export async function fetchOrderBooksInChunks(
  assets: Array<{ name: string; issuer: string }>,
  chunkSize: number,
  concurrency: number,
  onChunk: (orderBooks: Map<string, OrderBook>) => void,
  delayBetweenChunksMs = 0
): Promise<void> {
  for (let start = 0; start < assets.length; start += chunkSize) {
    const chunk = assets.slice(start, start + chunkSize);
    const results = new Map<string, OrderBook>();
    let index = 0;

    async function worker(): Promise<void> {
      while (index < chunk.length) {
        const asset = chunk[index];
        index += 1;
        try {
          const orderBook = await fetchOrderBook(asset.issuer, asset.name);
          results.set(asset.name.toUpperCase(), orderBook);
        } catch {
          // skip assets whose orderbook cannot be loaded
        }
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(concurrency, chunk.length) }, () => worker())
    );
    onChunk(results);
    if (delayBetweenChunksMs > 0 && start + chunkSize < assets.length) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenChunksMs));
    }
  }
}
