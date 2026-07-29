"use client";

import React, { useState } from "react";
import { useWorkoutStore } from "@/store/useWorkoutStore";
import { Button3D } from "@/components/atomic/Button3D";
import { X, Flame, ShieldAlert } from "lucide-react";

export const WarmupPyramidModal: React.FC = () => {
  const { showWarmupModal, toggleWarmupModal } = useWorkoutStore();
  const [workingWeight, setWorkingWeight] = useState(80);

  if (!showWarmupModal) return null;

  const pyramid = [
    { step: "Set 1", pct: 45, weight: Math.round((workingWeight * 0.45) / 2.5) * 2.5, reps: 10, tempo: "Explosive Warmup" },
    { step: "Set 2", pct: 65, weight: Math.round((workingWeight * 0.65) / 2.5) * 2.5, reps: 6, tempo: "CNS Activation" },
    { step: "Set 3", pct: 85, weight: Math.round((workingWeight * 0.85) / 2.5) * 2.5, reps: 3, tempo: "Heavy Acclimatization" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 max-w-sm w-full flex flex-col gap-4 shadow-2xl relative animate-smooth-reveal">
        <button
          type="button"
          onClick={() => toggleWarmupModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Warmup Pyramid Calculator</h3>
            <p className="text-[11px] font-semibold text-slate-400">Optimal CNS Potentiation</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
          <span className="text-xs font-bold text-slate-300">Target Working Weight:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={workingWeight}
              onChange={(e) => setWorkingWeight(Number(e.target.value) || 0)}
              className="w-20 px-2 py-1 rounded-xl bg-slate-900 border border-slate-700 text-right text-sm font-black text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="text-xs font-bold text-slate-400">kg</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {pyramid.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800"
            >
              <div className="flex flex-col">
                <span className="text-xs font-black text-emerald-400">
                  {item.step} ({item.pct}%)
                </span>
                <span className="text-[10px] font-semibold text-slate-400">{item.tempo}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-white">{item.weight} kg</span>
                <span className="text-[11px] font-bold text-slate-400 block">{item.reps} reps</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium leading-tight">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          Rest 60s between warmups. Do not perform warmups to muscular failure.
        </div>

        <Button3D variant="green" fullWidth onClick={() => toggleWarmupModal(false)}>
          Apply Warmup Ramp
        </Button3D>
      </div>
    </div>
  );
};
