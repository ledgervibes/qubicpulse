import type { PriceData } from "../types";

const COINPAPRIKA_ID = "qu-qubic";

interface CoinPaprikaResponse {
  quotes: {
    USD: {
      price: number;
      market_cap: number;
      percent_change_24h: number;
    };
    BTC: { price: number };
    ETH: { price: number };
  };
}

export async function getPrice(): Promise<PriceData> {
  const res = await fetch(
    `https://api.coinpaprika.com/v1/tickers/${COINPAPRIKA_ID}/?quotes=USD,BTC,ETH`
  );
  if (!res.ok) throw new Error(`CoinPaprika error: ${res.status}`);
  const data: CoinPaprikaResponse = await res.json();

  return {
    usd: data.quotes.USD.price,
    usd_24h_change: data.quotes.USD.percent_change_24h,
    usd_market_cap: data.quotes.USD.market_cap,
    btc: data.quotes.BTC.price,
    eth: data.quotes.ETH.price,
  };
}
