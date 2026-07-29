"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";

export default function ThemeInitializer() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.remove("theme-wood", "theme-duo", "theme-black");
      document.body.classList.add(`theme-${theme || "wood"}`);
    }
  }, [theme]);

  return null;
}
