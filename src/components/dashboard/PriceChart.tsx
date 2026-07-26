import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePriceStore } from "../../stores/priceStore";
import { useState } from "react";

const PERIODS = [
  { label: "24h", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export function PriceChart() {
  const history = usePriceStore((s) => s.history);
  const fetchHistory = usePriceStore((s) => s.fetchHistory);
  const [activePeriod, setActivePeriod] = useState(7);

  const data =
    history?.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      price,
    })) ?? [];

  const handlePeriodChange = (days: number) => {
    setActivePeriod(days);
    fetchHistory(days);
  };

  return (
    <div className="rounded-xl border border-bg-hover bg-bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-text-primary">
          Price Chart
        </h3>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => handlePeriodChange(p.days)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activePeriod === p.days
                  ? "bg-qubic-cyan/10 text-qubic-cyan"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#25CAD9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#25CAD9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickFormatter={(v: number) => `$${v.toFixed(6)}`}
              domain={["auto", "auto"]}
              width={80}
            />
            <Tooltip
              contentStyle={{
                background: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#F9FAFB",
                fontSize: "13px",
              }}
              formatter={(value) => [`$${Number(value).toFixed(8)}`, "Price"]}
              labelStyle={{ color: "#9CA3AF" }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#25CAD9"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
