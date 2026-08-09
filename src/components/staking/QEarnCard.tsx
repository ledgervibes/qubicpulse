import { Lock, Info } from "lucide-react";
import { formatBalance, formatCompact } from "../../utils/format";
import type { QEarnLockInfo, QEarnStats } from "../../types";

interface Props {
  lockInfo: QEarnLockInfo | null;
  stats: QEarnStats | null;
  loading: boolean;
}

export function QEarnCard({ lockInfo, stats, loading }: Props) {
  if (loading) {
    return (
      <div className="data-surface p-5">
        <div className="skeleton h-5 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const apy = stats ? (stats.averageAPY / 10000000) * 52 * 100 : 0;

  return (
    <article className="data-surface overflow-hidden border-qubic-cyan/25 p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-qubic-cyan/10 text-qubic-cyan">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-semibold text-text-primary">
            QEarn
          </h2>
          <p className="text-xs text-text-muted">Direct, long-term earning</p>
        </div>
        </div>
        <span className="rounded-full bg-warning/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-warning">Locked</span>
      </div>

      <div className="space-y-3">
        <div className="mb-5 flex items-end justify-between rounded-2xl bg-qubic-cyan/5 p-4 ring-1 ring-qubic-cyan/10">
          <span className="text-xs uppercase tracking-[0.12em] text-text-muted">Estimated APY</span>
          <span className="font-heading text-3xl font-semibold text-success">{apy > 0 ? `${apy.toFixed(2)}%` : "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Lock Period</span>
          <span className="text-sm font-medium text-text-primary">
            52 epochs
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Min Stake</span>
          <span className="text-sm font-medium text-text-primary">
            10M QU
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Total Locked</span>
          <span className="text-sm font-medium text-text-primary">
            {lockInfo ? formatCompact(lockInfo.currentLockedAmount) : "—"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Bonus Pool</span>
          <span className="text-sm font-medium text-text-primary">
            {lockInfo ? formatBalance(lockInfo.bonusAmount) : "—"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Liquidity</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning">
            Locked
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-bg-elevated/50 p-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
          <p className="text-xs text-text-muted">
            Lock QUBIC for 52 epochs to earn rewards from network revenue. Early
            unlock available with penalty.
          </p>
        </div>
      </div>
    </article>
  );
}
