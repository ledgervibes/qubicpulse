import { useState } from "react";
import { useNotificationStore } from "../../stores/notificationStore";
import { getBotLink } from "../../services/telegram";
import { TELEGRAM_BOT_TOKEN } from "../../utils/constants";
import { Send, ExternalLink, CheckCircle } from "lucide-react";

export function TelegramConnect() {
  const connected = useNotificationStore((s) => s.connected);
  const telegramChatId = useNotificationStore((s) => s.telegramChatId);
  const setChatId = useNotificationStore((s) => s.setChatId);
  const disconnect = useNotificationStore((s) => s.disconnect);

  const [step, setStep] = useState<"initial" | "waiting" | "enter_id">("initial");
  const [chatIdInput, setChatIdInput] = useState("");

  const handleConnect = () => {
    const link = getBotLink();
    window.open(link, "_blank");
    setStep("waiting");
  };

  const handleGetUpdates = () => {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;
    window.open(url, "_blank");
    setStep("enter_id");
  };

  const handleSubmitChatId = () => {
    if (chatIdInput.trim()) {
      setChatId(chatIdInput.trim());
      setStep("initial");
      setChatIdInput("");
    }
  };

  return (
    <div className="rounded-xl border border-bg-hover bg-bg-surface p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center text-info">
          <Send className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-text-primary">
            Telegram Notifications
          </h3>
          <p className="text-xs text-text-muted">
            Receive alerts and notifications via Telegram
          </p>
        </div>
      </div>

      {connected ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Connected</span>
          </div>
          <div className="text-xs text-text-muted">
            Chat ID: {telegramChatId}
          </div>
          <button
            onClick={disconnect}
            className="px-4 py-2 rounded-lg border border-danger/30 text-danger text-sm hover:bg-danger/10 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : step === "initial" ? (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            Connect your Telegram account to receive price alerts and wallet
            transaction notifications directly on your phone.
          </p>
          <button
            onClick={handleConnect}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-info to-info/80 text-white font-medium text-sm shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Send className="w-4 h-4" />
            Connect Telegram
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      ) : step === "waiting" ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-bg-elevated p-4 space-y-3">
            <p className="text-sm font-medium text-text-primary">
              Step 1: Send /start to the bot
            </p>
            <p className="text-xs text-text-muted">
              Open Telegram and send /start to @qubic_pulse_bot
            </p>
            <a
              href={getBotLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-qubic-cyan hover:text-qubic-cyan-light transition-colors"
            >
              Open @qubic_pulse_bot <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="rounded-lg bg-bg-elevated p-4 space-y-3">
            <p className="text-sm font-medium text-text-primary">
              Step 2: Get your Chat ID
            </p>
            <p className="text-xs text-text-muted">
              Click the button below to open a page that shows your Chat ID
            </p>
            <button
              onClick={handleGetUpdates}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-bg-hover text-text-muted hover:text-text-primary hover:border-qubic-cyan/30 hover:bg-qubic-cyan/5 hover:shadow-[0_0_10px_rgba(37,202,217,0.1)] transition-all duration-200 text-sm"
            >
              Get Chat ID
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="rounded-lg bg-bg-elevated p-4 space-y-3">
            <p className="text-sm font-medium text-text-primary">
              Step 3: Enter your Chat ID
            </p>
            <p className="text-xs text-text-muted">
              Find "chat": {"{"}"id": 123456789{"}"} in the response and enter the number
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatIdInput}
                onChange={(e) => setChatIdInput(e.target.value)}
                placeholder="Enter Chat ID (e.g., 123456789)"
                className="flex-1 px-3 py-2 rounded-lg bg-bg-deep border border-bg-hover text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-qubic-cyan/50 text-sm"
              />
              <button
                onClick={handleSubmitChatId}
                disabled={!chatIdInput.trim()}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-qubic-cyan to-qubic-cyan-dark text-bg-deep font-medium text-sm shadow-[0_4px_14px_rgba(37,202,217,0.3)] hover:shadow-[0_6px_20px_rgba(37,202,217,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Connect
              </button>
            </div>
          </div>

          <button
            onClick={() => setStep("initial")}
            className="text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            ← Back
          </button>
        </div>
      ) : null}
    </div>
  );
}
