import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { StatusBar } from "./StatusBar";
import { NotificationToast } from "../ui/NotificationToast";
import { useInitData } from "../../hooks/useInitData";
import { useWalletMonitor } from "../../hooks/useWalletMonitor";
import { useRewardMonitor } from "../../hooks/useRewardMonitor";
import { useThemeStore } from "../../stores/themeStore";
import { useEffect } from "react";

export function Layout() {
  useInitData();
  useWalletMonitor();
  useRewardMonitor();

  const initTheme = useThemeStore((s) => s.initTheme);
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <div className="min-h-screen bg-bg-deep">
      <Navbar />
      <StatusBar />
      <NotificationToast />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
