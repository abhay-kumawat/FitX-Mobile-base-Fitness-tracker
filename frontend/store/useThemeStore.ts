import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreset = "wood" | "duo" | "black";

interface ThemeState {
  theme: ThemePreset;
  setTheme: (theme: ThemePreset) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "wood",
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== "undefined") {
          document.body.classList.remove("theme-wood", "theme-duo", "theme-black");
          document.body.classList.add(`theme-${theme}`);
        }
      },
    }),
    { name: "fitx_theme_store" }
  )
);
