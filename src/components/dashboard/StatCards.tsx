import { usePriceStore } from "../../stores/priceStore";
import { formatCurrency, formatPercent } from "../../utils/format";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

export function StatCards() {
  const price = usePriceStore((s) => s.price);

  const cards = [
    {
      label: "QUBIC Price",
      value: price ? formatCurrency(price.usd) : "—",
      change: price?.usd_24h_change,
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      label: "24h Change",
      value: price ? formatPercent(price.usd_24h_change) : "—",
      change: price?.usd_24h_change,
      icon:
        (price?.usd_24h_change ?? 0) >= 0 ? (
          <TrendingUp className="w-5 h-5" />
        ) : (
          <TrendingDown className="w-5 h-5" />
        ),
    },
    {
      label: "Market Cap",
      value: price ? formatCurrency(price.usd_market_cap, "USD") : "—",
      icon: <Activity className="w-5 h-5" />,
    },
    {
      label: "BTC Price",
      value: price ? `${price.btc.toFixed(12)} BTC` : "—",
      icon: <span className="text-sm font-bold">₿</span>,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-bg-hover bg-bg-surface p-5 hover:border-qubic-cyan/30 hover:shadow-[0_0_20px_rgba(37,202,217,0.08)] transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-muted">{card.label}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-qubic-cyan/10 text-qubic-cyan">
              {card.icon}
            </div>
          </div>
          <div className="text-xl font-heading font-semibold text-text-primary">
            {card.value}
          </div>
          {card.change !== undefined && (
            <div
              className={`mt-1 text-xs font-medium ${
                card.change >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {formatPercent(card.change)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
