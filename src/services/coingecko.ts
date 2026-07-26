import { COINGECKO_API_URL, QUBIC_COINGECKO_ID } from "../utils/constants";
import type { PriceData, PriceHistory } from "../types";

async function fetchCoinGecko<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${COINGECKO_API_URL}${endpoint}`);
  if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
  return res.json();
}

export async function getPrice(): Promise<PriceData> {
  const data = await fetchCoinGecko<Record<string, PriceData>>(
    `/simple/price?ids=${QUBIC_COINGECKO_ID}&vs_currencies=usd,btc,eth&include_24hr_change=true&include_market_cap=true`
  );
  return data[QUBIC_COINGECKO_ID];
}

export async function getPriceHistory(
  days: number = 7
): Promise<PriceHistory> {
  return fetchCoinGecko<PriceHistory>(
    `/coins/${QUBIC_COINGECKO_ID}/market_chart?vs_currency=usd&days=${days}`
  );
}
