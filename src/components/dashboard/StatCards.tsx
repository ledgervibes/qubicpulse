import { usePriceStore } from "../../stores/priceStore";
import { formatCurrency, formatPercent } from "../../utils/format";
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3 } from "lucide-react";
import { Sparkline } from "../ui/Sparkline";

interface Props {
  activePeriod?: number;
}

export function StatCards({ activePeriod = 7 }: Props) {
  const price = usePriceStore((s) => s.price);
  const history = usePriceStore((s) => s.history);
  const loading = usePriceStore((s) => s.loading);

  const sparkData = history?.prices?.map(([, p]) => p) ?? [];
  const isPositive = (price?.usd_24h_change ?? 0) >= 0;

  const periodLabel = `${activePeriod}d Trend`;

  const cards = [
    {
      label: "QUBIC Price",
      value: price ? formatCurrency(price.usd) : "—",
      sub: price ? `≈ ${price.btc.toFixed(12)} BTC` : "",
      change: price?.usd_24h_change,
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      label: "24h Change",
      value: price ? formatPercent(price.usd_24h_change) : "—",
      sub: "",
      change: price?.usd_24h_change,
      icon: isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />,
    },
    {
      label: "Market Cap",
      value: price ? formatCurrency(price.usd_market_cap) : "—",
      sub: "",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: periodLabel,
      value: "",
      sub: "",
      icon: <Activity className="w-5 h-5" />,
      sparkline: sparkData,
    },
  ];

  if (loading && !price) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="skeleton h-4 w-24 mb-3" />
            <div className="skeleton h-7 w-32 mb-2" />
            <div className="skeleton h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">{card.label}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-qubic-cyan/10 text-qubic-cyan">
              {card.icon}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-heading font-bold text-text-primary">
              {card.value}
            </div>
            {card.change !== undefined && (
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${card.change >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                {formatPercent(card.change)}
              </span>
            )}
          </div>
          {card.sub && (
            <div className="text-xs text-text-muted mt-1">{card.sub}</div>
          )}
          {card.sparkline && card.sparkline.length > 0 && (
            <div className="mt-3">
              <Sparkline data={card.sparkline} width={120} height={32} positive={isPositive} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
