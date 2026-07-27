import { useEffect, useRef } from "react";
import { useNotificationStore } from "../stores/notificationStore";
import { usePriceStore } from "../stores/priceStore";
import { useWalletStore } from "../stores/walletStore";
import { sendDailySummary } from "../services/telegram";
import * as storage from "../services/storage";

function shouldSendSummary(
  type: "daily" | "weekly",
  summaryTime: string
): boolean {
  const now = new Date();
  const [hours, minutes] = summaryTime.split(":").map(Number);

  if (type === "daily") {
    const lastSent = storage.getItem<string>("last_daily_summary", "");
    const today = now.toISOString().slice(0, 10);
    if (lastSent === today) return false;
    return now.getHours() === hours && now.getMinutes() >= minutes && now.getMinutes() < minutes + 5;
  }

  if (type === "weekly") {
    const lastSent = storage.getItem<string>("last_weekly_summary", "");
    const thisWeek = `${now.getFullYear()}-W${Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7)}`;
    if (lastSent === thisWeek) return false;
    return now.getDay() === 1 && now.getHours() === hours && now.getMinutes() >= minutes && now.getMinutes() < minutes + 5;
  }

  return false;
}

export function useSummaryScheduler() {
  const preferences = useNotificationStore((s) => s.preferences);
  const telegramChatId = useNotificationStore((s) => s.telegramChatId);
  const connected = useNotificationStore((s) => s.connected);
  const price = usePriceStore((s) => s.price);
  const wallets = useWalletStore((s) => s.wallets);
  const balances = useWalletStore((s) => s.balances);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!connected || !telegramChatId) return;

    const checkAndSend = async () => {
      const totalBalance = wallets.reduce((sum, w) => {
        const bal = balances.get(w.address);
        return sum + (bal?.balance ?? 0);
      }, 0);

      if (preferences.dailySummary && shouldSendSummary("daily", preferences.summaryTime)) {
        try {
          await sendDailySummary(
            telegramChatId,
            price?.usd ?? 0,
            price?.usd_24h_change ?? 0,
            totalBalance
          );
          storage.setItem("last_daily_summary", new Date().toISOString().slice(0, 10));
        } catch (e) {
          console.error("Failed to send daily summary:", e);
        }
      }

      if (preferences.weeklySummary && shouldSendSummary("weekly", preferences.summaryTime)) {
        try {
          await sendDailySummary(
            telegramChatId,
            price?.usd ?? 0,
            price?.usd_24h_change ?? 0,
            totalBalance
          );
          const now = new Date();
          storage.setItem("last_weekly_summary", `${now.getFullYear()}-W${Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7)}`);
        } catch (e) {
          console.error("Failed to send weekly summary:", e);
        }
      }
    };

    intervalRef.current = setInterval(checkAndSend, 60000);
    checkAndSend();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [connected, telegramChatId, preferences, price, wallets, balances]);
}
