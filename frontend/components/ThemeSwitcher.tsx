"use client";

import React from "react";
import { useThemeStore, ThemePreset } from "@/store/useThemeStore";
import { soundscape } from "@/lib/soundscapeEngine";
import { Palette } from "lucide-react";

export const ThemeSwitcher: React.FC = () => {
  const { theme = "wood", setTheme } = useThemeStore();

  const themes: Array<{ id: ThemePreset; name: string; icon: string }> = [
    { id: "wood", name: "Crisp Light", icon: "☀️" },
    { id: "duo", name: "Duo 3D", icon: "🟢" },
    { id: "black", name: "OLED Black", icon: "🖤" },
  ];

  const handleSelect = (selected: ThemePreset) => {
    soundscape.playTapSound();
    if (setTheme) setTheme(selected);
  };

  return (
    <div className="flex flex-col gap-2 p-3.5 rounded-2xl duo-card bg-white border border-slate-200 shadow-sm">
      <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
        <Palette className="w-4 h-4 text-emerald-500" />
        <span>UI/UX Theme Preset</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {themes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelect(item.id)}
            className={`py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition-all ${
              theme === item.id
                ? "bg-emerald-500 text-white border-emerald-600 scale-105 shadow-md"
                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
            }`}
          >
            <span className="text-sm">{item.icon}</span>
            <span className="truncate text-[11px]">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
