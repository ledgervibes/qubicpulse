import { create } from "zustand";
import * as storage from "../services/storage";

export interface NotificationPreferences {
  priceAlerts: boolean;
  walletTx: boolean;
  dailySummary: boolean;
  weeklySummary: boolean;
  summaryTime: string;
  rewardAlerts: boolean;
}

interface NotificationStore {
  telegramChatId: string | null;
  preferences: NotificationPreferences;
  connected: boolean;

  loadTelegram: () => void;
  setChatId: (chatId: string) => void;
  disconnect: () => void;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
}

const defaultPreferences: NotificationPreferences = {
  priceAlerts: true,
  walletTx: true,
  dailySummary: false,
  weeklySummary: false,
  summaryTime: "09:00",
  rewardAlerts: true,
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  telegramChatId: null,
  preferences: defaultPreferences,
  connected: false,

  loadTelegram: () => {
    const chatId = storage.getItem<string | null>("telegram_chat_id", null);
    const prefs = storage.getItem<NotificationPreferences>(
      "notification_preferences",
      defaultPreferences
    );
    set({ telegramChatId: chatId, preferences: prefs, connected: !!chatId });
  },

  setChatId: (chatId) => {
    storage.setItem("telegram_chat_id", chatId);
    set({ telegramChatId: chatId, connected: true });
  },

  disconnect: () => {
    storage.removeItem("telegram_chat_id");
    set({ telegramChatId: null, connected: false });
  },

  updatePreferences: (prefs) => {
    const newPrefs = { ...get().preferences, ...prefs };
    storage.setItem("notification_preferences", newPrefs);
    set({ preferences: newPrefs });
  },
}));
