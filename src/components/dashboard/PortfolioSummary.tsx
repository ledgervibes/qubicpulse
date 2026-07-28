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
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-text-primary text-lg">
          Portfolio
        </h3>
        <Link
          to="/portfolio"
          className="text-xs text-qubic-cyan hover:text-qubic-cyan-light transition-colors font-medium"
        >
          View All →
        </Link>
      </div>

      {wallets.length === 0 ? (
        <div className="text-center py-8">
          <Wallet className="w-10 h-10 text-text-disabled mx-auto mb-3" />
          <p className="text-sm text-text-muted mb-2">No wallets added yet</p>
          <Link
            to="/portfolio"
            className="text-sm text-qubic-cyan hover:text-qubic-cyan-light transition-colors font-medium"
          >
            Add your first wallet →
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
