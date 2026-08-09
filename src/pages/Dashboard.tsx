import { useState } from "react";
import { PriceChart } from "../components/dashboard/PriceChart";
import { StatCards } from "../components/dashboard/StatCards";
import { PortfolioSummary } from "../components/dashboard/PortfolioSummary";
import { EpochCountdown } from "../components/dashboard/EpochCountdown";
import { usePriceStore } from "../stores/priceStore";
import { formatCurrency, formatPercent } from "../utils/format";
import { Activity, ArrowUpRight, Database, Radio } from "lucide-react";

export function Dashboard() {
  const [activePeriod, setActivePeriod] = useState(7);
  const price = usePriceStore((s) => s.price);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-qubic-cyan">
            <Radio className="h-3.5 w-3.5" />
            Network observatory / 01
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
            Qubic, in motion.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-muted sm:text-base">
            Read the network pulse before you make your next move.
          </p>
        </div>
        <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted sm:flex">
          <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse-slow" />
          Live feed
        </div>
      </div>

      <section className="observatory-shell" aria-label="Qubic network overview">
        <div className="observatory-grid pointer-events-none absolute inset-0" />
        <div className="relative grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[380px] overflow-hidden border-b border-white/10 p-6 sm:p-9 lg:border-b-0 lg:border-r">
            <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 sm:h-[430px] sm:w-[430px]">
              <div className="orbit-ring absolute inset-0" />
              <div className="orbit-ring absolute inset-[12%]" />
              <div className="orbit-ring absolute inset-[27%] border-qubic-cyan/35" />
              <div className="observatory-glow absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-qubic-cyan/20 blur-2xl" />
              <div className="absolute left-1/2 top-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-qubic-cyan/45 bg-[#0b1a25]/90 shadow-[0_0_50px_rgba(37,202,217,0.22)]">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-qubic-cyan">Epoch</span>
                <span className="font-heading text-5xl font-semibold text-text-primary">225</span>
                <span className="mt-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" /> online</span>
              </div>
              <span className="absolute left-[8%] top-[42%] h-2 w-2 rounded-full bg-qubic-gold shadow-[0_0_16px_rgba(255,222,161,0.9)]" />
              <span className="absolute right-[15%] top-[18%] h-1.5 w-1.5 rounded-full bg-qubic-cyan shadow-[0_0_16px_rgba(97,240,254,0.9)]" />
              <span className="absolute bottom-[16%] right-[21%] h-2 w-2 rounded-full bg-qubic-cyan-light shadow-[0_0_16px_rgba(97,240,254,0.9)]" />
            </div>
            <div className="relative flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
              <span>Consensus layer</span>
              <span className="text-success">Stable</span>
            </div>
            <div className="absolute bottom-7 left-6 right-6 flex items-end justify-between font-mono text-[10px] text-text-muted sm:left-9 sm:right-9">
              <span>Epoch cycle</span>
              <span className="text-qubic-cyan">Network live</span>
            </div>
          </div>
          <div className="relative min-w-0 p-6 sm:p-9">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-qubic-gold"><Activity className="h-3.5 w-3.5" /> Market signal</div>
                <div className="flex items-end gap-3">
                  <span className="font-heading text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">{price ? formatCurrency(price.usd) : "—"}</span>
                  {price && <span className={`mb-1 rounded-full px-2 py-1 font-mono text-xs font-semibold ${price.usd_24h_change >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>{formatPercent(price.usd_24h_change)}</span>}
                </div>
                <p className="mt-2 text-sm text-text-muted">QUBIC / USD</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-text-disabled" />
            </div>
            <div className="h-[240px] sm:h-[280px]">
              <PriceChart onPeriodChange={setActivePeriod} />
            </div>
          </div>
        </div>
        <div className="signal-rail relative grid grid-cols-2 sm:grid-cols-4">
          <div className="flex items-center gap-3 border-r border-white/10 px-5 py-4 sm:px-7"><Database className="h-4 w-4 text-qubic-cyan" /><div><div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Tick velocity</div><div className="mt-1 text-sm font-semibold text-text-primary">Live</div></div></div>
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 sm:border-b-0 sm:border-r sm:px-7"><Activity className="h-4 w-4 text-qubic-gold" /><div><div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Epoch progress</div><div className="mt-1 text-sm font-semibold text-text-primary">Syncing</div></div></div>
          <div className="flex items-center gap-3 border-r border-white/10 px-5 py-4 sm:px-7"><span className="h-2 w-2 rounded-full bg-success shadow-[0_0_12px_rgba(16,185,129,0.8)]" /><div><div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Consensus</div><div className="mt-1 text-sm font-semibold text-success">Healthy</div></div></div>
          <div className="flex items-center gap-3 px-5 py-4 sm:px-7"><span className="font-heading text-lg text-qubic-cyan">676</span><div><div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Computors</div><div className="mt-1 text-sm font-semibold text-text-primary">Active set</div></div></div>
        </div>
      </section>

      <EpochCountdown />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="min-w-0"><StatCards activePeriod={activePeriod} /></div>
        <div className="min-w-0"><PortfolioSummary /></div>
      </div>
    </div>
  );
}
