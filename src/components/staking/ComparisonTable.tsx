import { Check, X } from "lucide-react";

interface ComparisonRow {
  feature: string;
  qearn: string | boolean;
  qbond: string | boolean;
}

const comparisons: ComparisonRow[] = [
  { feature: "Contract index", qearn: "9", qbond: "17" },
  { feature: "Lock period", qearn: "52 epochs", qbond: "53 epochs" },
  { feature: "Minimum", qearn: "10M QU", qbond: "10 MBonds" },
  { feature: "Tradeable position", qearn: false, qbond: true },
  { feature: "Stake fee", qearn: "0%", qbond: "0.4%" },
  { feature: "Early exit", qearn: "Unlock with penalty", qbond: "Sell MBond" },
  { feature: "Reward source", qearn: "Network revenue", qbond: "QEarn yield" },
  { feature: "Position received", qearn: "None", qbond: "MBond token" },
];

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value !== "boolean") return <span>{value}</span>;
  return value ? (
    <span className="inline-flex items-center gap-1.5 text-success"><Check className="h-3.5 w-3.5" />Yes</span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-text-muted"><X className="h-3.5 w-3.5" />No</span>
  );
}

export function ComparisonTable() {
  return (
    <section className="data-surface overflow-hidden" aria-labelledby="comparison-title">
      <div className="border-b border-white/5 p-4 sm:p-5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-qubic-cyan">Make the tradeoff visible</div>
        <h2 id="comparison-title" className="mt-1 font-heading text-xl font-semibold text-text-primary">Feature comparison</h2>
        <p className="mt-1 text-xs text-text-muted">Terms are shown side by side without recommending a product.</p>
      </div>
      <div className="divide-y divide-white/5">
        {comparisons.map((row) => (
          <div key={row.feature} className="grid gap-3 p-4 sm:grid-cols-[1.1fr_1fr_1fr] sm:items-center sm:gap-4 sm:px-5">
            <div className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted sm:text-sm sm:normal-case sm:tracking-normal">{row.feature}</div>
            <div className="flex items-center justify-between gap-3 text-sm text-text-primary sm:block"><span className="text-xs font-semibold text-qubic-cyan sm:hidden">QEarn</span><CellValue value={row.qearn} /></div>
            <div className="flex items-center justify-between gap-3 text-sm text-text-primary sm:block"><span className="text-xs font-semibold text-qubic-gold sm:hidden">QBond</span><CellValue value={row.qbond} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}
