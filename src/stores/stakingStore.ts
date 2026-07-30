import { create } from "zustand";
import type {
  QEarnLockInfo,
  QEarnStats,
  QEarnBurnedBoosted,
  QEarnUserStatus,
  QBondInfo,
  QBondFees,
  QBondMBondInfo,
  QBondUserMBonds,
} from "../types";
import * as qearnService from "../services/qearn";
import * as qbondService from "../services/qbond";

const CACHE_TTL_STAKING = 5 * 60 * 1000;
const CACHE_TTL_USER = 60 * 1000;

interface CacheEntry<T> {
  data: T | null;
  timestamp: number;
}

function isCacheValid<T>(cache: CacheEntry<T>, ttl: number): boolean {
  return cache.data !== null && Date.now() - cache.timestamp < ttl;
}

interface StakingStore {
  qearnLockInfo: CacheEntry<QEarnLockInfo>;
  qearnStats: CacheEntry<QEarnStats>;
  qearnBurnedBoosted: CacheEntry<QEarnBurnedBoosted>;
  qbondInfo: CacheEntry<QBondInfo>;
  qbondFees: CacheEntry<QBondFees>;
  qbondMBondsTable: CacheEntry<QBondMBondInfo[]>;

  userQearnStatus: Map<string, CacheEntry<QEarnUserStatus>>;
  userQBondMBonds: Map<string, CacheEntry<QBondUserMBonds>>;

  loading: boolean;
  error: string | null;

  fetchQEarnLockInfo: (epoch: number) => Promise<void>;
  fetchQEarnStats: (epoch: number) => Promise<void>;
  fetchQEarnBurnedBoosted: () => Promise<void>;
  fetchQBondInfo: (epoch: number) => Promise<void>;
  fetchQBondFees: () => Promise<void>;
  fetchQBondMBondsTable: () => Promise<void>;

  fetchUserQEarnStatus: (address: string) => Promise<void>;
  fetchUserQBondMBonds: (address: string) => Promise<void>;

  fetchAll: (epoch: number) => Promise<void>;
}

export const useStakingStore = create<StakingStore>((set, get) => ({
  qearnLockInfo: { data: null, timestamp: 0 },
  qearnStats: { data: null, timestamp: 0 },
  qearnBurnedBoosted: { data: null, timestamp: 0 },
  qbondInfo: { data: null, timestamp: 0 },
  qbondFees: { data: null, timestamp: 0 },
  qbondMBondsTable: { data: null, timestamp: 0 },

  userQearnStatus: new Map(),
  userQBondMBonds: new Map(),

  loading: false,
  error: null,

  fetchQEarnLockInfo: async (epoch: number) => {
    const cache = get().qearnLockInfo;
    if (isCacheValid(cache, CACHE_TTL_STAKING)) return;

    try {
      const data = await qearnService.getQEarnLockInfo(epoch);
      set({ qearnLockInfo: { data, timestamp: Date.now() } });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to fetch QEarn info" });
    }
  },

  fetchQEarnStats: async (epoch: number) => {
    const cache = get().qearnStats;
    if (isCacheValid(cache, CACHE_TTL_STAKING)) return;

    try {
      const data = await qearnService.getQEarnStats(epoch);
      set({ qearnStats: { data, timestamp: Date.now() } });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to fetch QEarn stats" });
    }
  },

  fetchQEarnBurnedBoosted: async () => {
    const cache = get().qearnBurnedBoosted;
    if (isCacheValid(cache, CACHE_TTL_STAKING)) return;

    try {
      const data = await qearnService.getQEarnBurnedBoosted();
      set({ qearnBurnedBoosted: { data, timestamp: Date.now() } });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to fetch QEarn burned/boosted" });
    }
  },

  fetchQBondInfo: async (epoch: number) => {
    const cache = get().qbondInfo;
    if (isCacheValid(cache, CACHE_TTL_STAKING)) return;

    try {
      const data = await qbondService.getQBondInfo(epoch);
      set({ qbondInfo: { data, timestamp: Date.now() } });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to fetch QBond info" });
    }
  },

  fetchQBondFees: async () => {
    const cache = get().qbondFees;
    if (isCacheValid(cache, CACHE_TTL_STAKING)) return;

    try {
      const data = await qbondService.getQBondFees();
      set({ qbondFees: { data, timestamp: Date.now() } });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to fetch QBond fees" });
    }
  },

  fetchQBondMBondsTable: async () => {
    const cache = get().qbondMBondsTable;
    if (isCacheValid(cache, CACHE_TTL_STAKING)) return;

    try {
      const data = await qbondService.getQBondMBondsTable();
      set({ qbondMBondsTable: { data, timestamp: Date.now() } });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to fetch QBond MBonds" });
    }
  },

  fetchUserQEarnStatus: async (address: string) => {
    const cache = get().userQearnStatus.get(address);
    if (cache && isCacheValid(cache, CACHE_TTL_USER)) return;

    try {
      const data = await qearnService.getQEarnEndedStatus(address);
      const newMap = new Map(get().userQearnStatus);
      newMap.set(address, { data, timestamp: Date.now() });
      set({ userQearnStatus: newMap });
    } catch {
      // silent fail for user data
    }
  },

  fetchUserQBondMBonds: async (address: string) => {
    const cache = get().userQBondMBonds.get(address);
    if (cache && isCacheValid(cache, CACHE_TTL_USER)) return;

    try {
      const data = await qbondService.getQBondUserMBonds(address);
      const newMap = new Map(get().userQBondMBonds);
      newMap.set(address, { data, timestamp: Date.now() });
      set({ userQBondMBonds: newMap });
    } catch {
      // silent fail for user data
    }
  },

  fetchAll: async (epoch: number) => {
    set({ loading: true, error: null });
    try {
      await Promise.allSettled([
        get().fetchQEarnLockInfo(epoch),
        get().fetchQEarnStats(epoch),
        get().fetchQEarnBurnedBoosted(),
        get().fetchQBondInfo(epoch),
        get().fetchQBondFees(),
        get().fetchQBondMBondsTable(),
      ]);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to fetch staking data" });
    } finally {
      set({ loading: false });
    }
  },
}));
