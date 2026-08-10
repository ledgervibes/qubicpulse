import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Coins,
  Search,
  Star,
  Clock,
  ArrowUpDown,
  RefreshCw,
  CircleAlert,
} from "lucide-react";
import { useAssetStore } from "../stores/assetStore";
import { formatEventTimestamp } from "../utils/format";

function shortenAddress(addr: string): string {
  if (!addr || addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-8)}`;
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toLocaleString();
}

export function Tokens() {
  const {
    assets,
    loading,
    error,
    searchQuery,
    sortBy,
    showWatchlistOnly,
    recentlyDiscovered,
    watchlist,
    fetchAssets,
    fetchRecentlyDiscovered,
    setSearchQuery,
    setSortBy,
    setShowWatchlistOnly,
    toggleWatchlist,
    loadWatchlist,
  } = useAssetStore();

  useEffect(() => {
    loadWatchlist();
    fetchAssets();
    fetchRecentlyDiscovered();
  }, [fetchAssets, fetchRecentlyDiscovered, loadWatchlist]);

  const filtered = useMemo(() => {
    let list = assets;
    if (showWatchlistOnly) {
      list = list.filter((a) => watchlist.includes(a.name));
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.issuer.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "recent") {
      sorted.sort((a, b) => b.firstSeenTick - a.firstSeenTick);
    } else {
      sorted.sort((a, b) => b.recentTransfers - a.recentTransfers);
    }
    return sorted;
  }, [assets, searchQuery, sortBy, showWatchlistOnly, watchlist]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            <Coins className="h-3.5 w-3.5" />
            QX asset discovery
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Token Explorer
          </h1>
          <p className="mt-2 text-sm text-text-muted sm:text-base">
            Assets issued on Qubic, reconstructed from on-chain issuance events.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchAssets()}
          className="btn-secondary"
          aria-label="Refresh asset list"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <section className="data-surface p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by asset name or issuer identity…"
              className="w-full rounded-lg border border-bg-hover bg-bg-elevated py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-qubic-cyan/50 focus:outline-none"
              aria-label="Search assets"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-text-muted">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "name" | "recent" | "transfers")
                }
                className="rounded-md border border-bg-hover bg-bg-elevated px-2 py-1.5 text-xs text-text-primary focus:border-qubic-cyan/50 focus:outline-none"
                aria-label="Sort assets"
              >
                <option value="name">Name (A–Z)</option>
                <option value="recent">Recently issued</option>
                <option value="transfers">Recent transfers</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                showWatchlistOnly
                  ? "bg-qubic-gold/15 text-qubic-gold"
                  : "border border-bg-hover bg-bg-elevated text-text-muted hover:text-text-primary"
              }`}
              aria-pressed={showWatchlistOnly}
            >
              <Star
                className={`h-3.5 w-3.5 ${
                  showWatchlistOnly ? "fill-qubic-gold text-qubic-gold" : ""
                }`}
              />
              Watchlist only
            </button>
          </div>
        </div>
      </section>

      {loading && assets.length === 0 && (
        <div
          className="data-surface flex items-center justify-center gap-3 p-12 text-text-muted"
          role="status"
        >
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading on-chain assets…
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="data-surface flex items-start gap-3 border-warning/30 p-5 text-sm"
        >
          <CircleAlert className="h-5 w-5 flex-shrink-0 text-warning" />
          <div>
            <div className="font-medium text-text-primary">
              Could not load asset list
            </div>
            <div className="mt-1 text-xs text-text-muted">{error}</div>
          </div>
        </div>
      )}

      {!loading && !error && assets.length === 0 && (
        <div className="data-surface p-12 text-center text-text-muted">
          No assets discovered yet. Qubic issuance events will appear here once
          fetched.
        </div>
      )}

      {recentlyDiscovered.length > 0 && !searchQuery && !showWatchlistOnly && (
        <section className="data-surface p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            <Clock className="h-3.5 w-3.5" />
            Recently discovered
          </div>
          <div className="flex flex-wrap gap-2">
            {recentlyDiscovered.slice(0, 10).map((a) => (
              <Link
                key={a.name}
                to={`/tokens/${encodeURIComponent(a.name)}`}
                className="rounded-lg border border-bg-hover bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:border-qubic-cyan/40 hover:text-qubic-cyan"
              >
                {a.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {filtered.length > 0 && (
        <section className="data-surface overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-bg-hover bg-bg-elevated/50 text-left text-[11px] uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Asset
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Issuer
                  </th>
                  <th className="px-4 py-3 text-right font-semibold" scope="col">
                    Recent transfers
                  </th>
                  <th className="px-4 py-3 text-right font-semibold" scope="col">
                    Total Supply
                  </th>
                  <th className="px-4 py-3 text-right font-semibold" scope="col">
                    Decimals
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    First seen
                  </th>
                  <th className="px-4 py-3 text-right font-semibold" scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((asset) => {
                  const isWatched = watchlist.includes(asset.name);
                  return (
                    <tr
                      key={asset.name}
                      className="border-b border-bg-hover/50 last:border-0 transition-colors hover:bg-bg-elevated/30"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/tokens/${encodeURIComponent(asset.name)}`}
                          className="font-medium text-text-primary hover:text-qubic-cyan"
                        >
                          {asset.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-text-muted">
                        {shortenAddress(asset.issuer)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                        {asset.recentTransfers.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                        {formatNumber(asset.totalSupply)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-text-muted">
                        {asset.decimals}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-muted">
                        {formatEventTimestamp(asset.firstSeenTimestamp)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => toggleWatchlist(asset.name)}
                          aria-label={
                            isWatched
                              ? `Remove ${asset.name} from watchlist`
                              : `Add ${asset.name} to watchlist`
                          }
                          aria-pressed={isWatched}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              isWatched
                                ? "fill-qubic-gold text-qubic-gold"
                                : ""
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-bg-hover px-4 py-2.5 text-xs text-text-muted">
            Showing {filtered.length}
            {filtered.length !== assets.length ? ` of ${assets.length}` : ""} on-chain
            asset
            {assets.length !== 1 ? "s" : ""}.
          </div>
        </section>
      )}

      {!loading && !error && assets.length > 0 && filtered.length === 0 && (
        <div className="data-surface p-12 text-center text-text-muted">
          No assets match your filters.
        </div>
      )}
    </div>
  );
}
