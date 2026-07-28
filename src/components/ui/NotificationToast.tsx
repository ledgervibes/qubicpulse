import { useState, useEffect } from "react";
import type { WalletNotification } from "../../hooks/useWalletMonitor";
import { ArrowDownLeft, ArrowUpRight, X } from "lucide-react";
import { formatBalance } from "../../utils/format";

export function NotificationToast() {
  const [notifications, setNotifications] = useState<WalletNotification[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const notif = (e as CustomEvent).detail as WalletNotification;
      setNotifications((prev) => [notif, ...prev].slice(0, 3));

      // Auto remove after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      }, 5000);
    };

    window.addEventListener("wallet-notification", handler);
    return () => window.removeEventListener("wallet-notification", handler);
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notif) => {
        const isIncoming = notif.type.startsWith("incoming");

        return (
          <div
            key={notif.id}
            className="glass-card p-4 animate-slide-in cursor-pointer hover:border-qubic-cyan/30 transition-colors"
            onClick={() =>
              setNotifications((prev) => prev.filter((n) => n.id !== notif.id))
            }
          >
            <div className="flex items-start gap-3">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isIncoming
                    ? "bg-success/10 text-success"
                    : "bg-danger/10 text-danger"
                }`}
              >
                {isIncoming ? (
                  <ArrowDownLeft className="w-4 h-4" />
                ) : (
                  <ArrowUpRight className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary">
                  {isIncoming ? "Incoming" : "Outgoing"} {notif.tokenName}
                </div>
                <div className="text-xs text-text-muted mt-0.5">
                  {isIncoming ? "+" : "-"}
                  {formatBalance(notif.amount)} {notif.tokenName}
                  {notif.walletLabel && ` • ${notif.walletLabel}`}
                </div>
              </div>
              <button
                className="text-text-disabled hover:text-text-primary transition-colors flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setNotifications((prev) =>
                    prev.filter((n) => n.id !== notif.id)
                  );
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
