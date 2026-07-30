import { Check, X } from "lucide-react";

interface ComparisonRow {
  feature: string;
  qearn: string | boolean;
  qbond: string | boolean;
}

const comparisons: ComparisonRow[] = [
  { feature: "Contract Index", qearn: "9", qbond: "17" },
  { feature: "Lock Period", qearn: "52 epochs", qbond: "53 epochs" },
  { feature: "Min Stake", qearn: "10M QU", qbond: "10M QU (10 MBonds)" },
  { feature: "Liquidity", qearn: false, qbond: true },
  { feature: "Tradeable", qearn: false, qbond: true },
  { feature: "Trading Fee", qearn: "N/A", qbond: "0.03%" },
  { feature: "Stake Fee", qearn: "0%", qbond: "0.4%" },
  { feature: "Early Unlock", qearn: "Yes (penalty)", qbond: "Sell MBond" },
  { feature: "APY Source", qearn: "Network revenue", qbond: "QEarn yield" },
  { feature: "Token Received", qearn: "None", qbond: "MBond tokens" },
];

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-success/10 text-success">
        <Check className="w-3 h-3" />
      </span>
    ) : (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-danger/10 text-danger">
        <X className="w-3 h-3" />
      </span>
    );
  }
  return <span className="text-sm text-text-primary">{value}</span>;
}

export function ComparisonTable() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-bg-hover">
        <h3 className="font-heading font-semibold text-text-primary">
          Feature Comparison
        </h3>
        <p className="text-xs text-text-muted mt-1">
          Compare QEarn and QBond staking options
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-bg-hover">
              <th className="text-left p-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                Feature
              </th>
              <th className="text-center p-3 text-xs font-medium text-qubic-cyan uppercase tracking-wider">
                QEarn
              </th>
              <th className="text-center p-3 text-xs font-medium text-qubic-gold uppercase tracking-wider">
                QBond
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((row) => (
              <tr
                key={row.feature}
                className="border-b border-bg-hover/50 last:border-0 hover:bg-bg-elevated/30 transition-colors"
              >
                <td className="p-3 text-sm text-text-muted">{row.feature}</td>
                <td className="p-3 text-center">
                  <CellValue value={row.qearn} />
                </td>
                <td className="p-3 text-center">
                  <CellValue value={row.qbond} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
