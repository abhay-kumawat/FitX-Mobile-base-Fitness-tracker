"use client";

import React, { useState } from "react";
import { 
  Dumbbell, 
  Plus, 
  Check, 
  Copy, 
  RefreshCw, 
  Sparkles, 
  Sliders, 
  ChevronUp, 
  ShieldCheck,
  Zap,
  Volume2,
  Flame,
  Repeat,
  ChevronDown,
  SkipForward
} from "lucide-react";
import { useWorkoutStore } from "@/store/useWorkoutStore";
import { ExerciseState, SetLog } from "@/lib/workout/storage";
import { FormChecklistDrawer } from "./FormChecklistDrawer";
import { soundscapeEngine, speakCoachCue } from "@/lib/workout/soundscapeEngine";

interface ActiveExerciseCardProps {
  exercise: ExerciseState;
  exerciseIndex: number;
  totalExercises: number;
  onToggleSet: (exerciseId: string, setIndex: number) => void;
  onUpdateWeightRep: (exerciseId: string, setIndex: number, newWeight: number, newReps: number) => void;
  onDuplicateSet: (exerciseId: string) => void;
  onSwapExercise: (exerciseId: string) => void;
  onToggleEquipmentAlt: (exerciseId: string) => void;
}

export const ActiveExerciseCard: React.FC<ActiveExerciseCardProps> = ({
  exercise,
  exerciseIndex,
  totalExercises,
  onToggleSet,
  onUpdateWeightRep,
  onDuplicateSet,
  onSwapExercise,
  onToggleEquipmentAlt,
}) => {
  const [editingSetIdx, setEditingSetIdx] = useState<number | null>(null);
  const [tempWeight, setTempWeight] = useState(exercise.weightKg);
  const [tempReps, setTempReps] = useState(10);
  const [selectedRpe, setSelectedRpe] = useState(8);
  const [showWarmupModal, setShowWarmupModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);

  const isAllSetsDone = exercise.setsLog.every((s) => s.completed);
  const estimated1RM = Math.round(tempWeight * (1 + tempReps / 30));

  const handleSetClick = (setIdx: number) => {
    onToggleSet(exercise.id, setIdx);
    soundscapeEngine.playBeep(1046.5, 0.1, "sine");
    if (navigator.vibrate) navigator.vibrate([35, 45, 35]);
  };

  const handleOpenSlider = (setIdx: number, currentSet: SetLog) => {
    setEditingSetIdx(setIdx);
    setTempWeight(currentSet.weightKg || exercise.weightKg);
    setTempReps(currentSet.reps || 10);
  };

  const handleSaveSlider = () => {
    if (editingSetIdx !== null) {
      onUpdateWeightRep(exercise.id, editingSetIdx, tempWeight, tempReps);
      setEditingSetIdx(null);
    }
  };

  const formCues = [
    "Retract scapula & keep chest elevated",
    "Control 3-second lowering tempo (3-1-1-0 pace)",
    "Exhale smoothly at peak contraction"
  ];

  const commonMistakes = [
    "Flaring elbows past 90 degrees",
    "Bouncing weight off chest at bottom",
    "Arching lower back excessively"
  ];

  const warmupPyramid = [
    { pct: "50%", weight: Math.round(exercise.weightKg * 0.5), reps: 10, note: "Warmup Set 1" },
    { pct: "70%", weight: Math.round(exercise.weightKg * 0.7), reps: 6, note: "Warmup Set 2" },
    { pct: "85%", weight: Math.round(exercise.weightKg * 0.85), reps: 3, note: "Feeder Set" },
  ];

  const substitutes = [
    { name: `Dumbbell ${exercise.name.replace(/Barbell|Machine|Cable/g, "").trim()}`, equipment: "Dumbbells" },
    { name: `Cable ${exercise.name.replace(/Barbell|Dumbbell/g, "").trim()}`, equipment: "Cable Machine" },
    { name: `Smith Machine ${exercise.name.replace(/Barbell|Dumbbell/g, "").trim()}`, equipment: "Smith Machine" },
  ];

  return (
    <div className={`glass-card p-4 sm:p-5 space-y-3.5 relative transition-all rounded-3xl ${
      isAllSetsDone ? "border-emerald-400/50 bg-emerald-500/10" : "border-slate-800"
    }`}>
      {/* Warmup Modal */}
      {showWarmupModal && (
        <div className="p-4 rounded-2xl bg-[#1A1F2C] border border-warm-amber/40 space-y-3 animate-smooth-reveal">
          <div className="flex items-center justify-between text-xs font-black text-warm-amber">
            <span className="flex items-center"><Flame className="w-4 h-4 mr-1 text-warm-amber" /> Warm-Up Pyramid Calculator</span>
            <button onClick={() => setShowWarmupModal(false)} className="text-slate-400 text-xs font-bold">Close</button>
          </div>
          <p className="text-xs text-slate-300">Working Weight: {exercise.weightKg} kg</p>
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            {warmupPyramid.map((w, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-xs">
                <span className="text-[10px] text-teal-400 block font-bold">{w.pct} ({w.note})</span>
                <span className="font-black text-white">{w.weight} kg</span>
                <span className="text-[10px] text-slate-400 block">{w.reps} reps</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipment Substitution Modal */}
      {showSubModal && (
        <div className="p-4 rounded-2xl bg-[#1A1F2C] border border-teal-500/40 space-y-3 animate-smooth-reveal">
          <div className="flex items-center justify-between text-xs font-black text-teal-400">
            <span className="flex items-center"><Repeat className="w-4 h-4 mr-1 text-teal-400" /> Equipment Auto-Substitution</span>
            <button onClick={() => setShowSubModal(false)} className="text-slate-400 text-xs font-bold">Close</button>
          </div>
          <div className="space-y-2">
            {substitutes.map((sub, idx) => (
              <button
                key={idx}
                onClick={() => {
                  exercise.name = sub.name;
                  setShowSubModal(false);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 border border-slate-700 hover:border-teal-400 text-xs font-bold text-slate-200 flex justify-between items-center"
              >
                <span>{sub.name}</span>
                <span className="text-[10px] text-teal-400 font-mono">{sub.equipment}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Exercise Title & Tags */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-black text-teal-400 bg-teal-500/15 px-2.5 py-0.5 rounded-full border border-teal-500/30">
              MOVE #{exerciseIndex + 1} OF {totalExercises}
            </span>
          </div>

          <h4 className="text-lg font-black text-white flex items-center">
            <Dumbbell className="w-5 h-5 mr-2 text-teal-400 shrink-0" />
            {exercise.name}
          </h4>

          <p className="text-xs text-slate-300 font-semibold">
            {exercise.reps} • <span className="text-teal-300">{exercise.muscles}</span>
          </p>
        </div>

        {/* Quick Tools */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={() => setShowWarmupModal(!showWarmupModal)}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-warm-amber hover:bg-warm-amber/20 transition-all touch-target"
            title="Warm-up Pyramid"
          >
            <Flame className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              const reason = prompt("Reason for skipping exercise? (e.g. Pain, Equipment unavailable, No time, Fatigue)", "Equipment unavailable");
              if (reason) {
                useWorkoutStore.getState().skipExercise(exercise.id, reason);
              }
            }}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-rose-400 hover:bg-rose-500/20 transition-all touch-target flex items-center gap-1 text-xs font-bold"
            title="Skip Exercise"
          >
            <SkipForward className="w-4 h-4" /> Skip
          </button>

          <button
            onClick={() => speakCoachCue(`Starting ${exercise.name}. Maintain a smooth rhythm.`)}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-teal-400 transition-all touch-target"
            title="Voice Cue"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Human Form & Safety Tag */}
      <div className="text-xs text-slate-200 bg-slate-900/80 p-3 rounded-2xl border border-slate-700/60 flex items-center space-x-2 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{exercise.safetyNote}</span>
      </div>

      {/* Sets Tracker Grid */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs font-black text-slate-300 uppercase tracking-wider px-0.5">
          <span>Set Logs ({exercise.setsLog.length})</span>
          <button
            onClick={() => onDuplicateSet(exercise.id)}
            className="text-teal-400 hover:underline flex items-center text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Set
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {exercise.setsLog.map((setItem, setIdx) => {
            const isDone = setItem.completed;
            return (
              <div key={setIdx} className="relative group">
                <button
                  onClick={() => handleSetClick(setIdx)}
                  className={`w-full py-3.5 px-2 rounded-2xl text-xs font-black transition-all touch-target flex flex-col items-center justify-center space-y-0.5 border active:scale-95 ${
                    isDone
                      ? "bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                      : "bg-slate-900/80 text-slate-200 border-slate-700 hover:border-teal-400"
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <span>Set {setIdx + 1}</span>}
                  </div>
                  <span className="text-[11px] font-mono font-bold opacity-90">
                    {setItem.weightKg}kg × {setItem.reps}
                  </span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenSlider(setIdx, setItem);
                  }}
                  className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-slate-800 border border-slate-600 text-slate-300 hover:text-white shadow-md"
                  title="Adjust Weight & Reps"
                >
                  <Sliders className="w-3 h-3 text-teal-400" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weight & Rep Slider Tuner Drawer */}
      {editingSetIdx !== null && (
        <div className="p-4 rounded-2xl bg-[#1A1F2C] border border-teal-500/40 space-y-3 animate-smooth-reveal">
          <div className="flex items-center justify-between text-xs font-black text-white">
            <span>Set {editingSetIdx + 1} Weight & Rep Tuner</span>
            <span className="text-emerald-400 font-mono font-bold">Est 1RM: {estimated1RM} kg</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-bold">Quick Add:</span>
            {[1, 2.5, 5].map((inc) => (
              <button
                key={inc}
                onClick={() => setTempWeight((w) => parseFloat((w + inc).toFixed(1)))}
                className="px-2.5 py-1 rounded-lg bg-teal-500/20 border border-teal-500/30 text-xs font-mono font-bold text-teal-300 hover:bg-teal-500/30"
              >
                +{inc}kg
              </button>
            ))}
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Weight: <strong className="text-teal-400">{tempWeight} kg</strong></span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="0.5"
                value={tempWeight}
                onChange={(e) => setTempWeight(parseFloat(e.target.value))}
                className="w-full h-2 accent-teal-400 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Reps: <strong className="text-warm-gold">{tempReps} reps</strong></span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={tempReps}
                onChange={(e) => setTempReps(parseInt(e.target.value))}
                className="w-full h-2 accent-warm-gold bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleSaveSlider}
            className="w-full py-2.5 rounded-xl bg-teal-500 text-slate-950 font-black text-xs shadow-md"
          >
            Confirm Set ({tempWeight}kg × {tempReps})
          </button>
        </div>
      )}

      {/* Form Checklist Drawer */}
      <FormChecklistDrawer
        exerciseName={exercise.name}
        formCues={formCues}
        commonMistakes={commonMistakes}
      />
    </div>
  );
};
