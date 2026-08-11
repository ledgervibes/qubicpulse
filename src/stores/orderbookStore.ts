import { create } from "zustand";
import {
  fetchOrderBook,
  fetchOrderBooksInChunks,
  type OrderBook,
} from "../services/orderbook";

const STALE_TTL_MS = 5 * 60_000;
const CHUNK_SIZE = 16;
const CONCURRENCY = 8;
const DELAY_BETWEEN_CHUNKS_MS = 250;

interface OrderbookStore {
  orderbooks: Record<string, OrderBook>;
  loading: Set<string>;
  loadingStartedAt: number;
  fetchOrderbook: (name: string, issuer: string) => Promise<void>;
  loadOrderbooks: (
    assets: Array<{ name: string; issuer: string }>
  ) => Promise<void>;
}

export const useOrderbookStore = create<OrderbookStore>((set, get) => ({
  orderbooks: {},
  loading: new Set<string>(),
  loadingStartedAt: 0,

  fetchOrderbook: async (name, issuer) => {
    const key = name.toUpperCase();
    const existing = get().orderbooks[key];
    if (existing && Date.now() - existing.loadedAt < STALE_TTL_MS) return;
    if (get().loading.has(key)) return;

    set((s) => {
      const loading = new Set(s.loading);
      loading.add(key);
      return { loading };
    });

    try {
      const orderBook = await fetchOrderBook(issuer, name);
      set((s) => ({
        orderbooks: { ...s.orderbooks, [key]: orderBook },
      }));
    } catch {
      // ignore individual failures
    } finally {
      set((s) => {
        const loading = new Set(s.loading);
        loading.delete(key);
        return { loading };
      });
    }
  },

  loadOrderbooks: async (assets) => {
    const freshAssets = assets.filter((a) => {
      const existing = get().orderbooks[a.name.toUpperCase()];
      return !existing || Date.now() - existing.loadedAt >= STALE_TTL_MS;
    });
    if (freshAssets.length === 0) return;

    set({ loadingStartedAt: Date.now() });
    await fetchOrderBooksInChunks(
      freshAssets,
      CHUNK_SIZE,
      CONCURRENCY,
      (chunk) => {
        set((s) => {
          const orderbooks = { ...s.orderbooks };
          for (const [key, value] of chunk) orderbooks[key] = value;
          return { orderbooks };
        });
      },
      DELAY_BETWEEN_CHUNKS_MS
    );
  },
}));
