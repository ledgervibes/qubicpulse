import { useEffect, useState } from "react";
import { Clock, Zap } from "lucide-react";
import { getStatus } from "../../services/qubic-rpc";
import {
  calculateEpochCountdown,
  formatEpochCountdown,
  type EpochCountdown as EpochCountdownData,
} from "../../utils/epoch";
import { formatTick } from "../../utils/format";

export function EpochCountdown() {
  const [countdown, setCountdown] = useState<EpochCountdownData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let interval: ReturnType<typeof setInterval>;

    async function fetchEpoch() {
      try {
        const status = await getStatus();
        if (!mounted) return;
        const data = calculateEpochCountdown(status.currentTick, status.epoch);
        setCountdown(data);
        setLoading(false);
      } catch {
        if (mounted) setLoading(false);
      }
    }

    fetchEpoch();
    interval = setInterval(fetchEpoch, 30000);

    const tickInterval = setInterval(() => {
      setCountdown((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          seconds: Math.max(0, prev.seconds - 1),
        };
      });
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
      clearInterval(tickInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="skeleton h-4 w-32 mb-3" />
        <div className="skeleton h-8 w-48 mb-2" />
        <div className="skeleton h-3 w-full" />
      </div>
    );
  }

  if (!countdown) return null;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-qubic-cyan/10 text-qubic-cyan">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-text-primary text-sm">
              Epoch {countdown.currentEpoch}
            </h3>
            <p className="text-xs text-text-muted">Next epoch in</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Zap className="w-3 h-3 text-qubic-gold" />
          <span>{formatTick(countdown.epochStartTick)}</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-2xl font-heading font-bold text-text-primary">
          {formatEpochCountdown(countdown)}
        </div>
      </div>

      <div className="relative h-2 bg-bg-elevated rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-qubic-cyan to-qubic-cyan-light transition-all duration-1000"
          style={{ width: `${countdown.progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-text-muted">
          {countdown.progress.toFixed(1)}% complete
        </span>
        <span className="text-xs text-text-muted">
          Epoch {countdown.currentEpoch + 1}
        </span>
      </div>
    </div>
  );
}
