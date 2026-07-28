import { useState } from "react";
import { useWalletStore } from "../stores/walletStore";
import { usePriceStore } from "../stores/priceStore";
import { formatBalance, formatCurrency } from "../utils/format";
import { QUBIC_ADDRESS_REGEX } from "../utils/constants";
import { WalletCard } from "../components/portfolio/WalletCard";
import { TokenHoldings } from "../components/portfolio/TokenHoldings";
import { Wallet, Plus, RefreshCw } from "lucide-react";

export function Portfolio() {
  const wallets = useWalletStore((s) => s.wallets);
  const balances = useWalletStore((s) => s.balances);
  const loading = useWalletStore((s) => s.loading);
  const addWallet = useWalletStore((s) => s.addWallet);
  const refreshBalances = useWalletStore((s) => s.refreshBalances);
  const price = usePriceStore((s) => s.price);

  const [showAdd, setShowAdd] = useState(false);
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    setError("");
    if (!QUBIC_ADDRESS_REGEX.test(address.toUpperCase())) {
      setError("Invalid Qubic address (must be 60 uppercase chars)");
      return;
    }
    if (wallets.some((w) => w.address === address.toUpperCase())) {
      setError("Wallet already added");
      return;
    }
    addWallet(address, label || `Wallet ${wallets.length + 1}`);
    setAddress("");
    setLabel("");
    setShowAdd(false);
  };

  const totalBalance = wallets.reduce((sum, w) => {
    const bal = balances.get(w.address);
    return sum + (bal?.balance ?? 0);
  }, 0);

  const totalValue = price ? totalBalance * price.usd : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Portfolio
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Track your Qubic wallets
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refreshBalances()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-bg-hover text-text-muted hover:text-text-primary hover:border-qubic-cyan/30 hover:bg-qubic-cyan/5 hover:shadow-[0_0_10px_rgba(37,202,217,0.1)] transition-all duration-200 text-sm disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-qubic-cyan to-qubic-cyan-dark text-bg-deep font-medium text-sm shadow-[0_4px_14px_rgba(37,202,217,0.3)] hover:shadow-[0_6px_20px_rgba(37,202,217,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Wallet
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-qubic-cyan/30 bg-bg-surface p-5">
          <h3 className="font-heading font-semibold text-text-primary mb-4">
            Add New Wallet
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">
                Label (optional)
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="My Wallet"
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-bg-hover text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-qubic-cyan/50 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">
                Qubic Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="GZCNUSK..."
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-bg-hover text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-qubic-cyan/50 text-sm font-mono"
              />
            </div>
          </div>
          {error && <p className="text-sm text-danger mt-2">{error}</p>}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-qubic-cyan to-qubic-cyan-dark text-bg-deep font-medium text-sm shadow-[0_4px_14px_rgba(37,202,217,0.3)] hover:shadow-[0_6px_20px_rgba(37,202,217,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Add Wallet
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg border border-bg-hover text-text-muted hover:text-text-primary hover:border-qubic-cyan/30 hover:bg-qubic-cyan/5 hover:shadow-[0_0_10px_rgba(37,202,217,0.1)] transition-all duration-200 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {wallets.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-text-muted mb-1">Total Value</div>
              <div className="text-3xl font-heading font-bold text-text-primary">
                {formatCurrency(totalValue)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-muted">Total Balance</div>
              <div className="text-lg font-semibold text-text-primary">
                {formatBalance(totalBalance)} QUBIC
              </div>
              <div className="text-xs text-text-muted">
                {wallets.length} wallet{wallets.length > 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {wallets.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-bg-hover bg-bg-surface">
            <Wallet className="w-12 h-12 text-text-disabled mx-auto mb-4" />
            <p className="text-text-muted mb-2">No wallets added yet</p>
            <button
              onClick={() => setShowAdd(true)}
              className="text-sm text-qubic-cyan hover:text-qubic-cyan-light transition-colors"
            >
              Add your first wallet →
            </button>
          </div>
        ) : (
          wallets.map((w) => (
            <div key={w.id} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <WalletCard wallet={w} />
              </div>
              <div className="rounded-xl border border-bg-hover bg-bg-surface p-4">
                <TokenHoldings address={w.address} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
