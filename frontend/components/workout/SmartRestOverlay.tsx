"use client";

import React, { useState, useEffect } from "react";
import { Clock, Play, Pause, RotateCw, Plus, Wind, Sparkles, Droplets } from "lucide-react";
import { soundscapeEngine, speakCoachCue } from "@/lib/workout/soundscapeEngine";

interface SmartRestOverlayProps {
  restSeconds: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: (sec?: number) => void;
  onAddRestSeconds: (sec: number) => void;
  onAdjustRpe: (deltaSec: number) => void;
}

export const SmartRestOverlay: React.FC<SmartRestOverlayProps> = ({
  restSeconds,
  isTimerRunning,
  onToggleTimer,
  onResetTimer,
  onAddRestSeconds,
  onAdjustRpe,
}) => {
  const [breathPhase, setBreathPhase] = useState<"Inhale (4s)" | "Hold (7s)" | "Exhale (8s)">("Inhale (4s)");
  const [breathScale, setBreathScale] = useState(1);

  // Animated 4-7-8 Breathwork circle effect
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      const cycleTime = Date.now() % 19000; // 4 + 7 + 8 = 19 seconds cycle
      if (cycleTime < 4000) {
        setBreathPhase("Inhale (4s)");
        setBreathScale(1.3);
      } else if (cycleTime < 11000) {
        setBreathPhase("Hold (7s)");
        setBreathScale(1.3);
      } else {
        setBreathPhase("Exhale (8s)");
        setBreathScale(1.0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const microTips = [
    "💧 Take 2 slow sips of water to sustain intra-set cellular hydration.",
    "🧘 Roll shoulders back & open ribcage to optimize thoracic oxygen intake.",
    "⚡ Lightly shake out forearms & wrists to clear muscle tension."
  ];

  const currentTip = microTips[Math.floor(restSeconds / 15) % microTips.length];

  return (
    <div className="glass-card p-4 rounded-3xl border-fitx-cyan/30 space-y-3 bg-[#0B0F17]/90 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-fitx-cyan/15 border border-fitx-cyan/30 flex items-center justify-center text-fitx-cyan">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-fitx-textSecondary uppercase tracking-wider block">
              Smart Rest & Recovery Buffer
            </span>
            <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
              {formatTimer(restSeconds)}
            </div>
          </div>
        </div>

        {/* Play/Pause & Reset controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleTimer}
            className="p-2.5 rounded-2xl bg-fitx-cyan text-[#07090F] font-extrabold touch-target active:scale-95 transition-all shadow-md flex items-center justify-center"
          >
            {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          {/* Floating +30s Rest Extension Pill */}
          <button
            onClick={() => {
              onAddRestSeconds(30);
              soundscapeEngine.playBeep(659.25, 0.1);
            }}
            className="px-3 py-2 rounded-2xl bg-fitx-solar/20 border border-fitx-solar/40 text-fitx-solar font-extrabold text-xs touch-target hover:bg-fitx-solar/30 active:scale-95 flex items-center space-x-1 shadow-md shadow-fitx-solar/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+30s Rest</span>
          </button>
        </div>
      </div>

      {/* RPE-Based Auto Rest Adjustment Buttons */}
      <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-0.5">
          1-Tap Set RPE (Adjusts Upcoming Rest)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono">
          {[
            { label: "Easy (-15s)", delta: -15, color: "hover:border-emerald-400 hover:text-emerald-300" },
            { label: "Ideal (Normal)", delta: 0, color: "hover:border-fitx-cyan hover:text-fitx-cyan" },
            { label: "Heavy (+20s)", delta: 20, color: "hover:border-amber-400 hover:text-amber-300" },
            { label: "Max Effort (+40s)", delta: 40, color: "hover:border-rose-400 hover:text-rose-300" }
          ].map((rpe, idx) => (
            <button
              key={idx}
              onClick={() => {
                onAdjustRpe(rpe.delta);
                soundscapeEngine.playBeep(783.99, 0.1);
              }}
              className={`py-1.5 px-1 rounded-xl bg-white/5 border border-white/10 text-[10px] font-extrabold text-slate-300 transition-all touch-target active:scale-95 text-center ${rpe.color}`}
            >
              {rpe.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4-7-8 Breathing Circle Visualizer & Micro Activity */}
      <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-fitx-cyan/60 flex items-center justify-center transition-transform duration-1000 bg-fitx-cyan/10"
            style={{ transform: `scale(${breathScale})` }}
          >
            <Wind className="w-3.5 h-3.5 text-fitx-cyan" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-fitx-cyan block">
              Parasympathetic 4-7-8 Breathwork
            </span>
            <span className="text-xs font-bold text-white">{breathPhase}</span>
          </div>
        </div>

        <span className="text-[10px] text-fitx-textSecondary font-mono italic max-w-[150px] text-right truncate">
          {currentTip}
        </span>
      </div>
    </div>
  );
};
