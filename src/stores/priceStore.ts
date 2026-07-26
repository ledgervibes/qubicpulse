import { create } from "zustand";
import type { PriceData, PriceHistory } from "../types";
import * as priceService from "../services/price-service";

interface PriceStore {
  price: PriceData | null;
  history: PriceHistory | null;
  loading: boolean;
  error: string | null;
  lastFetched: number;

  fetchPrice: () => Promise<void>;
  fetchHistory: (days?: number) => Promise<void>;
}

export const usePriceStore = create<PriceStore>((set) => ({
  price: null,
  history: null,
  loading: false,
  error: null,
  lastFetched: 0,

  fetchPrice: async () => {
    set({ loading: true, error: null });
    try {
      const price = await priceService.getPrice();
      if (price) {
        set({ price, lastFetched: Date.now(), error: null });
      } else {
        set({ error: "Failed to fetch price data" });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      set({ loading: false });
    }
  },

  fetchHistory: async (days = 7) => {
    try {
      const history = await priceService.getPriceHistory(days);
      if (history) {
        set({ history });
      }
    } catch {
      // keep stale data
    }
  },
}));
