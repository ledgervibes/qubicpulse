import { create } from "zustand";
import * as storage from "../services/storage";

type Theme = "dark" | "light" | "system";

interface ThemeStore {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: "dark" | "light") {
  document.documentElement.setAttribute("data-theme", theme);
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: "dark",
  resolvedTheme: "dark",

  setTheme: (theme) => {
    storage.setItem("theme", theme);
    const resolved = theme === "system" ? getSystemTheme() : theme;
    applyTheme(resolved);
    set({ theme, resolvedTheme: resolved });
  },

  initTheme: () => {
    const saved = storage.getItem<Theme>("theme", "dark");
    const resolved = saved === "system" ? getSystemTheme() : saved;
    applyTheme(resolved);
    set({ theme: saved, resolvedTheme: resolved });

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (get().theme === "system") {
          const newTheme = e.matches ? "dark" : "light";
          applyTheme(newTheme);
          set({ resolvedTheme: newTheme });
        }
      });
  },
}));
