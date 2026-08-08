import type { PriceData } from "../types";

export async function getPrice(): Promise<PriceData> {
  throw new Error("CoinMarketCap must be called from a server-side proxy");
}
