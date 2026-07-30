"use client";

import React, { useState } from "react";
import { CheckCircle2, Edit3, SkipForward, XCircle, AlertTriangle, Flame } from "lucide-react";
import { soundscape } from "@/lib/soundscapeEngine";
import { useWorkoutStore } from "@/store/useWorkoutStore";

interface CurrentSetLoggerProps {
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

export function CurrentSetLogger({ exerciseId, setIndex, set, onLogSet }: CurrentSetLoggerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [actualReps, setActualReps] = useState(set.reps.toString());
  const [actualWeight, setActualWeight] = useState(set.weightKg.toString());
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
    
    if (parseInt(actualReps) < set.reps && !failureReason) {
      setShowFailureReasons(true);
      return;
    }

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

  const handleSkip = () => {
    soundscape.playTapSound();
    const reason = prompt("Reason for skipping set? (e.g. Too heavy, Joint Pain, Time limit)", "Time limit");
    if (reason) {
      useWorkoutStore.getState().skipSet(exerciseId, setIndex, reason);
    }
  };

  const handleFail = () => {
    soundscape.playTapSound();
    setShowFailureReasons(true);
  };

  return (
    <div className="flex flex-col gap-4 p-5 bg-gradient-to-b from-white to-slate-50 rounded-2xl border-2 border-emerald-500 shadow-[0_8px_30px_rgb(16,185,129,0.15)] transition-all relative overflow-hidden animate-smooth-reveal">
      
      {/* Top Banner Indicator */}
      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" /> CURRENT SET {set.setNumber}
          </span>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {set.type === "warmup" ? "WARMUP" : "WORKING"}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-4 border-y border-emerald-100/50 bg-emerald-50/30 rounded-xl">
        <span className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Target</span>
        
        {!isEditing ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-slate-800">{actualWeight}<span className="text-lg text-slate-500 ml-1">kg</span></span>
            <span className="text-xl font-black text-slate-300">×</span>
            <span className="text-3xl font-black text-slate-800">{actualReps}<span className="text-lg text-slate-500 ml-1">reps</span></span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border-2 border-emerald-400 shadow-inner">
              <input 
                type="number" 
                value={actualWeight}
                onChange={(e) => setActualWeight(e.target.value)}
                className="w-16 bg-transparent text-center font-black text-2xl text-slate-800 outline-none"
                autoFocus
              />
              <span className="text-sm text-slate-500 font-bold">kg</span>
            </div>
            <span className="text-xl font-black text-slate-300">×</span>
            <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border-2 border-emerald-400 shadow-inner">
              <input 
                type="number" 
                value={actualReps}
                onChange={(e) => setActualReps(e.target.value)}
                className="w-12 bg-transparent text-center font-black text-2xl text-slate-800 outline-none"
              />
              <span className="text-sm text-slate-500 font-bold">reps</span>
            </div>
          </div>
        )}
      </div>

      {showFailureReasons && (
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 animate-smooth-reveal flex flex-col gap-2">
          <div className="flex items-center justify-between">
             <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
               <AlertTriangle className="w-4 h-4" /> Why did you stop?
             </span>
             <button onClick={() => setShowFailureReasons(false)} className="text-rose-400 hover:text-rose-600">
               <XCircle className="w-4 h-4" />
             </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {failureOptions.map(opt => (
              <button
                key={opt}
                onClick={() => {
                  setFailureReason(opt);
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
                className="px-3 py-1.5 bg-white border-2 border-rose-200 rounded-lg text-[11px] font-black text-rose-600 hover:bg-rose-100 transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Action */}
      {!showFailureReasons && (
        <button
          onClick={handleComplete}
          className="w-full py-4 rounded-xl bg-emerald-500 text-white font-black text-lg flex items-center justify-center gap-2 hover:bg-emerald-600 shadow-[0_4px_20px_rgb(16,185,129,0.3)] transition-all active:scale-[0.98]"
        >
          <CheckCircle2 className="w-6 h-6" /> COMPLETE SET
        </button>
      )}

      {/* Secondary Actions */}
      <div className="flex items-center justify-center gap-4 mt-1">
        <button
          onClick={() => { soundscape.playTapSound(); setIsEditing(!isEditing); }}
          className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isEditing ? "text-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Edit3 className="w-3.5 h-3.5" /> {isEditing ? "Done Editing" : "Edit"}
        </button>
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors"
        >
          <SkipForward className="w-3.5 h-3.5" /> Skip
        </button>
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <button
          onClick={handleFail}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors"
        >
          <XCircle className="w-3.5 h-3.5" /> Fail
        </button>
      </div>

    </div>
  );
}
