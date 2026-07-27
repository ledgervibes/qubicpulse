import { getBotLink } from "../../services/telegram";
import { Send, ExternalLink } from "lucide-react";

export function TelegramConnect() {
  const handleConnect = () => {
    const link = getBotLink();
    window.open(link, "_blank");
  };

  return (
    <div className="rounded-xl border border-bg-hover bg-bg-surface p-5">
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
              Get alerts on your phone via Telegram
            </p>
          </div>
        </div>
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-info to-info/80 text-white font-medium text-sm shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <Send className="w-4 h-4" />
          Connect
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
