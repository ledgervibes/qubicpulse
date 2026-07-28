import { useEffect, useRef, useCallback } from "react";
import { useWalletStore } from "../stores/walletStore";
import { getEventLogs } from "../services/qubic-rpc";
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
const LAST_TICK_KEY = "wallet_last_tick";

export function useWalletMonitor() {
  const wallets = useWalletStore((s) => s.wallets);
  const balances = useWalletStore((s) => s.balances);
  const refreshBalances = useWalletStore((s) => s.refreshBalances);

  const prevBalancesRef = useRef<Map<string, { incoming: number; outgoing: number }>>(new Map());
  const notifiedRef = useRef<Set<string>>(new Set());
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

  const getLastTick = useCallback((address: string): number => {
    const stored = localStorage.getItem(`${LAST_TICK_KEY}_${address}`);
    return stored ? Number(stored) : 0;
  }, []);

  const saveLastTick = useCallback((address: string, tick: number) => {
    localStorage.setItem(`${LAST_TICK_KEY}_${address}`, String(tick));
  }, []);

  const addNotification = useCallback(
    (notif: Omit<WalletNotification, "id" | "timestamp" | "read">) => {
      // Prevent duplicate notifications
      const key = `${notif.walletAddress}-${notif.type}-${notif.amount}-${notif.tokenName}`;
      if (notifiedRef.current.has(key)) return;
      notifiedRef.current.add(key);

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

  // Check QUBIC balance changes
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

  // Check ALL token changes via Event Logs
  const checkAssetChanges = useCallback(async () => {
    let currentTick = 0;
    try {
      const status = await fetch("https://rpc.qubic.org/v1/status");
      if (status.ok) {
        const data = await status.json();
        currentTick = data.lastProcessedTick?.tickNumber ?? 0;
      }
    } catch {
      return;
    }

    if (currentTick === 0) return;

    for (const wallet of wallets) {
      const lastTick = getLastTick(wallet.address);

      if (currentTick <= lastTick) continue;

      // Check incoming token transfers
      try {
        const incomingEvents = await getEventLogs(
          { destination: wallet.address, logType: "3" },
          100
        );

        for (const event of incomingEvents) {
          if (!event.assetPossessionChange) continue;
          if (event.tickNumber <= lastTick) continue;

          const { assetName, numberOfShares, source } = event.assetPossessionChange;
          if (!assetName || assetName.trim() === "") continue;
          const shares = Number(numberOfShares);
          if (isNaN(shares) || shares <= 0) continue;

          addNotification({
            type: "incoming_token",
            walletLabel: wallet.label,
            walletAddress: wallet.address,
            amount: shares,
            tokenName: assetName,
            otherAddress: source,
          });
        }
      } catch (e) {
        console.error(`Error checking incoming assets for ${wallet.address}:`, e);
      }

      // Check outgoing token transfers
      try {
        const outgoingEvents = await getEventLogs(
          { source: wallet.address, logType: "3" },
          100
        );

        for (const event of outgoingEvents) {
          if (!event.assetPossessionChange) continue;
          if (event.tickNumber <= lastTick) continue;

          const { assetName, numberOfShares, destination } = event.assetPossessionChange;
          if (!assetName || assetName.trim() === "") continue;
          const shares = Number(numberOfShares);
          if (isNaN(shares) || shares <= 0) continue;

          addNotification({
            type: "outgoing_token",
            walletLabel: wallet.label,
            walletAddress: wallet.address,
            amount: shares,
            tokenName: assetName,
            otherAddress: destination,
          });
        }
      } catch (e) {
        console.error(`Error checking outgoing assets for ${wallet.address}:`, e);
      }

      // Always update last processed tick
      saveLastTick(wallet.address, currentTick);
    }
  }, [wallets, addNotification, getLastTick, saveLastTick]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (wallets.length === 0) return;

    // Initial refresh
    refreshBalances();

    // Poll QUBIC balance
    const balanceInterval = setInterval(() => {
      refreshBalances();
    }, POLL_INTERVAL_MS);

    // Poll asset changes (less frequent)
    const assetInterval = setInterval(() => {
      checkAssetChanges();
    }, 60000); // Every 60 seconds

    // Initial asset check
    checkAssetChanges();

    return () => {
      clearInterval(balanceInterval);
      clearInterval(assetInterval);
    };
  }, [wallets.length, refreshBalances, checkAssetChanges]);

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
