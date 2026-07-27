import { create } from "zustand";
import type { PriceAlert } from "../types";
import * as storage from "../services/storage";

interface AlertHistoryItem {
  id: string;
  alertId: string;
  message: string;
  triggeredAt: number;
  sentToTelegram: boolean;
  sentToBrowser: boolean;
}

interface AlertStore {
  alerts: PriceAlert[];
  history: AlertHistoryItem[];

  loadAlerts: () => void;
  addAlert: (alert: Omit<PriceAlert, "id" | "createdAt">) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  addToHistory: (item: Omit<AlertHistoryItem, "id" | "triggeredAt">) => void;
  clearHistory: () => void;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  history: [],

  loadAlerts: () => {
    const alerts = storage.getItem<PriceAlert[]>("price_alerts", []);
    const history = storage.getItem<AlertHistoryItem[]>("alert_history", []);
    set({ alerts, history });
  },

  addAlert: (alert) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    const alerts = [...get().alerts, newAlert];
    storage.setItem("price_alerts", alerts);
    set({ alerts });
  },

  removeAlert: (id) => {
    const alerts = get().alerts.filter((a) => a.id !== id);
    storage.setItem("price_alerts", alerts);
    set({ alerts });
  },

  toggleAlert: (id) => {
    const alerts = get().alerts.map((a) =>
      a.id === id ? { ...a, active: !a.active } : a
    );
    storage.setItem("price_alerts", alerts);
    set({ alerts });
  },

  addToHistory: (item) => {
    const newItem: AlertHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      triggeredAt: Date.now(),
    };
    const history = [newItem, ...get().history].slice(0, 100);
    storage.setItem("alert_history", history);
    set({ history });
  },

  clearHistory: () => {
    storage.setItem("alert_history", []);
    set({ history: [] });
  },
}));
