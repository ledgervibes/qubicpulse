import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { StatusBar } from "./StatusBar";
import { NotificationToast } from "../ui/NotificationToast";
import { useInitData } from "../../hooks/useInitData";
import { useWalletMonitor } from "../../hooks/useWalletMonitor";

export function Layout() {
  useInitData();
  useWalletMonitor();

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
