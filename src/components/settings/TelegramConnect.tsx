import { useNotificationStore } from "../../stores/notificationStore";
import { getBotLink } from "../../services/telegram";
import { Send, ExternalLink, CheckCircle } from "lucide-react";

export function TelegramConnect() {
  const connected = useNotificationStore((s) => s.connected);
  const telegramChatId = useNotificationStore((s) => s.telegramChatId);
  const disconnect = useNotificationStore((s) => s.disconnect);

  const handleConnect = () => {
    const link = getBotLink();
    window.open(link, "_blank");
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
            Chat ID: {telegramChatId?.slice(0, 8)}...
          </div>
          <button
            onClick={disconnect}
            className="px-4 py-2 rounded-lg border border-danger/30 text-danger text-sm hover:bg-danger/10 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
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
          <p className="text-xs text-text-disabled">
            You will be redirected to Telegram to connect your account
          </p>
        </div>
      )}
    </div>
  );
}
