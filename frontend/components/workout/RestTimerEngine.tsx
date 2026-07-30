"use client";

import React, { useState, useEffect } from "react";
import { Timer, Play, Pause, Square, RefreshCcw } from "lucide-react";
import { soundscape } from "@/lib/soundscapeEngine";

interface RestTimerEngineProps {
  initialSeconds?: number;
  autoStart?: boolean;
  onComplete?: () => void;
  mode?: "rest" | "warmup" | "workout";
}

export function RestTimerEngine({
  initialSeconds = 90,
  autoStart = false,
  onComplete,
  mode = "rest"
}: RestTimerEngineProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (isActive && seconds === 0) {
      setIsActive(false);
      soundscape.playVictoryFanfare(); // Or a specific timer sound
      if (onComplete) onComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, onComplete]);

  const toggle = () => {
    soundscape.playTapSound();
    setIsActive(!isActive);
  };

  const reset = () => {
    soundscape.playTapSound();
    setIsActive(false);
    setSeconds(initialSeconds);
  };

  const skip = () => {
    soundscape.playTapSound();
    setIsActive(false);
    setSeconds(0);
    if (onComplete) onComplete();
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
        <Timer className="w-3 h-3" /> {mode.toUpperCase()} TIMER
      </div>
      <div className="text-4xl font-black text-slate-800 tracking-tighter mb-4 tabular-nums">
        {formatTime(seconds)}
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
        
        <button
          onClick={toggle}
          className="px-6 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors flex items-center gap-2"
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isActive ? "PAUSE" : "START"}
        </button>
        
        <button
          onClick={skip}
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
