"use client";

import React, { useState } from "react";
import { Flame, ChevronRight, Zap } from "lucide-react";

interface MuscleFatigue {
  name: string;
  fatiguePercent: number; // 0 - 100
  status: "Fresh" | "Optimal Load" | "High Fatigue";
}

interface ThermalFatigueOverlayProps {
  muscles: MuscleFatigue[];
}

export const ThermalFatigueOverlay: React.FC<ThermalFatigueOverlayProps> = ({ muscles }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getFatigueBadge = (pct: number) => {
    if (pct < 35) return { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", label: "Fresh" };
    if (pct < 75) return { color: "text-amber-400 bg-amber-500/10 border-amber-500/30", label: "Active Peak" };
    return { color: "text-rose-400 bg-rose-500/10 border-rose-500/30", label: "Near Limit" };
  };

  return (
    <div className="glass-card p-3.5 rounded-2xl border-white/10 space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left touch-target"
      >
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-xl bg-fitx-solar/15 text-fitx-solar border border-fitx-solar/30">
            <Flame className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-fitx-solar block">
              Real-Time Thermal Muscle Heat-Map
            </span>
            <span className="text-xs font-extrabold text-white">
              Target Activation ({muscles.length} Muscle Groups)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-mono font-bold text-fitx-solar bg-fitx-solar/10 px-2 py-0.5 rounded-lg border border-fitx-solar/20">
            Live Thermal
          </span>
          <ChevronRight
            className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
              isExpanded ? "rotate-90 text-fitx-solar" : ""
            }`}
          />
        </div>
      </button>

      {/* Primary Fatigue Meter Bars */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {muscles.map((m, idx) => {
          const badge = getFatigueBadge(m.fatiguePercent);
          return (
            <div key={idx} className="p-2 rounded-xl bg-white/5 border border-white/5 space-y-1 min-w-0">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-slate-200 truncate">{m.name}</span>
                <span className="font-mono font-extrabold text-white">{m.fatiguePercent}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    m.fatiguePercent < 35
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                      : m.fatiguePercent < 75
                      ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                      : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                  }`}
                  style={{ width: `${m.fatiguePercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Anatomical Heat-Map Info */}
      {isExpanded && (
        <div className="pt-2 mt-2 border-t border-white/10 text-xs space-y-2 animate-fadeIn">
          <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-2 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-fitx-cyan" />
              <span>Hypertrophy Stimulus Efficiency</span>
            </div>
            <span className="font-mono font-extrabold text-fitx-emerald">94% Optimal</span>
          </div>

          <p className="text-[11px] text-fitx-textSecondary italic">
            🔥 Thermal levels represent estimated localized lactic build-up and central nervous system fatigue based on completed reps and load.
          </p>
        </div>
      )}
    </div>
  );
};
