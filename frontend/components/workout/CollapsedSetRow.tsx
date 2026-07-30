"use client";

import React from "react";
import { Check, X, RotateCcw, SkipForward } from "lucide-react";
import { soundscape } from "@/lib/soundscapeEngine";
import { useWorkoutStore } from "@/store/useWorkoutStore";

interface CollapsedSetRowProps {
  exerciseId: string;
  setIndex: number;
  set: {
    setNumber: number;
    weightKg: number;
    reps: number;
    completed: boolean;
    failureReason?: string;
  };
  onLogSet?: (data: any) => void;
}

export function CollapsedSetRow({ exerciseId, setIndex, set, onLogSet }: CollapsedSetRowProps) {
  const isSkipped = set.failureReason?.startsWith("Skipped");
  const isFailed = set.failureReason && !isSkipped && set.completed;
  
  let statusColor = "text-emerald-500 bg-emerald-50 border-emerald-200";
  let Icon = Check;
  
  if (isSkipped) {
    statusColor = "text-slate-400 bg-slate-50 border-slate-200";
    Icon = SkipForward;
  } else if (isFailed) {
    statusColor = "text-rose-500 bg-rose-50 border-rose-200";
    Icon = X;
  }

  const handleUndo = () => {
    soundscape.playTapSound();
    // Reverting the set to incomplete
    if (onLogSet) {
      onLogSet({
        exerciseId,
        setNumber: set.setNumber,
        isCompleted: false, // This will toggle it back to incomplete via store
      });
    } else {
      useWorkoutStore.getState().toggleSetComplete(exerciseId, setIndex);
    }
  };

  return (
    <div className={`flex items-center justify-between p-2.5 rounded-xl border ${statusColor} transition-all`}>
      <div className="flex items-center gap-3">
        <div className={`w-6 h-6 flex items-center justify-center rounded-lg bg-white shadow-sm`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black uppercase tracking-wider opacity-80">
            Set {set.setNumber}
          </span>
          {isSkipped ? (
             <span className="text-[10px] font-bold opacity-60">Skipped</span>
          ) : isFailed ? (
             <span className="text-[10px] font-bold opacity-60">{set.failureReason}</span>
          ) : (
            <span className="text-xs font-bold opacity-90">
              {set.weightKg} kg × {set.reps} reps
            </span>
          )}
        </div>
      </div>
      <button
        onClick={handleUndo}
        className="p-1.5 rounded-lg bg-white/50 hover:bg-white text-slate-400 hover:text-slate-700 transition-colors"
        title="Undo and edit set"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
