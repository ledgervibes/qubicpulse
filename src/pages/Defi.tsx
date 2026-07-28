import { useEffect, useState } from "react";
import { usePriceStore } from "../stores/priceStore";
import { formatCurrency, formatPercent, formatBalance } from "../utils/format";
import { TrendingUp, TrendingDown, ExternalLink, Clock, Layers, Activity, Loader2 } from "lucide-react";
import type { PriceHistory } from "../types";
import { getPriceHistory } from "../services/coingecko";
import { getTopAssets } from "../services/qx-contract";
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

interface TopAsset {
  name: string;
  transfers: number;
  volume: number;
}

export function Defi() {
  const price = usePriceStore((s) => s.price);
  const [volumeHistory, setVolumeHistory] = useState<PriceHistory | null>(null);
  const [tickInfo, setTickInfo] = useState<{ currentTick: number; epoch: number } | null>(null);
  const [topAssets, setTopAssets] = useState<TopAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [showAllAssets, setShowAllAssets] = useState(false);

  useEffect(() => {
    getPriceHistory(7).then(setVolumeHistory).catch(() => {});
    rpc.getStatus().then(setTickInfo).catch(() => {});
    getTopAssets()
      .then(setTopAssets)
      .catch(() => {})
      .finally(() => setLoadingAssets(false));
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
      icon: <Activity className="w-4 h-4" />,
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
          <div key={stat.label} className="glass-card p-5">
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

      {/* Top Assets on QX */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-text-primary text-lg">
            Top Assets on QX DEX
          </h3>
          {topAssets.length > 10 && (
            <button 
              onClick={() => setShowAllAssets(!showAllAssets)}
              className="text-xs text-qubic-cyan hover:text-qubic-cyan-light transition-colors font-medium"
            >
              {showAllAssets ? "Show Less ←" : "View All →"}
            </button>
          )}
        </div>
        {loadingAssets ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-qubic-cyan animate-spin" />
          </div>
        ) : topAssets.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">
            No asset data available
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-bg-hover">
                  <th className="text-left text-xs text-text-muted font-medium py-2 px-3">
                    #
                  </th>
                  <th className="text-left text-xs text-text-muted font-medium py-2 px-3">
                    Asset
                  </th>
                  <th className="text-right text-xs text-text-muted font-medium py-2 px-3">
                    Transfers (24h)
                  </th>
                  <th className="text-right text-xs text-text-muted font-medium py-2 px-3">
                    Volume
                  </th>
                </tr>
              </thead>
              <tbody>
                {topAssets.slice(0, showAllAssets ? 20 : 10).map((asset, i) => (
                  <tr
                    key={asset.name}
                    className="border-b border-bg-hover/50 hover:bg-bg-elevated/30 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-sm text-text-muted">
                      {i + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-qubic-gold/10 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-qubic-gold">
                            {asset.name.slice(0, 2)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-text-primary">
                          {asset.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right text-sm text-text-secondary">
                      {asset.transfers.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-sm text-text-secondary">
                      {formatBalance(asset.volume)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
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
                    background: "rgba(17, 24, 39, 0.95)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(37, 202, 217, 0.2)",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                    fontSize: "13px",
                    padding: "8px 12px",
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), "Volume"]}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="font-heading font-semibold text-text-primary mb-4 text-lg">
            Qubic Ecosystem
          </h3>
          <div className="space-y-2">
            {[
              { name: "QX (Qubic Exchange)", desc: "Decentralized exchange", url: "https://qx.qubic.org" },
              { name: "QubicSwap", desc: "Token swap platform", url: "https://qubicswap.org" },
              { name: "Qubic Explorer", desc: "Blockchain explorer", url: "https://explorer.qubic.org" },
              { name: "Qubic Wallet", desc: "Official web wallet", url: "https://wallet.qubic.org" },
            ].map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-elevated/50 transition-colors group"
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
              With a peak TPS of 15.5M (verified by CertiK), Qubic is the
              fastest blockchain ever, enabling high-frequency trading and
              real-time DeFi operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
