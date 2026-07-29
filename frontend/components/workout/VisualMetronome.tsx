"use client";

import React, { useEffect, useState } from "react";
import { Activity, Play, Pause } from "lucide-react";

interface VisualMetronomeProps {
  isActive: boolean;
  onToggle: () => void;
  eccentricSec?: number;
  pauseSec?: number;
  concentricSec?: number;
}

export const VisualMetronome: React.FC<VisualMetronomeProps> = ({
  isActive,
  onToggle,
  eccentricSec = 3,
  pauseSec = 1,
  concentricSec = 2,
}) => {
  const [phase, setPhase] = useState<"Eccentric (Lower)" | "Pause (Hold)" | "Concentric (Push)">("Eccentric (Lower)");
  const [secondsInPhase, setSecondsInPhase] = useState(eccentricSec);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSecondsInPhase((prev) => {
        if (prev > 1) return prev - 1;

        // Transition to next phase
        if (phase === "Eccentric (Lower)") {
          setPhase("Pause (Hold)");
          return pauseSec;
        } else if (phase === "Pause (Hold)") {
          setPhase("Concentric (Push)");
          return concentricSec;
        } else {
          setPhase("Eccentric (Lower)");
          return eccentricSec;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase, eccentricSec, pauseSec, concentricSec]);

  const getPhaseColor = () => {
    if (!isActive) return "from-slate-700 to-slate-900 border-white/10";
    if (phase === "Eccentric (Lower)") return "from-cyan-500/20 via-cyan-500/10 to-transparent border-cyan-400/40 shadow-[0_0_25px_rgba(43,188,224,0.3)]";
    if (phase === "Pause (Hold)") return "from-amber-500/20 via-amber-500/10 to-transparent border-amber-400/40 shadow-[0_0_25px_rgba(245,166,35,0.3)]";
    return "from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-400/40 shadow-[0_0_25px_rgba(40,203,117,0.3)]";
  };

  return (
    <div className={`p-3 rounded-2xl bg-gradient-to-r ${getPhaseColor()} border transition-all duration-500 flex items-center justify-between`}>
      <div className="flex items-center space-x-3">
        <div className={`relative w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-fitx-cyan/20 text-fitx-cyan animate-pulse' : 'bg-white/5 text-slate-400'}`}>
          <Activity className="w-4 h-4" />
          {isActive && (
            <span className="absolute -inset-1 rounded-xl bg-fitx-cyan/30 animate-ping opacity-40" />
          )}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-fitx-cyan">
              Adaptive Visual Metronome
            </span>
            <span className="text-[9px] font-mono text-fitx-textSecondary bg-white/5 px-1.5 py-0.2 rounded border border-white/10">
              {eccentricSec}s - {pauseSec}s - {concentricSec}s Tempo
            </span>
          </div>
          <p className="text-xs font-bold text-white mt-0.5">
            {isActive ? (
              <span className="flex items-center space-x-1.5">
                <span className="text-fitx-cyan">{phase}</span>
                <span className="text-fitx-textSecondary">•</span>
                <span className="font-mono text-fitx-solar font-extrabold text-sm">{secondsInPhase}s</span>
              </span>
            ) : (
              "Tap to sync rep tempo & movement cadence"
            )}
          </p>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1 transition-all touch-target active:scale-95 ${
          isActive
            ? "bg-fitx-cyan text-[#07090F] shadow-md shadow-fitx-cyan/20"
            : "bg-white/5 border border-white/10 text-slate-300 hover:border-fitx-cyan"
        }`}
      >
        {isActive ? (
          <>
            <Pause className="w-3.5 h-3.5" />
            <span>Pause</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Pace Sync</span>
          </>
        )}
      </button>
    </div>
  );
};
