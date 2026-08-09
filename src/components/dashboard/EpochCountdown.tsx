import { useEffect, useState } from "react";
import { Activity, Clock, Layers } from "lucide-react";
import { getTickInfo } from "../../services/qubic-rpc";
import type { TickInfo } from "../../types";
import {
  calculateEpochCountdown,
  formatEpochCountdown,
  type EpochCountdown as EpochCountdownData,
} from "../../utils/epoch";

export function EpochCountdown() {
  const [countdown, setCountdown] = useState<EpochCountdownData | null>(null);
  const [tickInfo, setTickInfo] = useState<TickInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchEpoch() {
      try {
        const data = await getTickInfo();
        if (!mounted) return;
        setTickInfo(data);
        setCountdown(calculateEpochCountdown(data.epoch, data.initialTick));
        setLoading(false);
      } catch {
        if (mounted) setLoading(false);
      }
    }

    fetchEpoch();
    const fetchInterval = setInterval(fetchEpoch, 30000);

    return () => {
      mounted = false;
      clearInterval(fetchInterval);
    };
  }, []);

  useEffect(() => {
    if (!tickInfo) return;

    const countdownInterval = setInterval(() => {
      setCountdown(calculateEpochCountdown(tickInfo.epoch, tickInfo.initialTick));
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [tickInfo]);

  if (loading) {
    return (
      <div className="hero-surface p-5 sm:p-7">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[1fr_1.4fr_0.8fr]">
          <div className="space-y-3">
            <div className="skeleton h-3 w-28" />
            <div className="skeleton h-10 w-40" />
          </div>
          <div className="space-y-3">
            <div className="skeleton h-3 w-32" />
            <div className="skeleton h-3 w-full" />
          </div>
          <div className="space-y-3">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-7 w-28" />
          </div>
        </div>
      </div>
    );
  }

  if (!countdown) return null;

  return (
    <section className="hero-surface p-5 sm:p-7" aria-label="Qubic network epoch status">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-qubic-cyan/10" />
      <div className="pointer-events-none absolute -right-8 -top-12 h-44 w-44 rounded-full border border-qubic-cyan/10" />

      <div className="relative grid gap-6 lg:grid-cols-[0.9fr_1.35fr_0.75fr] lg:items-center">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-qubic-cyan">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-success" />
            </span>
            Network live
          </div>
          <div className="flex items-end gap-3">
            <span className="font-heading text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
              {countdown.currentEpoch}
            </span>
            <span className="mb-1.5 text-sm text-text-muted">current epoch</span>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-medium text-text-secondary">
              <Activity className="h-3.5 w-3.5 text-qubic-cyan" />
              Epoch progress
            </span>
            <span className="font-mono text-xs text-text-muted">
              {countdown.progress.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-bg-deep/70 ring-1 ring-white/5">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-qubic-cyan-dark via-qubic-cyan to-qubic-cyan-light shadow-[0_0_14px_rgba(37,202,217,0.55)] transition-all duration-1000"
              style={{ width: `${countdown.progress}%` }}
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
            <Layers className="h-3.5 w-3.5 text-qubic-gold" />
            Epoch {countdown.currentEpoch + 1} begins after the countdown
          </div>
        </div>

        <div className="border-t border-white/5 pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-text-muted">
            <Clock className="h-3.5 w-3.5 text-qubic-gold" />
            Next epoch in
          </div>
          <div className="whitespace-nowrap font-mono text-xl font-medium text-text-primary sm:text-2xl">
            {formatEpochCountdown(countdown)}
          </div>
        </div>
      </div>
    </section>
  );
}
