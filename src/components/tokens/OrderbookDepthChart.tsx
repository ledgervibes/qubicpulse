import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { OrderBook } from "../../services/orderbook";

interface DepthPoint {
  price: number;
  bidDepth: number | null;
  askDepth: number | null;
  cumulative: number;
}

interface OrderbookDepthChartProps {
  orderbook: OrderBook;
}

export function OrderbookDepthChart({ orderbook }: OrderbookDepthChartProps) {
  const data = useMemo(() => {
    const mid =
      orderbook.midPrice ?? orderbook.bestAsk ?? orderbook.bestBid ?? 0;
    if (mid <= 0) return [];

    const bids = orderbook.bids.slice(0, 40);
    const asks = orderbook.asks.slice(0, 40);

    const bidPoints: DepthPoint[] = [];
    const askPoints: DepthPoint[] = [];

    let bidCumulative = 0;
    for (let i = bids.length - 1; i >= 0; i--) {
      bidCumulative += bids[i].numberOfShares;
      bidPoints.push({
        price: bids[i].price,
        bidDepth: bidCumulative,
        askDepth: null,
        cumulative: bidCumulative,
      });
    }

    let askCumulative = 0;
    for (const ask of asks) {
      askCumulative += ask.numberOfShares;
      askPoints.push({
        price: ask.price,
        bidDepth: null,
        askDepth: askCumulative,
        cumulative: askCumulative,
      });
    }

    const midpoint: DepthPoint = {
      price: mid,
      bidDepth: bidCumulative,
      askDepth: askCumulative,
      cumulative: Math.max(bidCumulative, askCumulative),
    };

    return [...bidPoints, midpoint, ...askPoints];
  }, [orderbook]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-muted">
        No orderbook depth available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="bidGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="askGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border, rgba(255,255,255,0.08))"
            vertical={false}
          />
          <XAxis
            dataKey="price"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v: number) => {
              if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
              if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
              if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
              return v.toLocaleString();
            }}
            tick={{ fill: "var(--color-text-muted, #9ca3af)", fontSize: 11 }}
            stroke="transparent"
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => {
              if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
              if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
              return v.toLocaleString();
            }}
            tick={{ fill: "var(--color-text-muted, #9ca3af)", fontSize: 11 }}
            stroke="transparent"
            tickLine={false}
            width={52}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-bg-elevated, #161b22)",
              border: "1px solid var(--color-border, rgba(255,255,255,0.1))",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(label) =>
              `Price: ${Number(label).toLocaleString()} QU`
            }
            formatter={(value) => [
              (value as number).toLocaleString(),
              "Cumulative shares",
            ]}
          />
          <Area
            type="monotone"
            dataKey="bidDepth"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#bidGradient)"
            connectNulls
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="askDepth"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#askGradient)"
            connectNulls
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
