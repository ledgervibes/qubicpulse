export const QUBIC_RPC_URL = "https://rpc.qubic.org";
export const QUBIC_QUERY_RPC_URL = "https://rpc.qubic.org/query/v1";

export const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

export const QUBIC_COINGECKO_ID = "qubic-network";

// Credentials stay server-side. Telegram is an optional integration.
export const TELEGRAM_API_URL = import.meta.env.VITE_TELEGRAM_API_URL as
  | string
  | undefined;
export const TELEGRAM_BOT_USERNAME = "qubic_pulse_bot";

export const QUBIC_ADDRESS_REGEX = /^[A-Z]{60}$/;

export const APP_NAME = "QubicPulse";

export const TIP_ADDRESS =
  "GZCNUSHKABXFGBVYDMEDOMXHHIRAPZZSMRYVVEAGDGMKHMCAEHJSZRVGIQPM";

export const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { path: "/portfolio", label: "Portfolio", icon: "Wallet" },
  { path: "/alerts", label: "Alerts", icon: "Bell" },
  { path: "/defi", label: "DeFi", icon: "BarChart3" },
  { path: "/staking", label: "Staking", icon: "Lock" },
  { path: "/settings", label: "Settings", icon: "Settings" },
] as const;

export const POLL_INTERVAL_MS = 30_000;

export const PRICE_POLL_INTERVAL_MS = 60_000;
