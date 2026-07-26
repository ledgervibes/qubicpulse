import { CMC_API_KEY } from "../utils/constants";
import type { PriceData } from "../types";

interface CMCQuoteResponse {
  data: {
    QUBIC: {
      quote: {
        USD: {
          price: number;
          market_cap: number;
          percent_change_24h: number;
        };
      };
    };
    BTC?: {
      quote: {
        USD: { price: number };
      };
    };
    ETH?: {
      quote: {
        USD: { price: number };
      };
    };
  };
}

export async function getPrice(): Promise<PriceData> {
  const headers = { "X-CMC_PRO_API_KEY": CMC_API_KEY };

  const [qubicRes, btcEthRes] = await Promise.all([
    fetch(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=QUBIC&convert=USD",
      { headers }
    ),
    fetch(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC,ETH&convert=USD",
      { headers }
    ),
  ]);

  if (!qubicRes.ok) throw new Error(`CMC QUBIC error: ${qubicRes.status}`);
  if (!btcEthRes.ok) throw new Error(`CMC BTC/ETH error: ${btcEthRes.status}`);

  const qubicData: CMCQuoteResponse = await qubicRes.json();
  const btcEthData: CMCQuoteResponse = await btcEthRes.json();

  const qubicPrice = qubicData.data.QUBIC.quote.USD.price;
  const btcPrice = btcEthData.data.BTC?.quote.USD.price ?? 0;
  const ethPrice = btcEthData.data.ETH?.quote.USD.price ?? 0;

  return {
    usd: qubicPrice,
    usd_24h_change: qubicData.data.QUBIC.quote.USD.percent_change_24h,
    usd_market_cap: qubicData.data.QUBIC.quote.USD.market_cap,
    btc: btcPrice > 0 ? qubicPrice / btcPrice : 0,
    eth: ethPrice > 0 ? qubicPrice / ethPrice : 0,
  };
}
