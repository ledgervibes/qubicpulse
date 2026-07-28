import { useEffect, useState } from "react";
import { usePriceStore } from "../stores/priceStore";
import { formatCurrency, formatPercent } from "../utils/format";
import { TrendingUp, TrendingDown, ExternalLink, BarChart3, Clock, Layers } from "lucide-react";
import type { PriceHistory } from "../types";
import { getPriceHistory } from "../services/coingecko";
import * as rpc from "../services/qubic-rpc";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function Defi() {
  const price = usePriceStore((s) => s.price);
  const [volumeHistory, setVolumeHistory] = useState<PriceHistory | null>(null);
  const [tickInfo, setTickInfo] = useState<{ currentTick: number; epoch: number } | null>(null);

  useEffect(() => {
    getPriceHistory(7).then(setVolumeHistory).catch(() => {});
    rpc.getStatus().then(setTickInfo).catch(() => {});
  }, []);

  const volumeData =
    volumeHistory?.total_volumes?.map(([timestamp, vol]) => ({
      date: new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      volume: vol,
    })) ?? [];

  const stats = [
    {
      label: "Price",
      value: price ? formatCurrency(price.usd) : "—",
      change: price?.usd_24h_change,
      icon: <span className="text-sm font-bold">$</span>,
    },
    {
      label: "Market Cap",
      value: price ? formatCurrency(price.usd_market_cap) : "—",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      label: "24h Change",
      value: price ? formatPercent(price.usd_24h_change) : "—",
      change: price?.usd_24h_change,
      icon:
        (price?.usd_24h_change ?? 0) >= 0 ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        ),
    },
    {
      label: "Current Tick",
      value: tickInfo ? tickInfo.currentTick.toLocaleString() : "—",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      label: "Epoch",
      value: tickInfo ? tickInfo.epoch.toString() : "—",
      icon: <Layers className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          DeFi
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Qubic ecosystem market data
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted">{stat.label}</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-qubic-cyan/10 text-qubic-cyan">
                {stat.icon}
              </div>
            </div>
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

      {volumeData.length > 0 && (
        <div className="chart-container">
          <h3 className="font-heading font-semibold text-text-primary mb-4 text-lg">
            7-Day Volume
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFDEA1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FFDEA1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1F2937"
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
                  tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`}
                  width={55}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                    fontSize: "13px",
                    padding: "8px 12px",
                  }}
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    "Volume",
                  ]}
                  labelStyle={{ color: "#9CA3AF", marginBottom: "4px" }}
                  cursor={{ stroke: "#FFDEA1", strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#FFDEA1"
                  strokeWidth={2}
                  fill="url(#volGradient)"
                  animationDuration={1000}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="glass-card p-5">
        <h3 className="font-heading font-semibold text-text-primary mb-4 text-lg">
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
            {
              name: "Qubic Docs",
              desc: "Developer documentation",
              url: "https://docs.qubic.org",
            },
            {
              name: "CoinGecko",
              desc: "QUBIC market data",
              url: "https://www.coingecko.com/en/coins/qubic-network",
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

      <div className="glass-card p-5">
        <h3 className="font-heading font-semibold text-text-primary mb-4 text-lg">
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
