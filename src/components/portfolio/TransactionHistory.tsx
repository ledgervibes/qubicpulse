import { useState, useEffect } from "react";
import { getTransactions, getEventLogs } from "../../services/qubic-rpc";
import { formatBalance, formatAddress } from "../../utils/format";
import type { Transaction, EventLog } from "../../types";
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
  const [assetLogs, setAssetLogs] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      getTransactions(address, 20),
      getEventLogs({ source: address.toUpperCase() }, 20),
      getEventLogs({ destination: address.toUpperCase() }, 20),
    ])
      .then(([txs, outgoing, incoming]) => {
        if (!cancelled) {
          setTransactions(txs);
          const allLogs = [...outgoing, ...incoming].sort(
            (a, b) => b.tickNumber - a.tickNumber
          );
          setAssetLogs(allLogs.slice(0, 20));
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
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 text-qubic-cyan animate-spin" />
        <span className="ml-2 text-sm text-text-muted">
          Loading transactions...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-danger">{error}</p>
      </div>
    );
  }

  const hasQubicTxs = transactions.length > 0;
  const hasAssetLogs = assetLogs.length > 0;

  if (!hasQubicTxs && !hasAssetLogs) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-text-muted">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {transactions.slice(0, 10).map((tx) => {
        const isIncoming =
          tx.destination.toUpperCase() === address.toUpperCase();
        const otherAddress = isIncoming ? tx.source : tx.destination;

        return (
          <a
            key={tx.hash}
            href={`https://explorer.qubic.org/network/tx/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-bg-elevated transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center ${
                  isIncoming
                    ? "bg-success/10 text-success"
                    : "bg-danger/10 text-danger"
                }`}
              >
                {isIncoming ? (
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                )}
              </div>
              <div>
                <div className="text-xs font-medium text-text-primary">
                  {isIncoming ? "Received" : "Sent"} QUBIC
                </div>
                <div className="flex items-center gap-1 text-[10px] text-text-muted font-mono">
                  {formatAddress(otherAddress, 6)}
                  <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-xs font-medium ${
                  isIncoming ? "text-success" : "text-danger"
                }`}
              >
                {isIncoming ? "+" : "-"}
                {formatBalance(tx.amount)} Q
              </div>
              <div className="text-[10px] text-text-muted">
                Tick #{tx.tickNumber.toLocaleString()}
              </div>
            </div>
          </a>
        );
      })}

      {assetLogs.map((log) => {
        const isAsset = log.logType === 3 && log.assetPossessionChange;
        if (!isAsset) return null;

        const asset = log.assetPossessionChange!;
        const isIncoming =
          asset.destination.toUpperCase() === address.toUpperCase();

        return (
          <a
            key={`${log.transactionHash}-${log.logId}`}
            href={`https://explorer.qubic.org/network/tx/${log.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-bg-elevated transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center ${
                  isIncoming
                    ? "bg-qubic-gold/10 text-qubic-gold"
                    : "bg-warning/10 text-warning"
                }`}
              >
                {isIncoming ? (
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                )}
              </div>
              <div>
                <div className="text-xs font-medium text-text-primary">
                  {isIncoming ? "Received" : "Sent"} {asset.assetName}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-text-muted font-mono">
                  {formatAddress(
                    isIncoming ? asset.source : asset.destination,
                    6
                  )}
                  <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-xs font-medium ${
                  isIncoming ? "text-qubic-gold" : "text-warning"
                }`}
              >
                {isIncoming ? "+" : "-"}
                {formatBalance(Number(asset.numberOfShares))}{" "}
                {asset.assetName}
              </div>
              <div className="text-[10px] text-text-muted">
                Tick #{log.tickNumber.toLocaleString()}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
