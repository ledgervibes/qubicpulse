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

  const bal = balances.get(wallet.address);
  const balance = bal?.balance ?? 0;
  const value = price ? balance * price.usd : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-bg-hover bg-bg-surface overflow-hidden hover:border-qubic-cyan/30 hover:shadow-[0_0_20px_rgba(37,202,217,0.08)] transition-all duration-200">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-qubic-cyan/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-qubic-cyan" />
            </div>
            <div>
              <div className="text-sm font-medium text-text-primary">
                {wallet.label}
              </div>
              <div className="flex items-center gap-1 text-xs text-text-muted font-mono">
                {formatAddress(wallet.address, 10)}
                <button
                  onClick={handleCopy}
                  className="text-text-disabled hover:text-qubic-cyan transition-colors"
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
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-semibold text-text-primary">
                {formatBalance(balance)} Q
              </div>
              <div className="text-xs text-qubic-gold">
                {formatCurrency(value)}
              </div>
            </div>
            <button
              onClick={() => removeWallet(wallet.id)}
              className="p-1.5 rounded-lg text-text-disabled hover:text-danger hover:bg-danger/10 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] transition-all duration-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {bal && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-bg-hover">
            <div>
              <div className="text-[10px] text-text-muted">Incoming</div>
              <div className="text-xs font-medium text-success">
                +{formatBalance(bal.incomingAmount)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-text-muted">Outgoing</div>
              <div className="text-xs font-medium text-danger">
                -{formatBalance(bal.outgoingAmount)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-text-muted">Transfers</div>
              <div className="text-xs font-medium text-text-primary">
                {bal.numberOfTransfers}
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowTx(!showTx)}
        className="w-full px-4 py-2 border-t border-bg-hover text-xs text-text-muted hover:text-qubic-cyan hover:bg-qubic-cyan/5 transition-colors flex items-center justify-center gap-1"
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
    </div>
  );
}
