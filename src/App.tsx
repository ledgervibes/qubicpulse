import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";

const Dashboard = lazy(() => import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })));
const Portfolio = lazy(() => import("./pages/Portfolio").then((module) => ({ default: module.Portfolio })));
const Alerts = lazy(() => import("./pages/Alerts").then((module) => ({ default: module.Alerts })));
const Defi = lazy(() => import("./pages/Defi").then((module) => ({ default: module.Defi })));
const Staking = lazy(() => import("./pages/Staking").then((module) => ({ default: module.Staking })));
const Settings = lazy(() => import("./pages/Settings").then((module) => ({ default: module.Settings })));

function PageFallback() {
  return (
    <div className="flex min-h-72 items-center justify-center" role="status">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-bg-hover border-t-qubic-cyan" />
        <p className="mt-3 text-sm text-text-muted">Loading view...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/defi" element={<Defi />} />
            <Route path="/staking" element={<Staking />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
