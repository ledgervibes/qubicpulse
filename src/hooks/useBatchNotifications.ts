import { useNotificationStore } from "../stores/notificationStore";
import { sendBatchNotification } from "../services/telegram";
import { useRef, useEffect, useCallback } from "react";

interface PendingAlert {
  type: string;
  message: string;
  timestamp: number;
}

export function useBatchNotifications() {
  const telegramChatId = useNotificationStore((s) => s.telegramChatId);
  const connected = useNotificationStore((s) => s.connected);
  const pendingRef = useRef<PendingAlert[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushAlerts = useCallback(async () => {
    if (!connected || !telegramChatId || pendingRef.current.length === 0) return;

    const alertsToSend = [...pendingRef.current];
    pendingRef.current = [];

    try {
      await sendBatchNotification(
        telegramChatId,
        alertsToSend.map((a) => ({ type: a.type, message: a.message }))
      );
    } catch (e) {
      console.error("Failed to send batch notifications:", e);
      pendingRef.current = [...alertsToSend, ...pendingRef.current];
    }
  }, [connected, telegramChatId]);

  const addAlert = useCallback(
    (type: string, message: string) => {
      pendingRef.current.push({ type, message, timestamp: Date.now() });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(flushAlerts, 5000);
    },
    [flushAlerts]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { addAlert };
}
