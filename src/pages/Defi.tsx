import { usePriceStore } from "../stores/priceStore";
import { formatCurrency, formatPercent } from "../utils/format";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";

export function Defi() {
  const price = usePriceStore((s) => s.price);

  const stats = [
    {
      label: "Price",
      value: price ? formatCurrency(price.usd) : "—",
      change: price?.usd_24h_change,
    },
    {
      label: "Market Cap",
      value: price ? formatCurrency(price.usd_market_cap) : "—",
    },
    {
      label: "24h Change",
      value: price ? formatPercent(price.usd_24h_change) : "—",
      change: price?.usd_24h_change,
    },
    {
      label: "BTC Ratio",
      value: price ? `${price.btc.toFixed(12)} BTC` : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          DeFi
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Qubic ecosystem overview
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-bg-hover bg-bg-surface p-5"
          >
            <div className="text-sm text-text-muted mb-1">{stat.label}</div>
            <div className="text-lg font-heading font-semibold text-text-primary">
              {stat.value}
            </div>
            {stat.change !== undefined && (
              <div
                className={`mt-1 text-xs font-medium flex items-center gap-1 ${
                  stat.change >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {stat.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {formatPercent(stat.change)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-bg-hover bg-bg-surface p-5">
        <h3 className="font-heading font-semibold text-text-primary mb-4">
          Qubic Ecosystem
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              name: "QX (Qubic Exchange)",
              desc: "Decentralized exchange for Qubic assets",
              url: "https://qx.qubic.org",
            },
            {
              name: "QubicSwap",
              desc: "Token swap platform",
              url: "https://qubicswap.org",
            },
            {
              name: "Qubic Explorer",
              desc: "Blockchain explorer",
              url: "https://explorer.qubic.org",
            },
            {
              name: "Qubic Wallet",
              desc: "Official web wallet",
              url: "https://wallet.qubic.org",
            },
          ].map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg border border-bg-hover hover:border-qubic-cyan/30 hover:shadow-[0_0_20px_rgba(37,202,217,0.08)] transition-all duration-200 group"
            >
              <div>
                <div className="text-sm font-medium text-text-primary group-hover:text-qubic-cyan transition-colors">
                  {item.name}
                </div>
                <div className="text-xs text-text-muted">{item.desc}</div>
              </div>
              <ExternalLink className="w-4 h-4 text-text-disabled group-hover:text-qubic-cyan transition-colors" />
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-bg-hover bg-bg-surface p-5">
        <h3 className="font-heading font-semibold text-text-primary mb-4">
          About Qubic DeFi
        </h3>
        <div className="space-y-3 text-sm text-text-secondary">
          <p>
            Qubic offers feeless transactions with instant finality, making it
            ideal for DeFi applications. The QX contract (contract index 1) is
            the primary decentralized exchange on the network.
          </p>
          <p>
            Smart contracts on Qubic are deployed through an IPO (Initial Public
            Offering) model, where community members can invest in contract
            shares and earn passive income from contract operations.
          </p>
          <p>
            With a peak TPS of 15.5M (verified by CertiK), Qubic is the
            fastest blockchain ever, enabling high-frequency trading and
            real-time DeFi operations.
          </p>
        </div>
      </div>
    </div>
  );
}
