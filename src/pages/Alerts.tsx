import { useState, useEffect, useCallback, useRef } from "react";
import { usePriceStore } from "../stores/priceStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useAlertStore } from "../stores/alertStore";
import { useWalletMonitor } from "../hooks/useWalletMonitor";
import { formatCurrency, formatBalance, timeAgo } from "../utils/format";
import { sendPriceAlert } from "../services/telegram";
import * as notif from "../services/notification";
import {
  Bell,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  BellRing,
  BarChart3,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCheck,
  Wallet,
} from "lucide-react";

const ALERT_TYPES = [
  { id: "price_above", label: "Price Above", icon: TrendingUp, color: "success" },
  { id: "price_below", label: "Price Below", icon: TrendingDown, color: "danger" },
  { id: "price_change", label: "Price Change %", icon: BarChart3, color: "warning" },
  { id: "volume_spike", label: "Volume Spike", icon: BarChart3, color: "info" },
];

type TabType = "price" | "wallet";

export function Alerts() {
  const price = usePriceStore((s) => s.price);
  const alerts = useAlertStore((s) => s.alerts);
  const loadAlerts = useAlertStore((s) => s.loadAlerts);
  const addAlert = useAlertStore((s) => s.addAlert);
  const removeAlert = useAlertStore((s) => s.removeAlert);
  const toggleAlert = useAlertStore((s) => s.toggleAlert);
  const addToHistory = useAlertStore((s) => s.addToHistory);

  const telegramChatId = useNotificationStore((s) => s.telegramChatId);
  const connected = useNotificationStore((s) => s.connected);

  const { notifications, markAllAsRead } = useWalletMonitor();

  const [activeTab, setActiveTab] = useState<TabType>("price");
  const [showAdd, setShowAdd] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [alertType, setAlertType] = useState("price_above");
  const [notifEnabled, setNotifEnabled] = useState(
    notif.isSupported() && Notification.permission === "granted"
  );
  const triggeredRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleEnableNotif = async () => {
    const result = await notif.requestPermission();
    setNotifEnabled(result === "granted");
  };

  const handleAdd = () => {
    const num = parseFloat(targetPrice);
    if (isNaN(num) || num <= 0) return;

    addAlert({
      condition: alertType.includes("above") ? "above" : "below",
      targetPrice: num,
      active: true,
    });
    setTargetPrice("");
    setShowAdd(false);
  };

  const checkAlerts = useCallback(() => {
    if (!price) return;
    const currentPrice = price.usd;

    alerts.forEach((alert) => {
      if (!alert.active) return;
      if (triggeredRef.current.has(alert.id)) return;

      const triggered =
        (alert.condition === "above" && currentPrice >= alert.targetPrice) ||
        (alert.condition === "below" && currentPrice <= alert.targetPrice);

      if (triggered) {
        triggeredRef.current.add(alert.id);

        const message = `QUBIC ${alert.condition === "above" ? "above" : "below"} ${formatCurrency(alert.targetPrice)} - Current: ${formatCurrency(currentPrice)}`;

        notif.sendNotification("QubicPulse Price Alert", message);

        if (connected && telegramChatId) {
          sendPriceAlert(telegramChatId, alert.condition, alert.targetPrice, currentPrice).catch(console.error);
        }

        addToHistory({
          alertId: alert.id,
          message,
          sentToTelegram: connected,
          sentToBrowser: notifEnabled,
        });
      }
    });
  }, [price, alerts, connected, telegramChatId, notifEnabled, addToHistory]);

  useEffect(() => {
    checkAlerts();
  }, [checkAlerts]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Alerts
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Price alerts and wallet notifications
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-elevated/50 rounded-lg p-1 w-full sm:w-fit">
        <button
          onClick={() => setActiveTab("price")}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === "price"
              ? "bg-qubic-cyan text-bg-deep shadow-sm"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <Bell className="w-4 h-4" />
          Price Alerts
        </button>
        <button
          onClick={() => setActiveTab("wallet")}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === "wallet"
              ? "bg-qubic-cyan text-bg-deep shadow-sm"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <Wallet className="w-4 h-4" />
          Wallet TX
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-danger text-white text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Price Alerts Tab */}
      {activeTab === "price" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">
                Get notified when QUBIC price hits your target
              </p>
            </div>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="btn-gradient"
            >
              <Plus className="w-4 h-4" />
              New Alert
            </button>
          </div>

          {notif.isSupported() && !notifEnabled && (
            <div className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BellRing className="w-5 h-5 text-warning" />
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    Enable Notifications
                  </div>
                  <div className="text-xs text-text-muted">
                    Allow browser notifications to receive price alerts
                  </div>
                </div>
              </div>
              <button
                onClick={handleEnableNotif}
                className="btn-gradient"
              >
                Enable
              </button>
            </div>
          )}

          {price && (
            <div className="glass-card p-5">
              <div className="text-sm text-text-muted">Current Price</div>
              <div className="text-2xl font-heading font-bold text-text-primary">
                {formatCurrency(price.usd)}
              </div>
            </div>
          )}

          {showAdd && (
            <div className="glass-card p-5 border-qubic-cyan/30">
              <h3 className="font-heading font-semibold text-text-primary mb-4">
                Create Alert
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {ALERT_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setAlertType(type.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        alertType === type.id
                          ? "bg-qubic-cyan/20 text-qubic-cyan border border-qubic-cyan/30"
                          : "bg-bg-elevated text-text-muted border border-bg-hover hover:border-qubic-cyan/20"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex rounded-lg overflow-hidden border border-bg-hover">
                  <button
                    onClick={() => setCondition("above")}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                      condition === "above"
                        ? "bg-success/20 text-success"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Above
                  </button>
                  <button
                    onClick={() => setCondition("below")}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                      condition === "below"
                        ? "bg-danger/20 text-danger"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    <TrendingDown className="w-4 h-4" />
                    Below
                  </button>
                </div>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="0.000001"
                  step="0.0000001"
                  className="flex-1 px-3 py-2 rounded-lg bg-bg-elevated border border-bg-hover text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-qubic-cyan/50 text-sm"
                />
                <button onClick={handleAdd} className="btn-gradient">
                  Create
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-16 glass-card">
                <Bell className="w-12 h-12 text-text-disabled mx-auto mb-4" />
                <p className="text-text-muted">No alerts set</p>
              </div>
            ) : (
              alerts.map((alert) => {
                const isTriggered = triggeredRef.current.has(alert.id);
                return (
                  <div key={alert.id} className="glass-card p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${alert.condition === "above" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                        {isTriggered ? <BellRing className="w-5 h-5 text-warning" /> : alert.condition === "above" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-text-primary">
                          QUBIC {alert.condition === "above" ? "above" : "below"} {formatCurrency(alert.targetPrice)}
                        </div>
                        <div className="text-xs text-text-muted">
                          {isTriggered ? <span className="text-warning">Triggered!</span> : <>Current: {price ? formatCurrency(price.usd) : "—"}</>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleAlert(alert.id)} className={`px-3 py-1 rounded-md text-xs font-medium ${alert.active ? "bg-success/10 text-success" : "bg-bg-elevated text-text-muted"}`}>
                        {alert.active ? "Active" : "Paused"}
                      </button>
                      <button onClick={() => removeAlert(alert.id)} className="p-2 rounded-lg text-text-disabled hover:text-danger hover:bg-danger/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Wallet TX Tab */}
      {activeTab === "wallet" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">
              Real-time notifications for incoming and outgoing transactions
            </p>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn-glass text-xs"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-16 glass-card">
              <ArrowDownLeft className="w-12 h-12 text-text-disabled mx-auto mb-4" />
              <p className="text-text-muted">No wallet notifications yet</p>
              <p className="text-xs text-text-disabled mt-1">
                Add a wallet in Portfolio to start monitoring
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => {
                const isIncoming = notif.type.startsWith("incoming");
                return (
                  <div
                    key={notif.id}
                    className={`glass-card p-4 flex items-center gap-3 ${
                      !notif.read ? "border-qubic-cyan/20" : ""
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${isIncoming ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                      {isIncoming ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary">
                        {isIncoming ? "Incoming" : "Outgoing"} {notif.tokenName}
                      </div>
                      <div className="text-xs text-text-muted">
                        {isIncoming ? "+" : "-"}{formatBalance(notif.amount)} {notif.tokenName}
                        {notif.walletLabel && ` • ${notif.walletLabel}`}
                      </div>
                    </div>
                    <div className="text-xs text-text-muted flex-shrink-0">
                      {timeAgo(Math.floor(notif.timestamp / 1000))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
