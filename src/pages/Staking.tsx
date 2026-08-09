import { useEffect } from "react";
import { useStakingStore } from "../stores/stakingStore";
import { getStatus } from "../services/qubic-rpc";
import { QEarnCard } from "../components/staking/QEarnCard";
import { QBondCard } from "../components/staking/QBondCard";
import { ComparisonTable } from "../components/staking/ComparisonTable";
import { StakingCalculator } from "../components/staking/StakingCalculator";
import { CircleAlert, ExternalLink, Loader2, Sparkles } from "lucide-react";

export function Staking() {
  const {
    qearnLockInfo,
    qearnStats,
    qbondInfo,
    qbondFees,
    loading,
    error,
    fetchAll,
  } = useStakingStore();

  useEffect(() => {
    async function load() {
      try {
        const status = await getStatus();
        await fetchAll(status.epoch);
      } catch {
        // silent
      }
    }
    load();
  }, [fetchAll]);

  const qearnApy = qearnStats.data
    ? (qearnStats.data.averageAPY / 10000000) * 52 * 100
    : 0;
  const qbondApyVal = qbondInfo.data
    ? (qbondInfo.data.apy / 10000000) * 52 * 100
    : 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-qubic-gold">
            <Sparkles className="h-3.5 w-3.5" />
            Put your QU to work
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Choose your earning path.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-muted sm:text-base">
            Compare live QEarn and QBond terms before you commit your QUBIC.
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <a
            href="https://qearn.org"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary min-h-11 px-3 text-sm"
          >
            QEarn
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://qbond.org"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary min-h-11 px-3 text-sm"
          >
            QBond
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {loading && !qearnLockInfo.data && !qbondInfo.data && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-qubic-cyan animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="data-surface flex items-start gap-3 border-warning/25 p-4" role="status">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div><div className="text-sm font-medium text-text-primary">Some staking data could not be refreshed</div><div className="mt-1 text-xs text-text-muted">Available contract data is still shown below. Values marked with a dash were not returned.</div></div>
        </div>
      )}

      <StakingCalculator
        qearnApy={qearnApy}
        qbondApy={qbondApyVal}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <QEarnCard
          lockInfo={qearnLockInfo.data}
          stats={qearnStats.data}
          loading={loading && !qearnLockInfo.data}
        />
        <QBondCard
          bondInfo={qbondInfo.data}
          fees={qbondFees.data}
          loading={loading && !qbondInfo.data}
        />
      </div>

      <ComparisonTable />
    </div>
  );
}
