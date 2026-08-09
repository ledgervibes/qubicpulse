import { useState } from "react";
import { Calculator, Info, TrendingUp } from "lucide-react";
import { formatBalance } from "../../utils/format";

interface Props {
  qbondApy: number;
  qearnApy: number;
}

export function StakingCalculator({ qbondApy, qearnApy }: Props) {
  const [amount, setAmount] = useState<string>("1000000000");

  const parsed = Number(amount.replace(/,/g, ""));
  const parsedAmount = Number.isFinite(parsed) ? parsed : 0;
  const qearnAnnualReward = parsedAmount > 0 ? parsedAmount * (qearnApy / 100) : 0;
  const qbondAnnualReward = parsedAmount > 0 ? parsedAmount * (qbondApy / 100) : 0;
  const qearnReward = qearnAnnualReward / 52;
  const qbondReward = qbondAnnualReward / 52;

  return (
    <section className="hero-surface p-5 sm:p-6" aria-labelledby="reward-estimator-title">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-qubic-cyan/10 text-qubic-cyan">
          <Calculator className="w-4 h-4" />
        </div>
        <div>
          <h3 id="reward-estimator-title" className="font-heading text-lg font-semibold text-text-primary">Estimate your upside</h3>
          <p className="text-xs text-text-muted">
            Estimate your staking rewards
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-text-muted mb-2">
          Amount (QU)
        </label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="min-h-11 w-full rounded-xl border border-bg-hover bg-bg-elevated px-3 font-mono text-sm text-text-primary placeholder:text-text-disabled focus:border-qubic-cyan/50"
          placeholder="Enter amount..."
        />
        <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {[100000000, 1000000000, 10000000000, 100000000000].map((val) => (
            <button
              key={val}
              onClick={() => setAmount(val.toString())}
              className="min-h-9 rounded-lg border border-bg-hover bg-bg-elevated px-2 text-xs text-text-muted transition-colors hover:border-qubic-cyan/30 hover:text-text-primary"
            >
              {formatBalance(val)}
            </button>
          ))}
        </div>
      </div>

      {parsedAmount > 0 && (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-qubic-cyan/5 border border-qubic-cyan/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-text-muted">
                QEarn Reward (per epoch)
              </span>
              <span className="text-sm font-semibold text-qubic-cyan">
                {formatBalance(Math.floor(qearnReward))} QU
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">
                Annual (~52 epochs)
              </span>
              <span className="text-xs font-medium text-text-primary">
                {formatBalance(Math.floor(qearnAnnualReward))} QU
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-qubic-gold/5 border border-qubic-gold/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-text-muted">
                QBond Reward (per epoch)
              </span>
              <span className="text-sm font-semibold text-qubic-gold">
                {formatBalance(Math.floor(qbondReward))} QU
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">
                Annual (~53 epochs)
              </span>
              <span className="text-xs font-medium text-text-primary">
                {formatBalance(Math.floor(qbondAnnualReward))} QU
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-bg-elevated/50">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs text-text-muted">
              Current APY: QEarn ~{qearnApy.toFixed(2)}% | QBond ~
              {qbondApy.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-start gap-2 text-[11px] leading-5 text-text-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Estimates use the currently reported annualized rates. Actual rewards can change and are not guaranteed.
          </div>
        </div>
      )}
    </section>
  );
}
