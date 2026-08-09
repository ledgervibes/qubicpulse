import { useCallback, useEffect, useRef, useState } from "react";
import { usePriceStore } from "../stores/priceStore";
import { useAlertStore } from "../stores/alertStore";
import { useWalletMonitor } from "../hooks/useWalletMonitor";
import { formatCurrency, formatBalance, formatPercent, timeAgo } from "../utils/format";
import * as notif from "../services/notification";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  BellRing,
  CheckCheck,
  CircleAlert,
  History,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

const ALERT_TYPES = [
  { id: "price_above", label: "Price above", icon: TrendingUp },
  { id: "price_below", label: "Price below", icon: TrendingDown },
] as const;

type TabType = "price" | "wallet";

const ALERT_TABS = [
  { id: "price" as const, label: "Price alerts", icon: Bell },
  { id: "wallet" as const, label: "Wallet activity", icon: Wallet },
];

export function Alerts() {
  const price = usePriceStore((s) => s.price);
  const alerts = useAlertStore((s) => s.alerts);
  const history = useAlertStore((s) => s.history);
  const loadAlerts = useAlertStore((s) => s.loadAlerts);
  const addAlert = useAlertStore((s) => s.addAlert);
  const removeAlert = useAlertStore((s) => s.removeAlert);
  const toggleAlert = useAlertStore((s) => s.toggleAlert);
  const addToHistory = useAlertStore((s) => s.addToHistory);
  const { notifications, markAsRead, markAllAsRead, clearAll } = useWalletMonitor();

  const [activeTab, setActiveTab] = useState<TabType>("price");
  const [showAdd, setShowAdd] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [alertType, setAlertType] = useState("price_above");
  const [formError, setFormError] = useState("");
  const [notifEnabled, setNotifEnabled] = useState(
    notif.isSupported() && Notification.permission === "granted"
  );
  const triggeredRef = useRef<Set<string>>(new Set());

  useEffect(() => loadAlerts(), [loadAlerts]);

  const handleAdd = () => {
    const value = Number(targetPrice);
    if (!Number.isFinite(value) || value <= 0) {
      setFormError("Enter a target price greater than zero.");
      return;
    }
    setFormError("");
    addAlert({ condition: alertType === "price_above" ? "above" : "below", targetPrice: value, active: true });
    setTargetPrice("");
    setShowAdd(false);
  };

  const checkAlerts = useCallback(() => {
    if (!price) return;
    alerts.forEach((alert) => {
      if (!alert.active || triggeredRef.current.has(alert.id)) return;
      const isTriggered = alert.condition === "above"
        ? price.usd >= alert.targetPrice
        : price.usd <= alert.targetPrice;
      if (!isTriggered) return;
      triggeredRef.current.add(alert.id);
      const message = `QUBIC ${alert.condition} ${formatCurrency(alert.targetPrice)} - Current: ${formatCurrency(price.usd)}`;
      notif.sendNotification("QubicPulse Price Alert", message);
      addToHistory({ alertId: alert.id, message, sentToTelegram: false, sentToBrowser: notifEnabled });
    });
  }, [addToHistory, alerts, notifEnabled, price]);

  useEffect(() => checkAlerts(), [checkAlerts]);

  const activeCount = alerts.filter((alert) => alert.active && !triggeredRef.current.has(alert.id)).length;
  const pausedCount = alerts.filter((alert) => !alert.active).length;
  const triggeredCount = alerts.filter((alert) => triggeredRef.current.has(alert.id)).length + history.length;
  const unreadCount = notifications.filter((item) => !item.read).length;
  const targetDistance = targetPrice && price ? ((Number(targetPrice) - price.usd) / price.usd) * 100 : null;

  const enableNotifications = async () => {
    const permission = await notif.requestPermission();
    setNotifEnabled(permission === "granted");
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <header>
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">
          <BellRing className="h-3.5 w-3.5" />
          Stay ahead of the move
        </div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">Alerts that watch Qubic for you.</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted sm:text-base">Set a signal once, then let QubicPulse monitor price and wallet activity.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Active", activeCount, "text-success"],
          ["Triggered", triggeredCount, "text-warning"],
          ["Paused", pausedCount, "text-text-secondary"],
          ["Unread activity", unreadCount, "text-qubic-cyan"],
        ].map(([label, value, tone]) => (
          <div key={String(label)} className="data-surface p-4">
            <div className="text-[10px] uppercase tracking-[0.13em] text-text-muted">{label}</div>
            <div className={`mt-2 font-heading text-2xl font-semibold ${tone}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="flex w-full gap-1 rounded-xl border border-white/5 bg-bg-elevated/50 p-1 sm:w-fit">
        {ALERT_TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} aria-pressed={activeTab === id} className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${activeTab === id ? "bg-bg-surface text-text-primary ring-1 ring-bg-hover" : "text-text-muted hover:text-text-primary"}`}>
            <Icon className="h-4 w-4" />
            {label}
            {id === "wallet" && unreadCount > 0 && <span className="rounded-full bg-danger px-1.5 py-0.5 text-xs font-bold text-white">{unreadCount}</span>}
          </button>
        ))}
      </div>

      {activeTab === "price" ? (
        <div className="space-y-4">
          <section className="hero-surface p-5 sm:p-6" aria-labelledby="price-context-title">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-qubic-cyan">Price context</div>
                <h2 id="price-context-title" className="mt-1 font-heading text-xl font-semibold text-text-primary">Current QUBIC price</h2>
              </div>
              <div className="font-heading text-3xl font-semibold text-text-primary">{price ? formatCurrency(price.usd) : "—"}</div>
            </div>
            {price && <div className="mt-3 text-xs text-text-muted">24h movement <span className={price.usd_24h_change >= 0 ? "text-success" : "text-danger"}>{formatPercent(price.usd_24h_change)}</span></div>}
          </section>

          {notif.isSupported() && !notifEnabled && (
            <section className="data-surface flex flex-col gap-4 border-warning/25 p-4 sm:flex-row sm:items-center sm:justify-between" role="status">
              <div className="flex items-start gap-3"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" /><div><div className="text-sm font-medium text-text-primary">Browser notifications are off</div><div className="mt-1 text-xs text-text-muted">Enable them to receive price alerts while QubicPulse is not in focus.</div></div></div>
              <button onClick={enableNotifications} className="btn-secondary min-h-11">Enable notifications</button>
            </section>
          )}

          <section className="space-y-3" aria-labelledby="price-alerts-title">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-[10px] uppercase tracking-[0.14em] text-warning">Your signals</div><h2 id="price-alerts-title" className="mt-1 font-heading text-xl font-semibold text-text-primary">Price alerts</h2></div><button onClick={() => { setShowAdd(!showAdd); setFormError(""); }} className="btn-primary min-h-11 self-start"><Plus className="h-4 w-4" />New alert</button></div>
            {showAdd && <div className="data-surface animate-fade-in border-qubic-cyan/30 p-5 sm:p-6"><h3 className="font-heading text-lg font-semibold text-text-primary">Create a price signal</h3><p className="mt-1 text-xs text-text-muted">QubicPulse stores this alert locally in your browser.</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{ALERT_TYPES.map((type) => { const Icon = type.icon; const selected = alertType === type.id; const selectedClass = type.id === "price_above" ? "border-success/40 bg-success/10 text-success" : "border-danger/40 bg-danger/10 text-danger"; return <button key={type.id} onClick={() => setAlertType(type.id)} aria-pressed={selected} className={`flex min-h-12 items-center gap-3 rounded-xl border p-3 text-left text-sm font-medium transition-colors ${selected ? selectedClass : "border-bg-hover bg-bg-surface text-text-muted hover:text-text-primary"}`}><Icon className="h-4 w-4" />{type.label}</button>; })}</div><div className="mt-4 flex flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="target-price">Target price</label><input id="target-price" type="number" min="0" step="any" value={targetPrice} onChange={(event) => { setTargetPrice(event.target.value); setFormError(""); }} placeholder="Target price, e.g. 0.000001" className="min-h-12 flex-1 rounded-xl border border-bg-hover bg-bg-elevated px-3 font-mono text-sm text-text-primary placeholder:text-text-disabled focus:border-qubic-cyan/50" /><button onClick={handleAdd} className="btn-primary min-h-12" disabled={!targetPrice}>Create alert</button></div>{targetDistance !== null && Number.isFinite(targetDistance) && <p className={`mt-2 text-xs ${targetDistance >= 0 ? "text-success" : "text-danger"}`}>Target is {Math.abs(targetDistance).toFixed(2)}% {targetDistance >= 0 ? "above" : "below"} current price.</p>}{formError && <p role="alert" className="mt-2 text-sm text-danger">{formError}</p>}</div>}
            {alerts.length === 0 ? <div className="data-surface px-5 py-16 text-center"><Bell className="mx-auto mb-4 h-10 w-10 text-text-disabled" /><h3 className="font-heading text-lg font-semibold text-text-primary">No price signals yet</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-muted">Create your first target and QubicPulse will watch it while this browser is available.</p><button onClick={() => setShowAdd(true)} className="btn-primary mt-5 min-h-11"><Plus className="h-4 w-4" />Create first alert</button></div> : alerts.map((alert) => { const triggered = triggeredRef.current.has(alert.id); return <article key={alert.id} className={`data-surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${triggered ? "border-warning/30" : ""}`}><div className="flex items-center gap-3"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${triggered ? "bg-warning/10 text-warning" : alert.condition === "above" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>{triggered ? <BellRing className="h-5 w-5" /> : alert.condition === "above" ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}</div><div><div className="text-sm font-semibold text-text-primary">QUBIC {alert.condition} {formatCurrency(alert.targetPrice)}</div><div className="mt-1 text-xs text-text-muted">{triggered ? <span className="text-warning">Triggered</span> : price ? <>Current {formatCurrency(price.usd)}</> : "Waiting for price data"}</div></div></div><div className="flex items-center gap-2"><button onClick={() => toggleAlert(alert.id)} aria-pressed={alert.active} className={`min-h-10 rounded-lg border px-3 text-xs font-medium ${alert.active ? "border-success/20 bg-success/5 text-success" : "border-bg-hover bg-bg-surface text-text-muted"}`}>{alert.active ? "Active" : "Paused"}</button><button onClick={() => removeAlert(alert.id)} aria-label="Delete alert" className="flex h-10 w-10 items-center justify-center rounded-lg text-text-disabled hover:bg-danger/10 hover:text-danger"><Trash2 className="h-4 w-4" /></button></div></article>; })}
          </section>
          {history.length > 0 && <section className="data-surface p-5"><div className="mb-3 flex items-center gap-2"><History className="h-4 w-4 text-warning" /><h2 className="font-heading font-semibold text-text-primary">Recent triggers</h2></div><div className="space-y-2">{history.slice(0, 5).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 border-t border-white/5 pt-2 text-xs"><span className="text-text-secondary">{item.message}</span><span className="shrink-0 text-text-muted">{timeAgo(Math.floor(item.triggeredAt / 1000))}</span></div>)}</div></section>}
        </div>
      ) : (
        <section className="space-y-4" aria-labelledby="wallet-activity-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-[10px] uppercase tracking-[0.14em] text-qubic-cyan">Live watch-only feed</div><h2 id="wallet-activity-title" className="mt-1 font-heading text-xl font-semibold text-text-primary">Wallet activity</h2></div>{notifications.length > 0 && <div className="flex gap-3"><button onClick={markAllAsRead} className="btn-tertiary"><CheckCheck className="h-3.5 w-3.5" />Mark all read</button><button onClick={clearAll} className="btn-tertiary text-danger hover:text-danger">Clear history</button></div>}</div>
          {notifications.length === 0 ? <div className="data-surface px-5 py-16 text-center"><Wallet className="mx-auto mb-4 h-10 w-10 text-text-disabled" /><h3 className="font-heading text-lg font-semibold text-text-primary">No wallet activity yet</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-muted">Add a public address in Portfolio to start receiving transaction signals.</p></div> : <div className="space-y-2">{notifications.map((item) => { const incoming = item.type.startsWith("incoming"); return <article key={item.id} className={`data-surface flex items-start gap-3 p-4 ${!item.read ? "border-qubic-cyan/25" : ""}`}><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${incoming ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>{incoming ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-text-primary">{incoming ? "Incoming" : "Outgoing"} {item.tokenName}</span>{!item.read && <span className="rounded-full bg-qubic-cyan/10 px-2 py-0.5 text-[10px] font-semibold text-qubic-cyan">Unread</span>}</div><div className="mt-1 text-xs text-text-muted">{incoming ? "+" : "-"}{formatBalance(item.amount)} {item.tokenName}{item.walletLabel && ` • ${item.walletLabel}`}</div><div className="mt-1 text-[11px] text-text-disabled">{timeAgo(Math.floor(item.timestamp / 1000))}</div></div>{!item.read && <button onClick={() => markAsRead(item.id)} className="btn-tertiary shrink-0">Mark read</button>}</article>; })}</div>}
        </section>
      )}
    </div>
  );
}
