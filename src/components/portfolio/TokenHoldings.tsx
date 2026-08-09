import { useState, useEffect } from "react";
import { getAssetHoldings } from "../../services/qubic-rpc";
import { formatBalance } from "../../utils/format";
import { Coins, Loader2 } from "lucide-react";

interface Props {
  address: string;
}

export function TokenHoldings({ address }: Props) {
  const [holdings, setHoldings] = useState<Array<{
    assetName: string;
    assetIssuer: string;
    balance: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getAssetHoldings(address)
      .then((data) => {
        if (!cancelled) {
          setHoldings(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHoldings([]);
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
      <div className="flex min-h-32 items-center justify-center py-4">
        <Loader2 className="w-4 h-4 text-qubic-cyan animate-spin" />
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="flex min-h-32 flex-col items-center justify-center py-4 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-qubic-gold/10">
          <Coins className="h-4 w-4 text-qubic-gold" />
        </div>
        <p className="font-heading text-sm font-medium text-text-primary">No assets found</p>
        <p className="mt-1 text-[11px] text-text-muted">Issued assets will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="mb-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-qubic-gold">Qubic assets</div>
        <h3 className="mt-1 font-heading text-base font-semibold text-text-primary">Token holdings</h3>
      </div>
      {holdings.map((h) => (
        <div
          key={h.assetName}
          className="flex items-center justify-between rounded-xl px-2 py-2 transition-colors hover:bg-bg-elevated"
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-qubic-gold/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-qubic-gold">
                {h.assetName.slice(0, 2)}
              </span>
            </div>
            <span className="text-xs font-medium text-text-primary">
              {h.assetName}
            </span>
          </div>
          <span className="text-xs text-text-secondary font-mono">
            {formatBalance(h.balance)}
          </span>
        </div>
      ))}
    </div>
  );
}
