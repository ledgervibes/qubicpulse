import { useEffect } from "react";
import { useWalletStore } from "../stores/walletStore";
import { usePriceStore } from "../stores/priceStore";
import { useAlertStore } from "../stores/alertStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useSummaryScheduler } from "./useSummaryScheduler";
import { POLL_INTERVAL_MS, PRICE_POLL_INTERVAL_MS } from "../utils/constants";

export function useInitData() {
  const loadWallets = useWalletStore((s) => s.loadWallets);
  const refreshBalances = useWalletStore((s) => s.refreshBalances);
  const fetchPrice = usePriceStore((s) => s.fetchPrice);
  const fetchHistory = usePriceStore((s) => s.fetchHistory);
  const loadAlerts = useAlertStore((s) => s.loadAlerts);
  const loadTelegram = useNotificationStore((s) => s.loadTelegram);

  useSummaryScheduler();

  useEffect(() => {
    loadWallets();
    loadAlerts();
    loadTelegram();
    fetchPrice();
    fetchHistory(7);
  }, [loadWallets, loadAlerts, loadTelegram, fetchPrice, fetchHistory]);

  useEffect(() => {
    const id = setInterval(refreshBalances, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refreshBalances]);

  useEffect(() => {
    const id = setInterval(fetchPrice, PRICE_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchPrice]);
}
