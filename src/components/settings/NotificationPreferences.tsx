import { useNotificationStore } from "../../stores/notificationStore";
import { Bell } from "lucide-react";

export function NotificationPreferences() {
  const preferences = useNotificationStore((s) => s.preferences);
  const updatePreferences = useNotificationStore((s) => s.updatePreferences);

  const toggles = [
    {
      key: "priceAlerts" as const,
      label: "Price Alerts",
      desc: "Get notified when QUBIC price hits your target",
    },
    {
      key: "walletTx" as const,
      label: "Wallet Transactions",
      desc: "Get notified when your wallet receives or sends QUBIC",
    },
    {
      key: "dailySummary" as const,
      label: "Daily Summary",
      desc: "Receive a daily summary of price and portfolio",
    },
    {
      key: "weeklySummary" as const,
      label: "Weekly Summary",
      desc: "Receive a weekly summary every Monday",
    },
  ];

  return (
    <div className="rounded-xl border border-bg-hover bg-bg-surface p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-lg bg-qubic-gold/10 flex items-center justify-center text-qubic-gold">
          <Bell className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-text-primary">
            Notification Preferences
          </h3>
          <p className="text-xs text-text-muted">
            Choose what notifications you want to receive
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {toggles.map((toggle) => (
          <div
            key={toggle.key}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-elevated transition-colors"
          >
            <div>
              <div className="text-sm font-medium text-text-primary">
                {toggle.label}
              </div>
              <div className="text-xs text-text-muted">{toggle.desc}</div>
            </div>
            <button
              onClick={() =>
                updatePreferences({
                  [toggle.key]: !preferences[toggle.key],
                })
              }
              className={`relative w-10 h-6 rounded-full transition-colors ${
                preferences[toggle.key]
                  ? "bg-qubic-cyan"
                  : "bg-bg-hover"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  preferences[toggle.key]
                    ? "left-5"
                    : "left-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {preferences.dailySummary && (
        <div className="mt-3 pt-3 border-t border-bg-hover">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Summary time:</span>
            <input
              type="time"
              value={preferences.summaryTime}
              onChange={(e) =>
                updatePreferences({ summaryTime: e.target.value })
              }
              className="px-2 py-1 rounded bg-bg-elevated text-text-primary text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
