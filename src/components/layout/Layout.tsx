import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { useInitData } from "../../hooks/useInitData";

export function Layout() {
  useInitData();

  return (
    <div className="min-h-screen bg-bg-deep">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
