"use client";

import React, { useEffect, useState } from "react";
import { useWorkoutStore } from "@/store/useWorkoutStore";
import { Button3D } from "@/components/atomic/Button3D";
import { soundscape } from "@/lib/soundscapeEngine";
import { Timer, Wind, Play, Pause, SkipForward } from "lucide-react";

export const SmartRestRecoveryOverlay: React.FC = () => {
  const { isRestActive, restCountdownSeconds, tickRestTimer, stopRestTimer } = useWorkoutStore();
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathCount, setBreathCount] = useState(4);

  // Rest Timer Interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRestActive && restCountdownSeconds > 0) {
      interval = setInterval(() => {
        tickRestTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestActive, restCountdownSeconds, tickRestTimer]);

  // 4-7-8 Guided Breathing Cycle
  useEffect(() => {
    let breathInterval: NodeJS.Timeout;
    if (isRestActive) {
      breathInterval = setInterval(() => {
        setBreathCount((prev) => {
          if (prev <= 1) {
            if (breathPhase === "Inhale") {
              setBreathPhase("Hold");
              soundscape.playBreathingPacerTone(528);
              return 7;
            } else if (breathPhase === "Hold") {
              setBreathPhase("Exhale");
              soundscape.playBreathingPacerTone(396);
              return 8;
            } else {
              setBreathPhase("Inhale");
              soundscape.playBreathingPacerTone(432);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(breathInterval);
  }, [isRestActive, breathPhase]);

  if (!isRestActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-smooth-reveal">
      <div className="flex flex-col items-center gap-6 max-w-sm w-full">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black">
          <Wind className="w-4 h-4" /> Smart Rest Recovery & 4-7-8 Breathing Pacer
        </div>

        {/* Rest Countdown Timer */}
        <div className="flex flex-col items-center">
          <span className="text-6xl font-black tracking-tight text-white font-mono">
            {Math.floor(restCountdownSeconds / 60)}:
            {String(restCountdownSeconds % 60).padStart(2, "0")}
          </span>
          <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Rest Timer</span>
        </div>

        {/* 4-7-8 Pulsing Breathing Ring */}
        <div className="relative w-48 h-48 flex items-center justify-center my-2">
          <div
            className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ${
              breathPhase === "Inhale"
                ? "scale-110 border-emerald-400 bg-emerald-500/20 shadow-2xl shadow-emerald-500/40"
                : breathPhase === "Hold"
                ? "scale-100 border-amber-400 bg-amber-500/20 shadow-2xl shadow-amber-500/40"
                : "scale-75 border-sky-400 bg-sky-500/10 shadow-xl shadow-sky-500/20"
            }`}
          />

          <div className="flex flex-col items-center relative z-10">
            <span className="text-sm font-extrabold text-slate-300 uppercase tracking-wider">{breathPhase}</span>
            <span className="text-4xl font-black text-white font-mono mt-0.5">{breathCount}s</span>
          </div>
        </div>

        <p className="text-xs font-semibold text-slate-300 leading-relaxed px-4">
          Lower your heart rate and flush lactate using parasympathetic breathing before the next heavy set.
        </p>

        <div className="flex items-center gap-3 w-full">
          <Button3D variant="secondary" fullWidth onClick={stopRestTimer}>
            <SkipForward className="w-4 h-4" /> Skip Rest
          </Button3D>
        </div>
      </div>
    </div>
  );
};
