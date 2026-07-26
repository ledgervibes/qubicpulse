export interface Wallet {
  id: string;
  label: string;
  address: string;
  addedAt: number;
}

export interface WalletBalance {
  address: string;
  balance: number;
  incomingAmount: number;
  outgoingAmount: number;
  numberOfTransfers: number;
  lastActivityTick: number;
}

export interface TickInfo {
  tick: number;
  timestamp: number;
}

export interface NetworkStatus {
  currentTick: number;
  epoch: number;
  activeAddresses: number;
}

export interface PriceData {
  usd: number;
  usd_24h_change: number;
  usd_market_cap: number;
  btc: number;
  eth: number;
}

export interface PriceHistory {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface PriceAlert {
  id: string;
  condition: "above" | "below";
  targetPrice: number;
  active: boolean;
  triggeredAt?: number;
  createdAt: number;
}

export interface WalletAlert {
  id: string;
  walletAddress: string;
  label: string;
  active: boolean;
  createdAt: number;
}

export interface Notification {
  id: string;
  type: "price" | "transaction" | "system";
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
}

export interface ActivityItem {
  id: string;
  type: "incoming" | "outgoing" | "alert";
  amount?: number;
  address?: string;
  label: string;
  timestamp: number;
}

export interface Transaction {
  hash: string;
  source: string;
  destination: string;
  amount: number;
  tickNumber: number;
  timestamp: string;
  inputType: number;
  inputSize: number;
}
