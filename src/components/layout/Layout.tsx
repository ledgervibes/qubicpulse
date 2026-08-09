import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { NotificationToast } from "../ui/NotificationToast";
import { useInitData } from "../../hooks/useInitData";
import { useWalletMonitor } from "../../hooks/useWalletMonitor";
import { useThemeStore } from "../../stores/themeStore";
import { useEffect } from "react";

export function Layout() {
  useInitData();
  useWalletMonitor();

  const initTheme = useThemeStore((s) => s.initTheme);
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
      <div className="min-h-screen bg-bg-deep">
      <Navbar />
      <NotificationToast />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
