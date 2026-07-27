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
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 text-qubic-cyan animate-spin" />
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="text-center py-4">
        <Coins className="w-6 h-6 text-text-disabled mx-auto mb-2" />
        <p className="text-xs text-text-muted">No tokens found</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="text-xs text-text-muted mb-2">Token Holdings</div>
      {holdings.map((h) => (
        <div
          key={h.assetName}
          className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-bg-elevated transition-colors"
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
