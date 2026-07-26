import { create } from "zustand";
import type { Wallet, WalletBalance } from "../types";
import * as storage from "../services/storage";
import * as rpc from "../services/qubic-rpc";

interface WalletStore {
  wallets: Wallet[];
  balances: Map<string, WalletBalance>;
  loading: boolean;

  loadWallets: () => void;
  addWallet: (address: string, label: string) => void;
  removeWallet: (id: string) => void;
  refreshBalances: () => Promise<void>;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  wallets: [],
  balances: new Map(),
  loading: false,

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
    const balances = new Map<string, WalletBalance>();

    await Promise.allSettled(
      wallets.map(async (w) => {
        try {
          const bal = await rpc.getBalance(w.address);
          balances.set(w.address, bal);
        } catch {
          // skip failed wallets
        }
      })
    );

    set({ balances, loading: false });
  },
}));
