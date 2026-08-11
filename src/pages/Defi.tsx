import { useEffect, useState } from "react";
import { usePriceStore } from "../stores/priceStore";
import {
  formatCompact,
  formatCurrency,
  formatPercent,
} from "../utils/format";
import {
  Activity,
  BarChart3,
  Clock,
  ExternalLink,
  Layers,
  Loader2,
  Radar,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { PriceHistory } from "../types";
import { getPriceHistory } from "../services/coingecko";
import * as rpc from "../services/qubic-rpc";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type LoadState = "loading" | "ready" | "error";

const ECOSYSTEM_LINKS = [
  {
    name: "QX",
    desc: "Native asset exchange",
    url: "https://qx.qubic.org",
  },
  {
    name: "QubicSwap",
    desc: "Token swap platform",
    url: "https://qubicswap.org",
  },
  {
    name: "Explorer",
    desc: "Inspect network activity",
    url: "https://explorer.qubic.org",
  },
  {
    name: "Qubic Wallet",
    desc: "Official web wallet",
    url: "https://wallet.qubic.org",
  },
] as const;

export function Defi() {
  const price = usePriceStore((s) => s.price);
  const priceError = usePriceStore((s) => s.error);
  const lastFetched = usePriceStore((s) => s.lastFetched);
  const fetchPrice = usePriceStore((s) => s.fetchPrice);

  const [volumeHistory, setVolumeHistory] = useState<PriceHistory | null>(null);
  const [volumeState, setVolumeState] = useState<LoadState>("loading");
  const [tickInfo, setTickInfo] = useState<{
    currentTick: number;
    epoch: number;
  } | null>(null);

  useEffect(() => {
    getPriceHistory(7)
      .then((history) => {
        setVolumeHistory(history);
        setVolumeState("ready");
      })
      .catch(() => setVolumeState("error"));

    rpc.getStatus().then(setTickInfo).catch(() => {});
  }, []);

  const volumeData =
    volumeHistory?.total_volumes?.map(([timestamp, volume]) => ({
      date: new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      volume,
    })) ?? [];

  const latestVolume = volumeData.at(-1)?.volume;
  const pricePositive = (price?.usd_24h_change ?? 0) >= 0;
  const marketUpdatedLabel = lastFetched
    ? new Date(lastFetched).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-qubic-cyan">
            <Radar className="h-3.5 w-3.5" />
            Ecosystem intelligence
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            What is moving on Qubic?
          </h1>
          <p className="mt-2 text-sm text-text-muted sm:text-base">
            Market context and live network position.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="h-2 w-2 rounded-full bg-success" />
          {marketUpdatedLabel
            ? `Market updated ${marketUpdatedLabel}`
            : "Waiting for market data"}
        </div>
      </header>

      <section className="hero-surface p-5 sm:p-7" aria-labelledby="market-pulse-title">
        <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-qubic-cyan/10" />
        <div className="relative grid gap-7 lg:grid-cols-[1.25fr_1fr] lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-qubic-cyan">
              <Activity className="h-3.5 w-3.5" />
              Market pulse
            </div>
            <h2 id="market-pulse-title" className="font-heading text-sm font-medium text-text-muted">
              QUBIC price
            </h2>
            <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-2">
              <span className="font-heading text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
                {price ? formatCurrency(price.usd) : "—"}
              </span>
              {price && (
                <span
                  className={`mb-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold ${
                    pricePositive
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  }`}
                >
                  {pricePositive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {formatPercent(price.usd_24h_change)}
                  <span className="sr-only">in the last 24 hours</span>
                </span>
              )}
            </div>
            <p className="mt-3 text-xs leading-5 text-text-muted">
              24-hour market movement from the active public price source.
            </p>
            {!price && priceError && (
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-warning">
                Market price is temporarily unavailable.
                <button onClick={() => fetchPrice()} className="btn-tertiary text-warning">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5">
            <div className="bg-bg-deep/55 p-4">
              <div className="text-[10px] uppercase tracking-[0.13em] text-text-muted">
                Market cap
              </div>
              <div className="mt-2 font-heading text-xl font-semibold text-text-primary">
                {price ? formatCurrency(price.usd_market_cap) : "—"}
              </div>
            </div>
            <div className="bg-bg-deep/55 p-4">
              <div className="text-[10px] uppercase tracking-[0.13em] text-text-muted">
                Latest volume
              </div>
              <div className="mt-2 font-heading text-xl font-semibold text-text-primary">
                {latestVolume !== undefined ? formatCurrency(latestVolume) : "—"}
              </div>
            </div>
            <div className="col-span-2 flex items-center justify-between gap-4 bg-bg-deep/35 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Clock className="h-3.5 w-3.5 text-qubic-cyan" />
                Tick
                <span className="font-mono text-text-primary">
                  {tickInfo?.currentTick.toLocaleString() ?? "—"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Layers className="h-3.5 w-3.5 text-qubic-gold" />
                Epoch
                <span className="font-mono text-text-primary">
                  {tickInfo?.epoch ?? "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="chart-container" aria-labelledby="volume-title">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-qubic-gold">
              Market liquidity context
            </div>
            <h2 id="volume-title" className="font-heading text-xl font-semibold text-text-primary">
              Reported volume snapshots
            </h2>
            <p className="mt-1 text-xs text-text-muted">Seven-day history from CoinGecko.</p>
          </div>
          {latestVolume !== undefined && (
            <div className="sm:text-right">
              <div className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Latest snapshot</div>
              <div className="mt-1 font-heading text-xl font-semibold text-text-primary">
                {formatCurrency(latestVolume)}
              </div>
            </div>
          )}
        </div>

        {volumeState === "loading" ? (
          <div className="flex h-56 items-center justify-center gap-3 text-sm text-text-muted">
            <Loader2 className="h-5 w-5 animate-spin text-qubic-gold" />
            Loading volume history
          </div>
        ) : volumeState === "error" || volumeData.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-bg-hover text-center">
            <BarChart3 className="h-6 w-6 text-text-disabled" />
            <p className="mt-3 text-sm text-text-muted">Volume history is temporarily unavailable.</p>
          </div>
        ) : (
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFDEA1" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#FFDEA1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--text-disabled)", fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--text-disabled)", fontSize: 11 }}
                  tickFormatter={(value: number) => `$${formatCompact(value)}`}
                  width={58}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--bg-hover)",
                    borderRadius: "10px",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    padding: "8px 12px",
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), "Reported volume"]}
                  labelStyle={{ color: "var(--text-muted)", marginBottom: "4px" }}
                  cursor={{ stroke: "#FFDEA1", strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#FFDEA1"
                  strokeWidth={2}
                  fill="url(#volGradient)"
                  animationDuration={700}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section aria-labelledby="ecosystem-title">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-qubic-cyan">
              Continue exploring
            </div>
            <h2 id="ecosystem-title" className="mt-1 font-heading text-xl font-semibold text-text-primary">
              Qubic ecosystem
            </h2>
          </div>
          <p className="hidden max-w-sm text-right text-xs leading-5 text-text-muted sm:block">
            External tools open in a new tab. QubicPulse does not execute trades or connect wallets here.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ECOSYSTEM_LINKS.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="data-surface group flex min-h-24 items-center justify-between gap-4 p-4"
            >
              <div>
                <div className="text-sm font-semibold text-text-primary transition-colors group-hover:text-qubic-cyan">
                  {item.name}
                </div>
                <div className="mt-1 text-xs text-text-muted">{item.desc}</div>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-text-disabled transition-colors group-hover:text-qubic-cyan" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
