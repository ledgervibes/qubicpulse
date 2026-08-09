import { useState } from "react";
import { useWalletStore } from "../stores/walletStore";
import { usePriceStore } from "../stores/priceStore";
import { formatBalance, formatCurrency } from "../utils/format";
import { QUBIC_ADDRESS_REGEX } from "../utils/constants";
import { WalletCard } from "../components/portfolio/WalletCard";
import { TokenHoldings } from "../components/portfolio/TokenHoldings";
import { Eye, Plus, RefreshCw, ShieldCheck, Wallet } from "lucide-react";

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
  const totalTransfers = wallets.reduce(
    (sum, wallet) => sum + (balances.get(wallet.address)?.numberOfTransfers ?? 0),
    0
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-qubic-cyan">
            <Eye className="h-3.5 w-3.5" />
            Watch-only portfolio
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Your Qubic position
          </h1>
          <p className="mt-2 text-sm text-text-muted sm:text-base">
            Track balances and activity across your public addresses.
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={() => refreshBalances()}
            disabled={loading}
            className="btn-secondary min-h-11 px-3 sm:px-4"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="btn-primary min-h-11"
            aria-expanded={showAdd}
          >
            <Plus className="w-4 h-4" />
            Add Wallet
          </button>
        </div>
      </div>

      {showAdd && (
        <section className="data-surface animate-fade-in border-qubic-cyan/30 p-5 sm:p-6" aria-labelledby="add-wallet-title">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-qubic-cyan/10 text-qubic-cyan">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 id="add-wallet-title" className="font-heading text-lg font-semibold text-text-primary">
                Add a public address
              </h2>
              <p className="mt-1 text-xs leading-5 text-text-muted">
                QubicPulse never asks for a seed phrase or private key.
              </p>
            </div>
          </div>
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
                className="min-h-11 w-full rounded-xl border border-bg-hover bg-bg-elevated px-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-qubic-cyan/50"
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">
                Qubic Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value.toUpperCase().trim())}
                placeholder="GZCNUSK..."
                maxLength={60}
                spellCheck={false}
                autoComplete="off"
                className="min-h-11 w-full rounded-xl border border-bg-hover bg-bg-elevated px-3 font-mono text-sm text-text-primary placeholder:text-text-disabled focus:border-qubic-cyan/50"
              />
              <div className="mt-1 text-right font-mono text-[10px] text-text-disabled">{address.length}/60</div>
            </div>
          </div>
          {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              className="btn-primary min-h-11"
            >
              Add Wallet
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="btn-secondary min-h-11"
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {wallets.length > 0 && (
        <section className="hero-surface p-5 sm:p-7" aria-label="Portfolio overview">
          <div className="pointer-events-none absolute -right-14 -top-20 h-60 w-60 rounded-full border border-qubic-cyan/10" />
          <div className="relative grid gap-6 sm:grid-cols-[1.4fr_1fr] sm:items-end">
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-qubic-cyan">Total portfolio value</div>
              <div className="font-heading text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
                {formatCurrency(totalValue)}
              </div>
              <div className="mt-2 font-mono text-sm text-text-muted">
                {formatBalance(totalBalance)} QUBIC
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/5 bg-bg-deep/30 p-4">
                <div className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Addresses</div>
                <div className="mt-2 font-heading text-2xl font-semibold text-text-primary">{wallets.length}</div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-bg-deep/30 p-4">
                <div className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Transfers</div>
                <div className="mt-2 font-heading text-2xl font-semibold text-text-primary">{totalTransfers.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-4" aria-labelledby="tracked-wallets-title">
        {wallets.length > 0 && (
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-qubic-gold">Tracked addresses</div>
              <h2 id="tracked-wallets-title" className="mt-1 font-heading text-xl font-semibold text-text-primary">Wallet overview</h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <ShieldCheck className="h-4 w-4 text-success" />
              Watch-only
            </div>
          </div>
        )}
        {wallets.length === 0 ? (
          <div className="data-surface px-5 py-16 text-center sm:py-20">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-qubic-cyan/10 ring-1 ring-qubic-cyan/20">
              <Wallet className="h-7 w-7 text-qubic-cyan" />
            </div>
            <h2 id="tracked-wallets-title" className="font-heading text-xl font-semibold text-text-primary">Build your Qubic overview</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">Add a public address to see its QU balance, assets, and recent network activity. No wallet connection required.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="btn-primary mt-6 min-h-11"
            >
              <Plus className="h-4 w-4" />
              Add first address
            </button>
          </div>
        ) : (
          wallets.map((w) => (
            <div key={w.id} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="min-w-0 lg:col-span-2">
                <WalletCard wallet={w} />
              </div>
              <div className="data-surface p-4 sm:p-5">
                <TokenHoldings address={w.address} />
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
