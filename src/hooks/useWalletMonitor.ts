import { useEffect, useRef, useCallback } from "react";
import { useWalletStore } from "../stores/walletStore";
import { POLL_INTERVAL_MS } from "../utils/constants";

export interface WalletNotification {
  id: string;
  type: "incoming_qubic" | "outgoing_qubic" | "incoming_token" | "outgoing_token";
  walletLabel: string;
  walletAddress: string;
  amount: number;
  tokenName: string;
  otherAddress: string;
  timestamp: number;
  read: boolean;
}

const NOTIFICATIONS_KEY = "wallet_notifications";

export function useWalletMonitor() {
  const wallets = useWalletStore((s) => s.wallets);
  const balances = useWalletStore((s) => s.balances);
  const refreshBalances = useWalletStore((s) => s.refreshBalances);

  const prevBalancesRef = useRef<Map<string, { incoming: number; outgoing: number }>>(new Map());
  const notificationsRef = useRef<WalletNotification[]>([]);

  const loadNotifications = useCallback(() => {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) {
      try {
        notificationsRef.current = JSON.parse(stored);
      } catch {
        notificationsRef.current = [];
      }
    }
  }, []);

  const saveNotifications = useCallback(() => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notificationsRef.current));
  }, []);

  const addNotification = useCallback(
    (notif: Omit<WalletNotification, "id" | "timestamp" | "read">) => {
      const newNotif: WalletNotification = {
        ...notif,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        read: false,
      };
      notificationsRef.current = [newNotif, ...notificationsRef.current].slice(0, 100);
      saveNotifications();

      // Dispatch custom event for toast
      window.dispatchEvent(new CustomEvent("wallet-notification", { detail: newNotif }));
    },
    [saveNotifications]
  );

  const checkBalanceChanges = useCallback(() => {
    wallets.forEach((wallet) => {
      const currentBal = balances.get(wallet.address);
      const prevBal = prevBalancesRef.current.get(wallet.address);

      if (currentBal && prevBal) {
        const incomingDiff = currentBal.incomingAmount - prevBal.incoming;
        const outgoingDiff = currentBal.outgoingAmount - prevBal.outgoing;

        if (incomingDiff > 0) {
          addNotification({
            type: "incoming_qubic",
            walletLabel: wallet.label,
            walletAddress: wallet.address,
            amount: incomingDiff,
            tokenName: "QUBIC",
            otherAddress: "",
          });
        }

        if (outgoingDiff > 0) {
          addNotification({
            type: "outgoing_qubic",
            walletLabel: wallet.label,
            walletAddress: wallet.address,
            amount: outgoingDiff,
            tokenName: "QUBIC",
            otherAddress: "",
          });
        }
      }

      if (currentBal) {
        prevBalancesRef.current.set(wallet.address, {
          incoming: currentBal.incomingAmount,
          outgoing: currentBal.outgoingAmount,
        });
      }
    });
  }, [wallets, balances, addNotification]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (wallets.length === 0) return;

    // Initial refresh
    refreshBalances();

    const interval = setInterval(() => {
      refreshBalances();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [wallets.length, refreshBalances]);

  useEffect(() => {
    checkBalanceChanges();
  }, [balances, checkBalanceChanges]);

  const markAsRead = useCallback(
    (id: string) => {
      notificationsRef.current = notificationsRef.current.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      saveNotifications();
    },
    [saveNotifications]
  );

  const markAllAsRead = useCallback(() => {
    notificationsRef.current = notificationsRef.current.map((n) => ({
      ...n,
      read: true,
    }));
    saveNotifications();
  }, [saveNotifications]);

  const clearAll = useCallback(() => {
    notificationsRef.current = [];
    saveNotifications();
  }, [saveNotifications]);

  return {
    notifications: notificationsRef.current,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
