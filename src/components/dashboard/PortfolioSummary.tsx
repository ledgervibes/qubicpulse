import { useWalletStore } from "../../stores/walletStore";
import { usePriceStore } from "../../stores/priceStore";
import { formatBalance, formatCurrency, formatAddress } from "../../utils/format";
import { Wallet } from "lucide-react";
import { Link } from "react-router-dom";

export function PortfolioSummary() {
  const wallets = useWalletStore((s) => s.wallets);
  const balances = useWalletStore((s) => s.balances);
  const price = usePriceStore((s) => s.price);

  const totalBalance = wallets.reduce((sum, w) => {
    const bal = balances.get(w.address);
    return sum + (bal?.balance ?? 0);
  }, 0);

  const totalValue = price ? totalBalance * price.usd : 0;

  return (
    <div className="data-surface h-full p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-qubic-gold">Your position</div>
          <h2 className="font-heading text-xl font-semibold text-text-primary">Portfolio</h2>
        </div>
        <Link
          to="/portfolio"
          className="text-xs text-qubic-cyan hover:text-qubic-cyan-light transition-colors font-medium"
        >
          View all
        </Link>
      </div>

      {wallets.length === 0 ? (
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-qubic-cyan/10 ring-1 ring-qubic-cyan/20">
            <Wallet className="h-5 w-5 text-qubic-cyan" />
          </div>
          <p className="font-heading text-base font-medium text-text-primary">Your Qubic view starts here</p>
          <p className="mx-auto mt-2 max-w-64 text-xs leading-5 text-text-muted">Add a public address to track balances and portfolio value.</p>
          <Link
            to="/portfolio"
            className="btn-primary mt-5"
          >
            Add first wallet
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="text-2xl font-heading font-bold text-text-primary">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-sm text-text-muted">
              {formatBalance(totalBalance)} QUBIC
            </div>
          </div>
          <div className="space-y-2">
            {wallets.slice(0, 3).map((w) => {
              const bal = balances.get(w.address);
              const value = price && bal ? bal.balance * price.usd : 0;
              return (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-bg-elevated/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-qubic-cyan/10 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-qubic-cyan" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        {w.label}
                      </div>
                      <div className="text-xs text-text-muted font-mono">
                        {formatAddress(w.address)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-text-primary">
                      {bal ? formatBalance(bal.balance) : "—"} Q
                    </div>
                    <div className="text-xs text-qubic-gold font-medium">
                      {bal && price ? formatCurrency(value) : "—"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
