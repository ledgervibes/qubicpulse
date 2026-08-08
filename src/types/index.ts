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
  duration: number;
  epoch: number;
  initialTick: number;
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

export interface EventLog {
  epoch: number;
  tickNumber: number;
  timestamp: string;
  transactionHash: string;
  logType: number;
  logId: string;
  quTransfer?: {
    source: string;
    destination: string;
    amount: string;
  };
  assetPossessionChange?: {
    source: string;
    destination: string;
    assetIssuer: string;
    assetName: string;
    numberOfShares: string;
  };
  assetOwnershipChange?: {
    source: string;
    destination: string;
    assetIssuer: string;
    assetName: string;
    numberOfShares: string;
  };
}

export interface QEarnLockInfo {
  lockedAmount: number;
  bonusAmount: number;
  currentLockedAmount: number;
  currentBonusAmount: number;
  yield: number;
}

export interface QEarnStats {
  earlyUnlockedAmount: number;
  earlyUnlockedPercent: number;
  totalLockedAmount: number;
  averageAPY: number;
}

export interface QEarnBurnedBoosted {
  burnedAmount: number;
  averageBurnedPercent: number;
  boostedAmount: number;
  averageBoostedPercent: number;
  rewardedAmount: number;
  averageRewardedPercent: number;
}

export interface QEarnUserStatus {
  fullyUnlockedAmount: number;
  fullyRewardedAmount: number;
  earlyUnlockedAmount: number;
  earlyRewardedAmount: number;
}

export interface QBondInfo {
  stakersAmount: number;
  totalStaked: number;
  apy: number;
}

export interface QBondFees {
  stakeFeePercent: number;
  tradeFeePercent: number;
  transferFee: number;
}

export interface QBondMBondInfo {
  epoch: number;
  totalStakedQBond: number;
  totalStakedQEarn: number;
  apy: number;
}

export interface QBondUserMBonds {
  totalMBondsAmount: number;
  mbonds: Array<{
    epoch: number;
    amount: number;
    apy: number;
  }>;
}

export interface RewardEstimate {
  walletBalance: number;
  qearnLocked: number;
  qbondMBonds: number;
  estimatedQEarnReward: number;
  estimatedQBondReward: number;
  potentialStakingReward: number;
  currentAPY: number;
}
