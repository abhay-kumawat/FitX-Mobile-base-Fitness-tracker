"use client";

import React, { useState } from "react";
import { Droplet, Plus, Trash2, Sparkles, GlassWater } from "lucide-react";
import { useDietStore, LiquidType } from "@/store/useDietStore";
import { soundscape } from "@/lib/soundscapeEngine";

interface HydrationTrackerProps {
  dateStr: string;
}

export const HydrationTracker: React.FC<HydrationTrackerProps> = ({ dateStr }) => {
  const { hydrationByDate, dailyWaterTargetMl, addLiquid, removeLiquid } = useDietStore();
  const [selectedType, setSelectedType] = useState<LiquidType>("Water");

  const logs = hydrationByDate[dateStr] || [];
  const currentTotalMl = logs.reduce((sum, item) => sum + item.volumeMl, 0);
  const progressPct = Math.min(100, Math.round((currentTotalMl / dailyWaterTargetMl) * 100));

  const liquidTypes: { type: LiquidType; emoji: string; bg: string; activeBg: string; text: string }[] = [
    { type: "Water", emoji: "💧", bg: "bg-cyan-50 text-cyan-800 border-cyan-200", activeBg: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-md shadow-cyan-500/20", text: "text-cyan-700" },
    { type: "Electrolytes", emoji: "⚡", bg: "bg-amber-50 text-amber-800 border-amber-200", activeBg: "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-md shadow-amber-500/20", text: "text-amber-700" },
    { type: "Protein Shake", emoji: "🥛", bg: "bg-purple-50 text-purple-800 border-purple-200", activeBg: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-400 shadow-md shadow-purple-500/20", text: "text-purple-700" },
    { type: "Tea & Coffee", emoji: "☕", bg: "bg-yellow-50 text-yellow-900 border-yellow-200", activeBg: "bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-yellow-400 shadow-md shadow-yellow-500/20", text: "text-yellow-800" },
    { type: "Fresh Juice", emoji: "🥤", bg: "bg-rose-50 text-rose-800 border-rose-200", activeBg: "bg-gradient-to-r from-rose-500 to-pink-600 text-white border-rose-400 shadow-md shadow-rose-500/20", text: "text-rose-700" },
  ];

  const handleQuickAdd = (amountMl: number) => {
    soundscape.playTapSound();
    const typeObj = liquidTypes.find((t) => t.type === selectedType);
    addLiquid(dateStr, selectedType, amountMl, typeObj?.emoji || "💧");
  };

  return (
    <div className="duo-card p-4 sm:p-5 bg-white border-2 border-slate-200/90 rounded-3xl shadow-sm space-y-4 max-w-full overflow-hidden relative">
      {/* Background Subtle Glow Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2 flex-wrap sm:flex-nowrap relative z-10 min-w-0">
        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
            <Droplet className="w-5 h-5 fill-current animate-bounce" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base font-black text-slate-900 leading-snug tracking-tight flex items-center gap-1.5 truncate">
              <span className="truncate">Hydration & Liquidity Sanctuary</span>
            </h2>
            <p className="text-[11px] font-bold text-slate-500 leading-tight truncate">Track water, electrolytes, and shakes</p>
          </div>
        </div>

        <div className="text-right shrink-0 bg-cyan-50/80 border border-cyan-200/80 rounded-2xl px-3 py-1.5 font-mono max-w-full">
          <span className="text-xs sm:text-sm font-black text-cyan-800 block">
            {currentTotalMl} / {dailyWaterTargetMl} ml
          </span>
          <span className="text-[10px] font-extrabold text-cyan-600 block">
            🔥 {progressPct}% Target Reached
          </span>
        </div>
      </div>

      {/* Visual Liquid Level Progress Bar */}
      <div className="space-y-1 relative z-10 font-mono">
        <div className="relative w-full bg-slate-100 h-7 rounded-2xl overflow-hidden border border-slate-200/90 p-0.5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 rounded-xl transition-all duration-700 ease-out flex items-center justify-end pr-3 shadow-md"
            style={{ width: `${progressPct}%` }}
          >
            {progressPct > 15 && (
              <span className="text-[10px] font-black text-white drop-shadow whitespace-nowrap flex items-center gap-1">
                <GlassWater className="w-3.5 h-3.5" /> {currentTotalMl} ml
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Select Liquid Category & Quick Add Buttons */}
      <div className="space-y-3 relative z-10">
        <div className="flex flex-wrap gap-1.5">
          {liquidTypes.map((t) => {
            const isActive = selectedType === t.type;
            return (
              <button
                key={t.type}
                type="button"
                onClick={() => setSelectedType(t.type)}
                className={`px-3 py-2 rounded-2xl text-xs font-black flex items-center space-x-1.5 border transition-all active:scale-95 ${
                  isActive ? t.activeBg : `${t.bg} hover:border-slate-300`
                }`}
              >
                <span className="text-sm">{t.emoji}</span>
                <span className="whitespace-nowrap">{t.type}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Add Volume Buttons - Responsive 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
          {[250, 500, 750, 1000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleQuickAdd(amt)}
              className="py-2.5 px-2 bg-gradient-to-b from-cyan-50 to-cyan-100/60 hover:from-cyan-500 hover:to-blue-600 text-cyan-900 hover:text-white border-2 border-cyan-200/90 rounded-2xl text-xs font-black transition-all flex items-center justify-center space-x-1 shadow-xs active:scale-95 whitespace-nowrap group"
            >
              <Plus className="w-3.5 h-3.5 shrink-0 group-hover:rotate-90 transition-transform" />
              <span>+{amt}ml</span>
            </button>
          ))}
        </div>
      </div>

      {/* History Log Stream */}
      <div className="space-y-2 pt-2 border-t border-slate-100 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
            Today's Fluid Logs ({logs.length})
          </span>
          {logs.length > 0 && (
            <span className="text-[10px] font-mono text-cyan-700 font-extrabold flex items-center">
              <Sparkles className="w-3 h-3 mr-1" /> Hydration Active
            </span>
          )}
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No fluids logged today yet. Select a liquid and tap a volume above!</p>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-mono flex items-center space-x-2 text-slate-800 shadow-2xs group"
              >
                <span className="text-sm">{log.emoji}</span>
                <span className="font-black text-slate-900">{log.type}</span>
                <span className="text-cyan-700 font-black">+{log.volumeMl}ml</span>
                <span className="text-[10px] text-slate-400">({log.timestamp})</span>
                <button
                  type="button"
                  onClick={() => {
                    soundscape.playTapSound();
                    removeLiquid(dateStr, log.id);
                  }}
                  className="p-0.5 text-slate-300 hover:text-rose-600 transition-colors rounded shrink-0 ml-1"
                  title="Undo fluid log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
