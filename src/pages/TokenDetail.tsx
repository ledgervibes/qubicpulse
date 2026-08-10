import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowDownUp,
  ArrowLeft,
  CircleAlert,
  Clock,
  Coins,
  ExternalLink,
  Hash,
  Layers,
  RefreshCw,
  Star,
  User,
} from "lucide-react";
import { useAssetStore } from "../stores/assetStore";
import type { QubicAsset } from "../services/assets";
import type { EventLog } from "../services/qubic-rpc";
import {
  formatAddress,
  formatBalance,
  formatEventTimestamp,
  formatTick,
} from "../utils/format";

interface AssetDetail {
  asset: QubicAsset;
  transfers: EventLog[];
  loadedAt: number;
}

type LoadState = "loading" | "ready" | "empty" | "error";

export function TokenDetail() {
  const { name = "" } = useParams();
  const assetName = decodeURIComponent(name);

  const fetchAssetDetail = useAssetStore((s) => s.fetchAssetDetail);
  const loadWatchlist = useAssetStore((s) => s.loadWatchlist);
  const watchlist = useAssetStore((s) => s.watchlist);
  const toggleWatchlist = useAssetStore((s) => s.toggleWatchlist);

  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<AssetDetail | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setError(null);
    setDetail(null);
    loadWatchlist();

    fetchAssetDetail(assetName)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setState("empty");
          return;
        }
        setDetail(result);
        setState("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Something went wrong");
        setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [assetName, fetchAssetDetail, loadWatchlist]);

  const isWatched = watchlist.includes(detail?.asset.name ?? "");
  const asset = detail?.asset;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <Link
          to="/tokens"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted transition-colors hover:text-qubic-cyan"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Token Explorer
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              <Coins className="h-3.5 w-3.5" />
              QX asset detail
            </div>
            <h1 className="break-all font-heading text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              {detail ? asset?.name : assetName}
            </h1>
            <p className="mt-2 text-sm text-text-muted sm:text-base">
              On-chain issuance record with recent QX transfer activity.
            </p>
          </div>
          {state === "ready" && asset && (
            <button
              type="button"
              onClick={() => toggleWatchlist(asset.name)}
              aria-label={
                isWatched
                  ? `Remove ${asset.name} from watchlist`
                  : `Add ${asset.name} to watchlist`
              }
              aria-pressed={isWatched}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                isWatched
                  ? "bg-qubic-gold/15 text-qubic-gold"
                  : "border border-bg-hover bg-bg-elevated text-text-muted hover:text-text-primary"
              }`}
            >
              <Star
                className={`h-4 w-4 ${isWatched ? "fill-qubic-gold text-qubic-gold" : ""}`}
              />
              {isWatched ? "In watchlist" : "Add to watchlist"}
            </button>
          )}
        </div>
      </div>

      {state === "loading" && (
        <div
          className="data-surface flex items-center justify-center gap-3 p-12 text-text-muted"
          role="status"
        >
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading asset detail…
        </div>
      )}

      {state === "error" && (
        <div
          role="alert"
          className="data-surface flex items-start gap-3 border-warning/30 p-5 text-sm"
        >
          <CircleAlert className="h-5 w-5 flex-shrink-0 text-warning" />
          <div>
            <div className="font-medium text-text-primary">
              Could not load {assetName}
            </div>
            <div className="mt-1 text-xs text-text-muted">{error}</div>
            <button
              type="button"
              onClick={() => {
                setState("loading");
                fetchAssetDetail(assetName)
                  .then((result) => {
                    if (!result) setState("empty");
                    else {
                      setDetail(result);
                      setState("ready");
                    }
                  })
                  .catch((err: unknown) => {
                    setError(
                      err instanceof Error ? err.message : "Something went wrong"
                    );
                    setState("error");
                  });
              }}
              className="btn-secondary mt-3 min-h-9 px-3 py-1.5 text-xs"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {state === "empty" && (
        <div className="data-surface p-12 text-center text-text-muted">
          No on-chain issuance record found for{" "}
          <span className="font-medium text-text-primary">{assetName}</span>.
          It may belong to a managing contract outside QX.
        </div>
      )}

      {state === "ready" && asset && (
        <>
          <section
            className="data-surface p-5 sm:p-6"
            aria-label="Asset information"
          >
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-bg-hover bg-bg-hover lg:grid-cols-4">
              <div className="bg-bg-elevated p-4">
                <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-text-muted">
                  <User className="h-3 w-3" />
                  Issuer
                </dt>
                <dd className="mt-2 truncate font-mono text-sm text-text-primary">
                  <span title={asset.issuer}>{formatAddress(asset.issuer)}</span>
                </dd>
              </div>
              <div className="bg-bg-elevated p-4">
                <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-text-muted">
                  <Coins className="h-3 w-3" />
                  Issued supply
                </dt>
                <dd className="mt-2 font-mono text-sm text-text-primary">
                  {formatBalance(asset.totalSupply)}
                </dd>
              </div>
              <div className="bg-bg-elevated p-4">
                <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-text-muted">
                  <Hash className="h-3 w-3" />
                  Decimals
                </dt>
                <dd className="mt-2 font-mono text-sm text-text-primary">
                  {asset.decimals}
                </dd>
              </div>
              <div className="bg-bg-elevated p-4">
                <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-text-muted">
                  <Layers className="h-3 w-3" />
                  First seen
                </dt>
                <dd className="mt-2 text-sm text-text-secondary">
                  Tick {formatTick(asset.firstSeenTick)}
                  <span className="mt-1 block text-xs text-text-muted">
                    {formatEventTimestamp(asset.firstSeenTimestamp)}
                  </span>
                </dd>
              </div>
            </dl>
          </section>

          <section
            className="data-surface flex items-start gap-3 border-dashed border-bg-hover p-5 text-sm"
            aria-label="Price availability"
          >
            <CircleAlert className="h-5 w-5 flex-shrink-0 text-text-disabled" />
            <div>
              <div className="font-medium text-text-primary">
                Price and market data unavailable
              </div>
              <p className="mt-1 text-xs leading-5 text-text-muted">
                QubicPulse only shows price, holder counts, or historical charts
                when a reliable verified source exists. No such source is
                available for this asset yet.
              </p>
            </div>
          </section>

          <section className="data-surface overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-bg-hover p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
              <div>
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-qubic-gold">
                  <ArrowDownUp className="h-3 w-3" />
                  Recent activity
                </div>
                <h2 className="font-heading text-xl font-semibold text-text-primary">
                  Recent transfers
                </h2>
                <p className="mt-1 text-xs leading-5 text-text-muted">
                  Latest sample from Qubic Event Logs, not a completed history.
                </p>
              </div>
              {detail && (
                <span className="text-xs text-text-muted">
                  {detail.transfers.length} events sampled
                </span>
              )}
            </div>

            {detail?.transfers.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-text-muted">
                No recent transfers were returned for this asset.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-bg-hover bg-bg-elevated/50 text-left text-[11px] uppercase tracking-wider text-text-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold" scope="col">
                        From
                      </th>
                      <th className="px-4 py-3 font-semibold" scope="col">
                        To
                      </th>
                      <th className="px-4 py-3 text-right font-semibold" scope="col">
                        Shares
                      </th>
                      <th className="px-4 py-3 font-semibold" scope="col">
                        Tick
                      </th>
                      <th className="px-4 py-3 font-semibold" scope="col">
                        Date
                      </th>
                      <th className="px-4 py-3 font-semibold" scope="col">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail?.transfers.map((event) => {
                      const change = event.assetPossessionChange;
                      return (
                        <tr
                          key={event.logId}
                          className="border-b border-bg-hover/50 last:border-0 transition-colors hover:bg-bg-elevated/30"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-text-muted">
                            {change ? formatAddress(change.source) : "—"}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-text-muted">
                            {change ? formatAddress(change.destination) : "—"}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                            {change ? formatBalance(Number(change.numberOfShares)) : "—"}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-text-muted">
                            {event.tickNumber.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-text-disabled" />
                    {formatEventTimestamp(event.timestamp)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`https://explorer.qubic.org/network/tx/${event.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open transaction in Qubic Explorer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-hover hover:text-qubic-cyan"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p className="text-xs leading-5 text-text-muted">
            Activity is reconstructed from a recent sample of Qubic Event Logs
            and can lag the live network. Supply reflects the issuance event, not
            current circulation.
          </p>
        </>
      )}
    </div>
  );
}