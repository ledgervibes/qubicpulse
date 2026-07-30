import { Ticket, Info, ArrowLeftRight } from "lucide-react";
import { formatBalance, formatCompact } from "../../utils/format";
import type { QBondInfo, QBondFees } from "../../types";

interface Props {
  bondInfo: QBondInfo | null;
  fees: QBondFees | null;
  loading: boolean;
}

export function QBondCard({ bondInfo, fees, loading }: Props) {
  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="skeleton h-5 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const apy = bondInfo ? (bondInfo.apy / 10000000) * 52 * 100 : 0;

  return (
    <div className="glass-card p-5 border border-qubic-gold/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-qubic-gold/10 text-qubic-gold">
          <Ticket className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-text-primary text-lg">
            QBond
          </h3>
          <p className="text-xs text-text-muted">Liquid staking</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">APY</span>
          <span className="text-sm font-semibold text-success">
            {apy > 0 ? `${apy.toFixed(2)}%` : "—"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Lock Period</span>
          <span className="text-sm font-medium text-text-primary">
            53 epochs
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">MBond Price</span>
          <span className="text-sm font-medium text-text-primary">
            1M QU
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Min Stake</span>
          <span className="text-sm font-medium text-text-primary">
            10 MBonds
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Stakers</span>
          <span className="text-sm font-medium text-text-primary">
            {bondInfo ? formatBalance(bondInfo.stakersAmount) : "—"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Total Staked</span>
          <span className="text-sm font-medium text-text-primary">
            {bondInfo ? formatCompact(bondInfo.totalStaked) : "—"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Stake Fee</span>
          <span className="text-sm font-medium text-text-primary">
            {fees ? `${fees.stakeFeePercent / 100}%` : "—"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Trade Fee</span>
          <span className="text-sm font-medium text-text-primary">
            {fees ? `${fees.tradeFeePercent / 100}%` : "—"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Liquidity</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success flex items-center gap-1">
            <ArrowLeftRight className="w-3 h-3" />
            Tradeable
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-bg-elevated/50">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
          <p className="text-xs text-text-muted">
            Stake QUBIC to receive MBond tokens. MBonds are tradeable on QBond
            DEX and earn QEarn yield at maturity.
          </p>
        </div>
      </div>
    </div>
  );
}
