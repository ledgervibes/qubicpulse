import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getStatus } from "../../services/qubic-rpc";
import { Wifi, Clock, Layers } from "lucide-react";

export function StatusBar() {
  const location = useLocation();
  const [tickInfo, setTickInfo] = useState<{
    currentTick: number;
    epoch: number;
  } | null>(null);

  const isDeFiPage = location.pathname === "/defi";

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getStatus();
        setTickInfo(status);
      } catch {
        // silent fail
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="status-bar hidden md:block">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse-slow" />
              <span className="text-xs text-text-muted">Live</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-qubic-cyan" />
              <span className="text-xs text-text-muted">Qubic Network</span>
            </div>
          </div>
          {!isDeFiPage && (
            <div className="flex items-center gap-6">
              {tickInfo && (
                <>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-qubic-cyan" />
                    <span className="text-xs text-text-muted">
                      Tick: <span className="text-text-primary font-mono">{tickInfo.currentTick.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-qubic-gold" />
                    <span className="text-xs text-text-muted">
                      Epoch: <span className="text-text-primary font-mono">{tickInfo.epoch}</span>
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
