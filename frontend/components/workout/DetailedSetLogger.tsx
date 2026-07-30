"use client";

import React, { useState } from "react";
import { Check, X, Info } from "lucide-react";
import { soundscape } from "@/lib/soundscapeEngine";

interface DetailedSetLoggerProps {
  exerciseId: string;
  setIndex: number;
  set: {
    setNumber: number;
    weightKg: number;
    reps: number;
    completed: boolean;
    type: "warmup" | "work" | "failure" | "dropset";
  };
  onLogSet?: (data: any) => void;
}

export function DetailedSetLogger({ exerciseId, setIndex, set, onLogSet }: DetailedSetLoggerProps) {
  const [actualReps, setActualReps] = useState(set.reps.toString());
  const [actualWeight, setActualWeight] = useState(set.weightKg.toString());
  const [isCompleted, setIsCompleted] = useState(set.completed);
  const [showFailureReasons, setShowFailureReasons] = useState(false);
  const [failureReason, setFailureReason] = useState<string | null>(null);

  const failureOptions = [
    "Muscle Failure",
    "Form Breakdown",
    "Pain/Discomfort",
    "Out of Breath",
    "Stopped Early"
  ];

  const handleComplete = () => {
    soundscape.playTapSound();
    
    // If they did less reps than planned, maybe show failure reasons
    if (parseInt(actualReps) < set.reps && !failureReason) {
      setShowFailureReasons(true);
      return;
    }

    setIsCompleted(true);
    if (onLogSet) {
      onLogSet({
        exerciseId,
        setNumber: set.setNumber,
        plannedReps: set.reps,
        reps: parseInt(actualReps),
        targetWeightKg: set.weightKg,
        weightKg: parseFloat(actualWeight),
        failureReason,
        isCompleted: true
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-slate-100 shadow-sm transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-500 font-bold text-xs">
            {set.setNumber}
          </span>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {set.type === "warmup" ? "WARMUP" : "WORKING"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
            <input 
              type="number" 
              value={actualWeight}
              onChange={(e) => setActualWeight(e.target.value)}
              className="w-12 bg-transparent text-right font-bold text-sm text-slate-800 outline-none"
            />
            <span className="text-xs text-slate-500 font-semibold">kg</span>
          </div>
          <span className="text-slate-300 font-bold text-xs">×</span>
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
            <input 
              type="number" 
              value={actualReps}
              onChange={(e) => setActualReps(e.target.value)}
              className="w-10 bg-transparent text-right font-bold text-sm text-slate-800 outline-none"
            />
            <span className="text-xs text-slate-500 font-semibold">reps</span>
          </div>
        </div>

        <button
          onClick={handleComplete}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            isCompleted 
              ? "bg-emerald-500 text-white shadow-emerald-500/30 shadow-md" 
              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
          }`}
        >
          <Check className="w-4 h-4" />
        </button>
      </div>

      {showFailureReasons && !isCompleted && (
        <div className="mt-2 p-3 bg-rose-50 rounded-lg border border-rose-100 animate-smooth-reveal flex flex-col gap-2">
          <div className="flex items-center justify-between">
             <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
               <Info className="w-3 h-3" /> Missed target reps. Why did you stop?
             </span>
             <button onClick={() => setShowFailureReasons(false)} className="text-rose-400 hover:text-rose-600">
               <X className="w-3 h-3" />
             </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {failureOptions.map(opt => (
              <button
                key={opt}
                onClick={() => {
                  setFailureReason(opt);
                  setIsCompleted(true);
                  setShowFailureReasons(false);
                  if (onLogSet) {
                    onLogSet({
                      exerciseId,
                      setNumber: set.setNumber,
                      plannedReps: set.reps,
                      reps: parseInt(actualReps),
                      targetWeightKg: set.weightKg,
                      weightKg: parseFloat(actualWeight),
                      failureReason: opt,
                      isCompleted: true
                    });
                  }
                }}
                className="px-2 py-1 bg-white border border-rose-200 rounded text-[10px] font-bold text-rose-600 hover:bg-rose-100 transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
