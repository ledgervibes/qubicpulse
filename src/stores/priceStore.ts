import { create } from "zustand";
import type { PriceData, PriceHistory } from "../types";
import * as cg from "../services/coingecko";

interface PriceStore {
  price: PriceData | null;
  history: PriceHistory | null;
  loading: boolean;
  lastFetched: number;

  fetchPrice: () => Promise<void>;
  fetchHistory: (days?: number) => Promise<void>;
}

export const usePriceStore = create<PriceStore>((set) => ({
  price: null,
  history: null,
  loading: false,
  lastFetched: 0,

  fetchPrice: async () => {
    set({ loading: true });
    try {
      const price = await cg.getPrice();
      set({ price, lastFetched: Date.now() });
    } catch {
      // keep stale data
    } finally {
      set({ loading: false });
    }
  },

  fetchHistory: async (days = 7) => {
    try {
      const history = await cg.getPriceHistory(days);
      set({ history });
    } catch {
      // keep stale data
    }
  },
}));
