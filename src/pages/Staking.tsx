import { useEffect } from "react";
import { useStakingStore } from "../stores/stakingStore";
import { getStatus } from "../services/qubic-rpc";
import { QEarnCard } from "../components/staking/QEarnCard";
import { QBondCard } from "../components/staking/QBondCard";
import { ComparisonTable } from "../components/staking/ComparisonTable";
import { StakingCalculator } from "../components/staking/StakingCalculator";
import { ExternalLink, Loader2 } from "lucide-react";

export function Staking() {
  const {
    qearnLockInfo,
    qearnStats,
    qbondInfo,
    qbondFees,
    loading,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Staking
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Compare QEarn and QBond staking options
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="https://qearn.org"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glass flex items-center gap-2 px-3 py-2 text-sm"
          >
            QEarn
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://qbond.org"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glass flex items-center gap-2 px-3 py-2 text-sm"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ComparisonTable />
        </div>
        <div>
          <StakingCalculator
            stats={qearnStats.data}
            qearnApy={qearnApy}
            qbondApy={qbondApyVal}
          />
        </div>
      </div>
    </div>
  );
}
