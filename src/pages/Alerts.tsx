import { useState } from "react";
import { usePriceStore } from "../stores/priceStore";
import { formatCurrency } from "../utils/format";
import { Bell, Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import type { PriceAlert } from "../types";
import * as storage from "../services/storage";

export function Alerts() {
  const price = usePriceStore((s) => s.price);
  const [alerts, setAlerts] = useState<PriceAlert[]>(() =>
    storage.getItem<PriceAlert[]>("price_alerts", [])
  );
  const [showAdd, setShowAdd] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");

  const saveAlerts = (updated: PriceAlert[]) => {
    setAlerts(updated);
    storage.setItem("price_alerts", updated);
  };

  const handleAdd = () => {
    const num = parseFloat(targetPrice);
    if (isNaN(num) || num <= 0) return;

    const alert: PriceAlert = {
      id: crypto.randomUUID(),
      condition,
      targetPrice: num,
      active: true,
      createdAt: Date.now(),
    };
    saveAlerts([...alerts, alert]);
    setTargetPrice("");
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    saveAlerts(alerts.filter((a) => a.id !== id));
  };

  const toggleAlert = (id: string) => {
    saveAlerts(
      alerts.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Alerts
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Set price alerts for QUBIC
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-qubic-cyan text-bg-deep font-medium text-sm hover:bg-qubic-cyan-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Alert
        </button>
      </div>

      {price && (
        <div className="rounded-xl border border-bg-hover bg-bg-surface p-5">
          <div className="text-sm text-text-muted">Current Price</div>
          <div className="text-2xl font-heading font-bold text-text-primary">
            {formatCurrency(price.usd)}
          </div>
        </div>
      )}

      {showAdd && (
        <div className="rounded-xl border border-qubic-cyan/30 bg-bg-surface p-5">
          <h3 className="font-heading font-semibold text-text-primary mb-4">
            Create Alert
          </h3>
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
              placeholder="0.00001"
              step="0.000001"
              className="flex-1 px-3 py-2 rounded-lg bg-bg-elevated border border-bg-hover text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-qubic-cyan/50 text-sm"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg bg-qubic-cyan text-bg-deep font-medium text-sm hover:bg-qubic-cyan-light transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-bg-hover bg-bg-surface">
            <Bell className="w-12 h-12 text-text-disabled mx-auto mb-4" />
            <p className="text-text-muted">No alerts set</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-xl border border-bg-hover bg-bg-surface p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    alert.condition === "above"
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  }`}
                >
                  {alert.condition === "above" ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    QUBIC {alert.condition === "above" ? "above" : "below"}{" "}
                    {formatCurrency(alert.targetPrice)}
                  </div>
                  <div className="text-xs text-text-muted">
                    {alert.active ? "Active" : "Paused"} • Current:{" "}
                    {price ? formatCurrency(price.usd) : "—"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    alert.active
                      ? "bg-success/10 text-success"
                      : "bg-bg-elevated text-text-muted"
                  }`}
                >
                  {alert.active ? "Active" : "Paused"}
                </button>
                <button
                  onClick={() => handleDelete(alert.id)}
                  className="p-2 rounded-lg text-text-disabled hover:text-danger hover:bg-danger/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
