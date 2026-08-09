import { useState } from "react";
import { StatCards } from "../components/dashboard/StatCards";
import { PriceChart } from "../components/dashboard/PriceChart";
import { PortfolioSummary } from "../components/dashboard/PortfolioSummary";
import { EpochCountdown } from "../components/dashboard/EpochCountdown";

export function Dashboard() {
  const [activePeriod, setActivePeriod] = useState(7);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-qubic-cyan">
            <span className="h-1.5 w-1.5 rounded-full bg-qubic-cyan shadow-[0_0_10px_rgba(37,202,217,0.8)]" />
            Qubic command center
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            See the network. Know your position.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted sm:text-base">
            Live network, market, and portfolio signals in one clear view.
          </p>
        </div>
        <div className="hidden items-center gap-2 text-xs text-text-muted lg:flex">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse-slow" />
          Data updates automatically
        </div>
      </div>
      <EpochCountdown />
      <StatCards activePeriod={activePeriod} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="min-w-0 lg:col-span-2">
          <PriceChart onPeriodChange={setActivePeriod} />
        </div>
        <div>
          <PortfolioSummary />
        </div>
      </div>
    </div>
  );
}
