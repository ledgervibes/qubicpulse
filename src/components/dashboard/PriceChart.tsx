import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { usePriceStore } from "../../stores/priceStore";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const PERIODS = [
  { label: "24h", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export function PriceChart() {
  const history = usePriceStore((s) => s.history);
  const fetchHistory = usePriceStore((s) => s.fetchHistory);
  const loading = usePriceStore((s) => s.loading);
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

  const minPrice = data.length > 0 ? Math.min(...data.map((d) => d.price)) : 0;
  const maxPrice = data.length > 0 ? Math.max(...data.map((d) => d.price)) : 0;

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading font-semibold text-text-primary text-lg">
            Price Chart
          </h3>
          {data.length > 0 && (
            <div className="flex gap-4 mt-1">
              <span className="text-xs text-success font-medium">
                H: ${maxPrice.toFixed(8)}
              </span>
              <span className="text-xs text-danger font-medium">
                L: ${minPrice.toFixed(8)}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-1 bg-bg-elevated/50 rounded-lg p-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => handlePeriodChange(p.days)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activePeriod === p.days
                  ? "bg-qubic-cyan text-bg-deep shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64">
        {loading && data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-qubic-cyan animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-text-muted">No price data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#25CAD9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#25CAD9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.03)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 11 }}
                tickFormatter={(v: number) => `$${v.toFixed(6)}`}
                domain={["auto", "auto"]}
                width={75}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(17, 24, 39, 0.95)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(37, 202, 217, 0.2)",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                  fontSize: "13px",
                  padding: "8px 12px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
                }}
                formatter={(value) => [`$${Number(value).toFixed(8)}`, "Price"]}
                labelStyle={{ color: "#9CA3AF", marginBottom: "4px" }}
                cursor={{ stroke: "#25CAD9", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#25CAD9"
                strokeWidth={2}
                fill="url(#priceGradient)"
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
