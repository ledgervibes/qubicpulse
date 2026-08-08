import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
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
      <div className="glass-card flex items-center gap-3 px-4 py-3">
        <div className="skeleton h-8 w-8 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-2 w-full" />
        </div>
        <div className="skeleton h-5 w-28 shrink-0" />
      </div>
    );
  }

  if (!countdown) return null;

  return (
    <div className="glass-card px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex min-w-fit items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-qubic-cyan/10 text-qubic-cyan">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-semibold text-text-primary">
              Epoch {countdown.currentEpoch}
            </h3>
            <p className="text-[11px] text-text-muted">Next epoch</p>
          </div>
        </div>

        <div className="min-w-[150px] flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[11px] text-text-muted">Progress</span>
            <span className="text-[11px] font-medium text-text-muted">
              {countdown.progress.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-1.5 overflow-hidden rounded-full bg-bg-elevated">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-qubic-cyan to-qubic-cyan-light transition-all duration-1000"
              style={{ width: `${countdown.progress}%` }}
            />
          </div>
        </div>

        <div className="order-[-1] ml-auto whitespace-nowrap font-heading text-lg font-bold text-text-primary sm:order-none sm:text-xl">
          {formatEpochCountdown(countdown)}
        </div>
      </div>
    </div>
  );
}
