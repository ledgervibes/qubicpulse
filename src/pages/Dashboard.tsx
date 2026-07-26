import { StatCards } from "../components/dashboard/StatCards";
import { PriceChart } from "../components/dashboard/PriceChart";
import { PortfolioSummary } from "../components/dashboard/PortfolioSummary";

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Dashboard
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Your Qubic portfolio at a glance
        </p>
      </div>
      <StatCards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart />
        </div>
        <div>
          <PortfolioSummary />
        </div>
      </div>
    </div>
  );
}
