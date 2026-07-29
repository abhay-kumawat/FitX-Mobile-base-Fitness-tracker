"use client";

import React from "react";
import { NumberStepper } from "./NumberStepper";
import { soundscape } from "@/lib/soundscapeEngine";
import confetti from "canvas-confetti";
import { Check, Disc } from "lucide-react";
import { useWorkoutStore, LoggedSet } from "@/store/useWorkoutStore";

interface SetLogRowProps {
  exerciseId: string;
  setIndex: number;
  set: LoggedSet;
}

export const SetLogRow: React.FC<SetLogRowProps> = ({ exerciseId, setIndex, set }) => {
  const { toggleSetComplete, updateSetInput, openPlateModal } = useWorkoutStore();

  if (!set) return null;

  const isCompleted = !!set.completed;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowCompleted = !isCompleted;
    if (toggleSetComplete) toggleSetComplete(exerciseId, setIndex);

    if (isNowCompleted) {
      soundscape.playSetCompleteSound();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { x, y },
        colors: ["#58CC02", "#FFC800", "#1CB0F6"],
      });
    } else {
      soundscape.playTapSound();
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all min-w-0 max-w-full gap-1.5 ${
        isCompleted
          ? "bg-emerald-50 border-emerald-300 shadow-xs"
          : "bg-slate-50 border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black ${
            set.type === "warmup"
              ? "bg-amber-100 text-amber-800 border border-amber-300"
              : "bg-slate-200 text-slate-800 border border-slate-300"
          }`}
        >
          {set.setNumber || setIndex + 1}
        </span>

        <button
          type="button"
          onClick={() => openPlateModal && openPlateModal(set.weightKg || 60)}
          title="Open Plate Loader Calculator"
          className="p-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
        >
          <Disc className="w-3.5 h-3.5 text-emerald-600" />
        </button>
      </div>

      <div className="flex items-center gap-2 min-w-0 shrink">
        <NumberStepper
          value={set.weightKg || 0}
          onChange={(w) => updateSetInput && updateSetInput(exerciseId, setIndex, w, set.reps || 0)}
          step={2.5}
          unit="kg"
          label="Weight"
        />

        <NumberStepper
          value={set.reps || 0}
          onChange={(r) => updateSetInput && updateSetInput(exerciseId, setIndex, set.weightKg || 0, r)}
          step={1}
          unit="reps"
          label="Reps"
        />

        <div className="flex flex-col items-center shrink-0">
          <span className="text-[10px] font-extrabold text-slate-500 mb-0.5 tracking-wider uppercase">Done</span>
          <button
            type="button"
            onClick={handleToggle}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isCompleted
                ? "bg-emerald-500 text-white border-b-2 border-emerald-700 scale-105 shadow-xs"
                : "bg-slate-200 text-slate-600 border-b-2 border-slate-300 hover:bg-slate-300"
            }`}
          >
            <Check className={`w-4 h-4 stroke-[3] ${isCompleted ? "animate-bounce" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

