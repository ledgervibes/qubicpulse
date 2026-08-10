import { create } from "zustand";
import type { QubicAsset, AssetWithActivity } from "../services/assets";
import type { EventLog } from "../services/qubic-rpc";
import {
  getAssetByName,
  getAssetListWithActivity,
  getAssetRecentTransfers,
  getRecentlyIssuedAssets,
} from "../services/assets";
import * as storage from "../services/storage";

const WATCHLIST_KEY = "asset_watchlist";
const RECENT_KEY = "recently_discovered_assets";
const RECENT_LOADED_KEY = "recently_discovered_loaded";
const ASSETS_TTL_MS = 60_000;

interface AssetDetail {
  asset: QubicAsset;
  transfers: EventLog[];
  loadedAt: number;
}

interface AssetStore {
  assets: AssetWithActivity[];
  loading: boolean;
  error: string | null;
  assetsLoadedAt: number;
  searchQuery: string;
  sortBy: "name" | "recent" | "transfers";
  showWatchlistOnly: boolean;

  recentlyDiscovered: QubicAsset[];
  recentlyDiscoveredLoadedAt: number;

  assetDetailCache: Map<string, AssetDetail>;

  watchlist: string[];

  fetchAssets: () => Promise<void>;
  fetchRecentlyDiscovered: () => Promise<void>;
  fetchAssetDetail: (assetName: string) => Promise<AssetDetail | null>;

  setSearchQuery: (q: string) => void;
  setSortBy: (sort: "name" | "recent" | "transfers") => void;
  setShowWatchlistOnly: (v: boolean) => void;

  loadWatchlist: () => void;
  toggleWatchlist: (assetName: string) => void;
  isWatchlisted: (assetName: string) => boolean;
}

export const useAssetStore = create<AssetStore>((set, get) => ({
  assets: [],
  loading: false,
  error: null,
  assetsLoadedAt: 0,
  searchQuery: "",
  sortBy: "name",
  showWatchlistOnly: false,

  recentlyDiscovered: [],
  recentlyDiscoveredLoadedAt: 0,

  assetDetailCache: new Map(),

  watchlist: storage.getItem<string[]>(WATCHLIST_KEY, []),

  fetchAssets: async () => {
    if (
      get().assets.length > 0 &&
      Date.now() - get().assetsLoadedAt < ASSETS_TTL_MS
    ) {
      return;
    }
    set({ loading: true, error: null });
    try {
      const assets = await getAssetListWithActivity();
      set({ assets, loading: false, assetsLoadedAt: Date.now() });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch assets",
        loading: false,
      });
    }
  },

  fetchRecentlyDiscovered: async () => {
    try {
      const cached = storage.getItem<QubicAsset[]>(RECENT_KEY, []);
      const cachedAt = storage.getItem<number>(RECENT_LOADED_KEY, 0);
      set({ recentlyDiscovered: cached, recentlyDiscoveredLoadedAt: cachedAt });

      const fresh = await getRecentlyIssuedAssets(20);
      storage.setItem(RECENT_KEY, fresh);
      storage.setItem(RECENT_LOADED_KEY, Date.now());
      set({ recentlyDiscovered: fresh, recentlyDiscoveredLoadedAt: Date.now() });
    } catch {
      // silent fail — cached data already set above
    }
  },

  fetchAssetDetail: async (assetName: string) => {
    const cache = get().assetDetailCache;
    const cached = cache.get(assetName);
    if (cached && Date.now() - cached.loadedAt < 5 * 60 * 1000) {
      return cached;
    }

    try {
      const asset = await getAssetByName(assetName);
      if (!asset) return null;

      const transfers = await getAssetRecentTransfers(assetName, 50);
      const detail: AssetDetail = { asset, transfers, loadedAt: Date.now() };

      const newCache = new Map(cache);
      newCache.set(assetName, detail);
      set({ assetDetailCache: newCache });

      return detail;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to fetch asset");
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setShowWatchlistOnly: (v) => set({ showWatchlistOnly: v }),

  loadWatchlist: () => {
    const list = storage.getItem<string[]>(WATCHLIST_KEY, []);
    set({ watchlist: list });
  },

  toggleWatchlist: (assetName: string) => {
    const list = get().watchlist;
    const next = list.includes(assetName)
      ? list.filter((n) => n !== assetName)
      : [...list, assetName];
    storage.setItem(WATCHLIST_KEY, next);
    set({ watchlist: next });
  },

  isWatchlisted: (assetName: string) => {
    return get().watchlist.includes(assetName);
  },
}));