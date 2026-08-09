import { useState } from "react";
import { useWalletStore } from "../../stores/walletStore";
import { usePriceStore } from "../../stores/priceStore";
import { formatBalance, formatCurrency, formatAddress } from "../../utils/format";
import { TransactionHistory } from "./TransactionHistory";
import { Wallet, Copy, Check, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  wallet: {
    id: string;
    label: string;
    address: string;
  };
}

export function WalletCard({ wallet }: Props) {
  const balances = useWalletStore((s) => s.balances);
  const removeWallet = useWalletStore((s) => s.removeWallet);
  const price = usePriceStore((s) => s.price);
  const [copied, setCopied] = useState(false);
  const [showTx, setShowTx] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const bal = balances.get(wallet.address);
  const balance = bal?.balance ?? 0;
  const value = price ? balance * price.usd : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="data-surface overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-qubic-cyan/10 ring-1 ring-qubic-cyan/15">
              <Wallet className="h-4 w-4 text-qubic-cyan" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-heading text-base font-semibold text-text-primary">
                {wallet.label}
              </div>
              <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-text-muted">
                {formatAddress(wallet.address, 10)}
                <button
                  onClick={handleCopy}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-text-disabled transition-colors hover:bg-qubic-cyan/10 hover:text-qubic-cyan"
                  aria-label={copied ? "Address copied" : `Copy ${wallet.label} address`}
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-success" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-start gap-2">
            <div className="text-right">
              <div className="font-heading text-lg font-semibold text-text-primary sm:text-xl">
                {formatBalance(balance)} Q
              </div>
              <div className="mt-0.5 text-xs font-medium text-qubic-gold">
                {formatCurrency(value)}
              </div>
            </div>
            <button
              onClick={() => setConfirmRemove(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-text-disabled transition-colors hover:bg-danger/10 hover:text-danger"
              aria-label={`Remove ${wallet.label}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {bal && (
          <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
            <div className="rounded-xl bg-bg-deep/25 p-3">
              <div className="text-[10px] uppercase tracking-[0.1em] text-text-muted">Incoming</div>
              <div className="mt-1 truncate text-xs font-semibold text-success sm:text-sm">
                +{formatBalance(bal.incomingAmount)}
              </div>
            </div>
            <div className="rounded-xl bg-bg-deep/25 p-3">
              <div className="text-[10px] uppercase tracking-[0.1em] text-text-muted">Outgoing</div>
              <div className="mt-1 truncate text-xs font-semibold text-danger sm:text-sm">
                -{formatBalance(bal.outgoingAmount)}
              </div>
            </div>
            <div className="rounded-xl bg-bg-deep/25 p-3">
              <div className="text-[10px] uppercase tracking-[0.1em] text-text-muted">Transfers</div>
              <div className="mt-1 text-xs font-semibold text-text-primary sm:text-sm">
                {bal.numberOfTransfers}
              </div>
            </div>
          </div>
        )}

        {confirmRemove && (
          <div role="alertdialog" aria-label={`Remove ${wallet.label}`} className="mt-4 flex flex-col gap-3 rounded-xl border border-danger/20 bg-danger/5 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-text-secondary">Remove this address from QubicPulse?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmRemove(false)} className="btn-tertiary px-3">Cancel</button>
              <button onClick={() => removeWallet(wallet.id)} className="btn-danger">Remove</button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowTx(!showTx)}
        className="flex min-h-11 w-full items-center justify-center gap-1 border-t border-white/5 px-4 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-bg-elevated/60 hover:text-text-primary"
        aria-expanded={showTx}
      >
        {showTx ? (
          <>
            Hide Transactions <ChevronUp className="w-3 h-3" />
          </>
        ) : (
          <>
            View Transactions <ChevronDown className="w-3 h-3" />
          </>
        )}
      </button>

      {showTx && (
        <div className="border-t border-bg-hover max-h-64 overflow-y-auto">
          <TransactionHistory address={wallet.address} />
        </div>
      )}
    </article>
  );
}
