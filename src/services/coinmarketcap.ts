import type { PriceData } from "../types";
import { CMC_API_URL } from "../utils/constants";

export async function getPrice(): Promise<PriceData> {
  if (!CMC_API_URL) {
    throw new Error("CoinMarketCap is not configured");
  }

  const res = await fetch(`${CMC_API_URL.replace(/\/$/, "")}/price`);
  if (!res.ok) throw new Error(`CoinMarketCap proxy error: ${res.status}`);
  return res.json();
}
