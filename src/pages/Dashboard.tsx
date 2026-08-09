import { useState } from "react";
import { PriceChart } from "../components/dashboard/PriceChart";
import { StatCards } from "../components/dashboard/StatCards";
import { PortfolioSummary } from "../components/dashboard/PortfolioSummary";
import { EpochCountdown } from "../components/dashboard/EpochCountdown";

export function Dashboard() {
  const [activePeriod, setActivePeriod] = useState(7);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-qubic-cyan">
          Qubic command center
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            See the network. Know your position.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted sm:text-base">
            Live market and portfolio signals in one clear view.
          </p>
        </div>
        <div className="hidden items-center gap-2 text-xs text-text-muted lg:flex">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse-slow" />
          Data updates automatically
        </div>
      </div>
      </div>

      <EpochCountdown />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.45fr_0.75fr]">
        <div className="min-w-0">
          <PriceChart onPeriodChange={setActivePeriod} />
        </div>
        <div className="min-w-0">
          <PortfolioSummary />
        </div>
      </div>
      <StatCards activePeriod={activePeriod} />
    </div>
  );
}
