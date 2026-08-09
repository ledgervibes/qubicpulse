import { useState } from "react";
import { TIP_ADDRESS, APP_NAME, TELEGRAM_BOT_USERNAME } from "../utils/constants";
import * as storage from "../services/storage";
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Coffee,
  Copy,
  Check,
  ExternalLink,
  Send,
  ShieldCheck,
} from "lucide-react";

export function Settings() {
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState("");

  const handleExport = () => {
    const data = storage.exportAll();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qubicpulse-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Data exported successfully");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleImport = () => {
    try {
      storage.importAll(importText);
      setMessage("Data imported successfully. Refresh the page to see changes.");
      setImportText("");
      setTimeout(() => setMessage(""), 5000);
    } catch {
      setMessage("Invalid JSON format");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(TIP_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
          <SettingsIcon className="h-3.5 w-3.5" />
          Workspace preferences
        </div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Make QubicPulse yours.
        </h1>
        <p className="mt-2 text-sm text-text-muted sm:text-base">
          Manage notifications, backups, and support for your local workspace.
        </p>
      </div>

      {message && (
        <div role="status" className="data-surface border-qubic-cyan/30 px-4 py-3 text-sm text-qubic-cyan">
          {message}
        </div>
      )}

      <section className="data-surface p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center text-info">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-text-primary">
                Telegram Notifications
              </h3>
              <p className="text-xs text-text-muted">
                Manage wallets and alerts directly in Telegram
              </p>
            </div>
          </div>
          <a
            href={`https://t.me/${TELEGRAM_BOT_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-info to-info/80 text-white font-medium text-sm shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Send className="w-4 h-4" />
            Open Bot
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="mt-4 border-t border-bg-hover pt-4">
          <p className="text-xs text-text-muted">
            Open the bot to add wallets and configure transaction, price, and QEarn reward notifications.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-4 text-xs text-text-muted"><ShieldCheck className="h-4 w-4 text-success" /> Telegram is an optional companion, not required for the dashboard.</div>
      </section>

      <section className="data-surface p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-lg bg-qubic-gold/10 flex items-center justify-center text-qubic-gold">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-text-primary">
              Buy Me a Coffee
            </h3>
            <p className="text-xs text-text-muted">
              Support {APP_NAME} development with a tip
            </p>
          </div>
        </div>
        <div className="rounded-lg bg-bg-elevated p-4">
          <div className="text-xs text-text-muted mb-2">Qubic Address</div>
          <div className="flex items-center gap-2">
            <code className="text-sm text-qubic-cyan font-mono break-all flex-1">
              {TIP_ADDRESS}
            </code>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-bg-hover transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4 text-text-muted" />
              )}
            </button>
          </div>
          <a
            href={`https://explorer.qubic.org/network/address/${TIP_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs text-text-muted hover:text-qubic-cyan transition-colors"
          >
            View on Explorer <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </section>

      <section className="data-surface p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center text-info">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-text-primary">
              Export Data
            </h3>
            <p className="text-xs text-text-muted">
              Download your wallets and alerts as JSON
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-bg-hover text-text-muted hover:text-text-primary hover:border-qubic-cyan/30 transition-all text-sm"
        >
          <Download className="w-4 h-4" />
          Export Backup
        </button>
      </section>

      <section className="data-surface p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-text-primary">
              Import Data
            </h3>
            <p className="text-xs text-text-muted">
              Restore from a previous backup
            </p>
          </div>
        </div>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste your JSON backup here..."
          rows={4}
          className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-bg-hover text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-qubic-cyan/50 text-sm font-mono resize-none mb-3"
        />
        <button
          onClick={handleImport}
          disabled={!importText.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-bg-hover text-text-muted hover:text-text-primary hover:border-qubic-cyan/30 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          Import Data
        </button>
      </section>

      <section className="data-surface p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-lg bg-qubic-cyan/10 flex items-center justify-center text-qubic-cyan">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-text-primary">
              About {APP_NAME}
            </h3>
            <p className="text-xs text-text-muted">v2.0 • All Phases Complete</p>
          </div>
        </div>
        <div className="text-sm text-text-secondary space-y-2">
          <p className="font-medium text-text-primary">
            {APP_NAME} — Your Qubic Command Center.
          </p>
          <p>
            An all-in-one dashboard for the Qubic network.
            Track portfolios, set alerts, monitor transactions, and explore
            DeFi — all in one place.
          </p>
          <p>Built with React, TypeScript, and the Qubic RPC API.</p>
          <div className="flex gap-3 pt-2">
            <a
              href="https://github.com/ledgervibes/qubicpulse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-muted hover:text-qubic-cyan transition-colors flex items-center gap-1"
            >
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://x.com/QubicPulse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-muted hover:text-qubic-cyan transition-colors flex items-center gap-1"
            >
              X/Twitter <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://docs.qubic.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-muted hover:text-qubic-cyan transition-colors flex items-center gap-1"
            >
              Qubic Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
