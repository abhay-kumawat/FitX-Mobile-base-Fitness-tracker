"use client";

import React, { useState, useEffect } from "react";
import { PillBadge } from "@/components/atomic/PillBadge";
import { soundscape } from "@/lib/soundscapeEngine";
import { HeartPulse, Moon, Activity, ShieldAlert, Flame } from "lucide-react";

export const RecoverySanctuary: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [sleepScore, setSleepScore] = useState<"Optimal" | "Moderate" | "Deprived">("Optimal");
  const [stressLevel, setStressLevel] = useState<"Low" | "Moderate" | "High">("Low");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hrvScore = 92;
  const readinessPct = sleepScore === "Optimal" ? 95 : sleepScore === "Moderate" ? 82 : 68;

  const muscles = [
    { name: "Pectorals", score: 98, status: "Ready", color: "#10B981" },
    { name: "Anterior Delts", score: 92, status: "Ready", color: "#10B981" },
    { name: "Triceps Brachii", score: 90, status: "Ready", color: "#10B981" },
    { name: "Latissimus Dorsi", score: 65, status: "Recovering", color: "#F59E0B" },
    { name: "Quadriceps", score: 88, status: "Ready", color: "#10B981" },
    { name: "Hamstrings", score: 70, status: "Recovering", color: "#F59E0B" },
    { name: "Lower Back", score: 55, status: "High Fatigue", color: "#EF4444" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header Card with 180px SVG HRV Ring */}
      <div className="duo-card p-6 bg-white border border-slate-200 flex flex-col items-center text-center relative overflow-hidden shadow-sm">
        <PillBadge variant="green" icon={<HeartPulse className="w-4 h-4 text-emerald-600" />}>
          HPE Autonomic Nervous Readiness
        </PillBadge>

        {/* 180px SVG HRV Ring */}
        <div className="relative w-[180px] h-[180px] flex items-center justify-center my-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="#E2E8F0" strokeWidth="8" fill="transparent" />
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="#10B981"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={264}
              strokeDashoffset={264 - (264 * readinessPct) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-black text-slate-900">{readinessPct}%</span>
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Readiness</span>
            <span className="text-xs font-black text-emerald-600 mt-0.5">HRV: {hrvScore} ms</span>
          </div>
        </div>

        <p className="text-xs font-bold text-slate-600 max-w-xs leading-relaxed">
          Your parasympathetic tone is prime for heavy progressive loading today.
        </p>
      </div>

      {/* Sleep & Stress Check-In Selector */}
      <div className="duo-card p-5 bg-white border border-slate-200 flex flex-col gap-4 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Moon className="w-4 h-4 text-indigo-600" /> Sleep Architecture & Stress Check-In
        </h3>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase">Sleep Quality</span>
          <div className="grid grid-cols-3 gap-1.5 font-mono">
            {(["Optimal", "Moderate", "Deprived"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  soundscape.playTapSound();
                  setSleepScore(mode);
                }}
                className={`py-2 px-1 rounded-xl text-[11px] font-extrabold border transition-all text-center truncate ${
                  sleepScore === mode
                    ? "bg-indigo-600 text-white border-indigo-700 shadow-sm"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase">Daily Stress Burden</span>
          <div className="grid grid-cols-3 gap-2">
            {(["Low", "Moderate", "High"] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  soundscape.playTapSound();
                  setStressLevel(lvl);
                }}
                className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all ${
                  stressLevel === lvl
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Injury Shield Visualizer */}
      <div className="duo-card p-5 bg-white border border-slate-200 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> Active Injury Shield Visualizer
          </h3>
          <PillBadge variant="gold">1 Active Shield</PillBadge>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            ⚠️
          </div>
          <div>
            <h4 className="text-xs font-black text-amber-900">Left Rotator Cuff Guard Active</h4>
            <p className="text-[11px] font-semibold text-slate-600 mt-0.5 leading-relaxed">
              Exercise routines automatically replace extreme shoulder abduction with 30° scapular plane variations.
            </p>
          </div>
        </div>
      </div>

      {/* Individual Muscle Readiness Score Grid */}
      <div className="duo-card p-5 bg-white border border-slate-200 flex flex-col gap-3 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" /> Muscle Group Recovery Grid
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {muscles.map((item, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800">{item.name}</span>
                <span className="text-xs font-black" style={{ color: item.color }}>
                  {item.score}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.score}%`, backgroundColor: item.color }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-500">{item.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Real-Time Thermal Fatigue Body Heatmap */}
      <div className="duo-card p-5 bg-white border border-slate-200 flex flex-col items-center gap-3 text-center shadow-sm">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" /> Thermal Fatigue Heatmap
        </h3>

        <div className="relative w-40 h-64 bg-slate-100 rounded-3xl border border-slate-300 flex items-center justify-center p-4">
          <svg viewBox="0 0 100 180" className="w-full h-full">
            {/* Head */}
            <circle cx="50" cy="20" r="12" fill="#10B981" opacity="0.8" />
            {/* Chest & Shoulders */}
            <path d="M 25 38 Q 50 35 75 38 L 70 80 L 30 80 Z" fill="#10B981" opacity="0.9" />
            {/* Lower Back */}
            <rect x="35" y="82" width="30" height="25" rx="4" fill="#EF4444" opacity="0.8" />
            {/* Arms */}
            <rect x="12" y="40" width="10" height="40" rx="5" fill="#10B981" opacity="0.7" />
            <rect x="78" y="40" width="10" height="40" rx="5" fill="#10B981" opacity="0.7" />
            {/* Legs */}
            <rect x="32" y="110" width="14" height="60" rx="6" fill="#F59E0B" opacity="0.8" />
            <rect x="54" y="110" width="14" height="60" rx="6" fill="#F59E0B" opacity="0.8" />
          </svg>

          <div className="absolute bottom-2 inset-x-2 flex justify-between text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-slate-300 text-slate-700 shadow-xs">
            <span className="text-emerald-600">Green: Prime</span>
            <span className="text-amber-600">Amber: Mod</span>
            <span className="text-red-600">Red: Fatigue</span>
          </div>
        </div>
      </div>
    </div>
  );
};
