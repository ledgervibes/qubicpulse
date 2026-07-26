import { useState, useEffect } from "react";
import { getTransactions } from "../../services/qubic-rpc";
import { formatBalance, formatAddress } from "../../utils/format";
import type { Transaction } from "../../types";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface Props {
  address: string;
}

export function TransactionHistory({ address }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getTransactions(address, 20)
      .then((txs) => {
        if (!cancelled) {
          setTransactions(txs);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [address]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-qubic-cyan animate-spin" />
        <span className="ml-2 text-sm text-text-muted">
          Loading transactions...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-danger">{error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-text-muted">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {transactions.map((tx) => {
        const isIncoming = tx.destination.toUpperCase() === address.toUpperCase();
        const amount = tx.amount;
        const otherAddress = isIncoming ? tx.source : tx.destination;

        return (
          <a
            key={tx.hash}
            href={`https://explorer.qubic.org/network/tx/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-elevated transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  isIncoming
                    ? "bg-success/10 text-success"
                    : "bg-danger/10 text-danger"
                }`}
              >
                {isIncoming ? (
                  <ArrowDownLeft className="w-4 h-4" />
                ) : (
                  <ArrowUpRight className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {isIncoming ? "Received" : "Sent"}
                </div>
                <div className="flex items-center gap-1 text-xs text-text-muted font-mono">
                  {formatAddress(otherAddress, 8)}
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-sm font-medium ${
                  isIncoming ? "text-success" : "text-danger"
                }`}
              >
                {isIncoming ? "+" : "-"}
                {formatBalance(amount)} Q
              </div>
              <div className="text-xs text-text-muted">
                Tick #{tx.tickNumber.toLocaleString()}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
