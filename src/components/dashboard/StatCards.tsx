import { usePriceStore } from "../../stores/priceStore";
import { formatCurrency, formatPercent } from "../../utils/format";
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3 } from "lucide-react";
import { Sparkline } from "../ui/Sparkline";

export function StatCards() {
  const price = usePriceStore((s) => s.price);
  const history = usePriceStore((s) => s.history);
  const loading = usePriceStore((s) => s.loading);

  const sparkData = history?.prices?.map(([, p]) => p) ?? [];
  const isPositive = (price?.usd_24h_change ?? 0) >= 0;

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
        isPositive ? (
          <TrendingUp className="w-5 h-5" />
        ) : (
          <TrendingDown className="w-5 h-5" />
        ),
    },
    {
      label: "Market Cap",
      value: price ? formatCurrency(price.usd_market_cap) : "—",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: "7d Trend",
      value: sparkData.length > 0 ? "" : "—",
      icon: <Activity className="w-5 h-5" />,
      sparkline: sparkData,
    },
  ];

  if (loading && !price) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-bg-hover bg-bg-surface p-5 animate-pulse"
          >
            <div className="h-4 w-24 bg-bg-elevated rounded mb-3" />
            <div className="h-7 w-32 bg-bg-elevated rounded mb-2" />
            <div className="h-3 w-16 bg-bg-elevated rounded" />
          </div>
        ))}
      </div>
    );
  }

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
          {card.sparkline && card.sparkline.length > 0 && (
            <div className="mt-2">
              <Sparkline
                data={card.sparkline}
                width={120}
                height={32}
                positive={isPositive}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
