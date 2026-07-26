import type { PriceData, PriceHistory } from "../types";
import * as cg from "./coingecko";
import * as cp from "./coinpaprika";
import * as cmc from "./coinmarketcap";
import * as storage from "./storage";

const CACHE_KEY = "price_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedPrice {
  data: PriceData;
  timestamp: number;
}

function saveToCache(data: PriceData): void {
  storage.setItem<CachedPrice>(CACHE_KEY, { data, timestamp: Date.now() });
}

function readFromCache(): PriceData | null {
  const cached = storage.getItem<CachedPrice | null>(CACHE_KEY, null);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL) return null;
  return cached.data;
}

export async function getPrice(): Promise<PriceData | null> {
  // Try CoinGecko
  try {
    console.log("[PriceService] Trying CoinGecko...");
    const data = await cg.getPrice();
    saveToCache(data);
    return data;
  } catch (e) {
    console.warn("[PriceService] CoinGecko failed:", e);
  }

  // Try CoinPaprika
  try {
    console.log("[PriceService] Trying CoinPaprika...");
    const data = await cp.getPrice();
    saveToCache(data);
    return data;
  } catch (e) {
    console.warn("[PriceService] CoinPaprika failed:", e);
  }

  // Try CoinMarketCap
  try {
    console.log("[PriceService] Trying CoinMarketCap...");
    const data = await cmc.getPrice();
    saveToCache(data);
    return data;
  } catch (e) {
    console.warn("[PriceService] CoinMarketCap failed:", e);
  }

  // Try cache
  console.log("[PriceService] All APIs failed, trying cache...");
  const cached = readFromCache();
  if (cached) {
    console.log("[PriceService] Using cached data");
    return cached;
  }

  console.error("[PriceService] All sources failed, no data available");
  return null;
}

export async function getPriceHistory(days: number = 7): Promise<PriceHistory | null> {
  try {
    return await cg.getPriceHistory(days);
  } catch {
    console.warn("[PriceService] CoinGecko history failed, trying CoinPaprika...");
  }

  // CoinPaprika doesn't have a direct history endpoint in free tier
  // Return null if CoinGecko fails
  return null;
}
