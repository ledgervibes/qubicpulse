import { useEffect, useRef } from "react";
import { useNotificationStore } from "../stores/notificationStore";
import { useWalletStore } from "../stores/walletStore";
import { getQEarnEndedStatus } from "../services/qearn";
import { sendRewardNotification } from "../services/telegram";
import { sendNotification } from "../services/notification";
import { getStatus } from "../services/qubic-rpc";

const POLL_INTERVAL = 5 * 60 * 1000;

export function useRewardMonitor() {
  const connected = useNotificationStore((s) => s.connected);
  const telegramChatId = useNotificationStore((s) => s.telegramChatId);
  const rewardAlerts = useNotificationStore((s) => s.preferences.rewardAlerts);
  const wallets = useWalletStore((s) => s.wallets);

  const lastCheckedRef = useRef<Record<string, number>>({});
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!connected || !rewardAlerts || !telegramChatId) return;
    if (wallets.length === 0) return;

    let mounted = true;

    async function checkRewards() {
      try {
        const status = await getStatus();

        for (const wallet of wallets) {
          if (!mounted) break;

          try {
            const qearnStatus = await getQEarnEndedStatus(wallet.address);
            const lastChecked = lastCheckedRef.current[wallet.address] || 0;
            const currentRewarded = qearnStatus.fullyRewardedAmount;

            if (initializedRef.current && currentRewarded > lastChecked) {
              const newReward = currentRewarded - lastChecked;

              if (newReward > 0 && telegramChatId) {
                await sendRewardNotification(
                  telegramChatId,
                  "qearn",
                  newReward,
                  status.epoch
                );

                sendNotification(
                  "Staking Reward!",
                  `You received ${newReward.toLocaleString()} QU from QEarn`,
                  "/logo.svg"
                );
              }
            }

            lastCheckedRef.current[wallet.address] = currentRewarded;
          } catch {
            // skip this wallet
          }
        }

        initializedRef.current = true;
      } catch {
        // silent fail
      }
    }

    checkRewards();
    const interval = setInterval(checkRewards, POLL_INTERVAL);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [connected, rewardAlerts, telegramChatId, wallets]);
}
