import { create } from "zustand";
import type { Wallet, WalletBalance } from "../types";
import * as storage from "../services/storage";
import * as rpc from "../services/qubic-rpc";

interface WalletStore {
  wallets: Wallet[];
  balances: Map<string, WalletBalance>;
  loading: boolean;
  failedAddresses: string[];
  lastFetched: number;

  loadWallets: () => void;
  addWallet: (address: string, label: string) => void;
  removeWallet: (id: string) => void;
  refreshBalances: () => Promise<void>;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  wallets: [],
  balances: new Map(),
  loading: false,
  failedAddresses: [],
  lastFetched: 0,

  loadWallets: () => {
    const wallets = storage.getItem<Wallet[]>("wallets", []);
    set({ wallets });
  },

  addWallet: (address, label) => {
    const wallet: Wallet = {
      id: crypto.randomUUID(),
      label,
      address: address.toUpperCase(),
      addedAt: Date.now(),
    };
    const wallets = [...get().wallets, wallet];
    storage.setItem("wallets", wallets);
    set({ wallets });
    get().refreshBalances();
  },

  removeWallet: (id) => {
    const wallets = get().wallets.filter((w) => w.id !== id);
    storage.setItem("wallets", wallets);
    set({ wallets });
  },

  refreshBalances: async () => {
    set({ loading: true });
    const { wallets } = get();
    const balances = new Map(get().balances);
    const failedAddresses: string[] = [];

    await Promise.allSettled(
      wallets.map(async (w) => {
        try {
          const bal = await rpc.getBalance(w.address);
          balances.set(w.address, bal);
        } catch {
          failedAddresses.push(w.address);
        }
      })
    );

    set({ balances, failedAddresses, lastFetched: Date.now(), loading: false });
  },
}));
