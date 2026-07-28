import { create } from "zustand";
import * as storage from "../services/storage";

type Theme = "dark" | "light";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "dark",

  setTheme: (theme) => {
    storage.setItem("theme", theme);
    applyTheme(theme);
    set({ theme });
  },

  initTheme: () => {
    const saved = storage.getItem<Theme>("theme", "dark");
    applyTheme(saved);
    set({ theme: saved });
  },
}));
