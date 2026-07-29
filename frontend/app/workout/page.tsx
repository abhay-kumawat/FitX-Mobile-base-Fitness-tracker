"use client";

import React, { useState, useEffect } from "react";
import { useWorkoutStore } from "@/store/useWorkoutStore";
import { MascotVector } from "@/components/atomic/MascotVector";
import { PillBadge } from "@/components/atomic/PillBadge";
import { Button3D } from "@/components/atomic/Button3D";
import { SetLogRow } from "@/components/atomic/SetLogRow";
import { WarmupPyramidModal } from "@/components/workout/WarmupPyramidModal";
import { PlateLoadingVisualizerModal } from "@/components/workout/PlateLoadingVisualizerModal";
import { SmartRestRecoveryOverlay } from "@/components/workout/SmartRestRecoveryOverlay";
import { PostWorkoutVictoryModal } from "@/components/workout/PostWorkoutVictoryModal";
import { soundscape } from "@/lib/soundscapeEngine";
import { ChevronRight, ChevronLeft, Flame, Info, Flame as Fire, Timer, CheckCircle2 } from "lucide-react";

export default function WorkoutHUDPage() {
  const workoutStore = useWorkoutStore();

  const currentExerciseIndex = workoutStore?.currentExerciseIndex || 0;
  const exercisesList = workoutStore?.exercises && workoutStore.exercises.length > 0 ? workoutStore.exercises : [
    {
      id: "ex1",
      name: "Barbell Incline Bench Press",
      muscleTag: "Upper Chest & Anterior Delts",
      formGuard: "Form Guard: Keep Scapula Retracted 30°",
      tips: [
        "Retract shoulders firmly against bench cushion before unrack.",
        "Lower bar smoothly to upper sternum under 2-second control.",
        "Drive feet firmly into floor without arching lower back excessively."
      ],
      targetSets: 4,
      sets: [
        { setNumber: 1, weightKg: 60, reps: 10, completed: true, type: "warmup" as const },
        { setNumber: 2, weightKg: 80, reps: 8, completed: true, type: "work" as const },
        { setNumber: 3, weightKg: 85, reps: 8, completed: false, type: "work" as const },
        { setNumber: 4, weightKg: 85, reps: 6, completed: false, type: "work" as const },
      ],
    },
    {
      id: "ex2",
      name: "Weighted Chest Dips",
      muscleTag: "Lower Pecs & Triceps Brachii",
      formGuard: "Form Guard: Torso Forward Lean 15°",
      tips: [
        "Lean torso forward slightly to isolate chest fibers over triceps.",
        "Control descent until elbows reach 90 degrees."
      ],
      targetSets: 3,
      sets: [
        { setNumber: 1, weightKg: 15, reps: 10, completed: false, type: "work" as const },
        { setNumber: 2, weightKg: 20, reps: 8, completed: false, type: "work" as const },
        { setNumber: 3, weightKg: 20, reps: 8, completed: false, type: "work" as const },
      ],
    }
  ];

  const [mounted, setMounted] = useState(false);
  const [showTips, setShowTips] = useState(false);

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

  const currentExercise = exercisesList[currentExerciseIndex] || exercisesList[0];

  const handleFinish = () => {
    soundscape.playVictoryFanfare();
    if (workoutStore?.finishWorkout) workoutStore.finishWorkout();
  };

  return (
    <div className="flex flex-col gap-5 pb-28 animate-smooth-reveal">
      {/* Flexy Real-Time Cheer Banner */}
      <div className="p-3.5 rounded-2xl duo-card bg-white border border-slate-200 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <MascotVector mood="pumped" size={54} />
          <div className="flex flex-col">
            <span className="text-xs font-black text-emerald-600">Flexy Form Guard Active</span>
            <span className="text-[11px] font-bold text-slate-700">"Drive with your elbows and feel the stretch!"</span>
          </div>
        </div>
        <PillBadge variant="gold" icon={<Flame className="w-3 h-3 text-amber-500 fill-amber-500" />}>
          Set 3/4
        </PillBadge>
      </div>

      {/* Exercise Navigation Header */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => workoutStore?.previousExercise && workoutStore.previousExercise()}
          disabled={currentExerciseIndex === 0}
          className="p-2 rounded-xl bg-slate-100 border border-slate-200 disabled:opacity-40 text-slate-700 hover:bg-slate-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
          Movement {currentExerciseIndex + 1} of {exercisesList.length}
        </span>

        <button
          type="button"
          onClick={() => workoutStore?.nextExercise && workoutStore.nextExercise()}
          disabled={currentExerciseIndex === exercisesList.length - 1}
          className="p-2 rounded-xl bg-slate-100 border border-slate-200 disabled:opacity-40 text-slate-700 hover:bg-slate-200"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Active Movement Card */}
      {currentExercise && (
        <div className="duo-card p-5 bg-white border border-slate-200 flex flex-col gap-4 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-slate-900">{currentExercise.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <PillBadge variant="green">{currentExercise.muscleTag}</PillBadge>
              <PillBadge variant="purple">{currentExercise.formGuard}</PillBadge>
            </div>
          </div>

          {/* Set Log Row Stack */}
          <div className="flex flex-col gap-2.5">
            {(currentExercise.sets || []).map((set, idx) => (
              <SetLogRow
                key={idx}
                exerciseId={currentExercise.id}
                setIndex={idx}
                set={set}
              />
            ))}
          </div>

          {/* Action Controls */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
            <Button3D
              variant="secondary"
              onClick={() => {
                soundscape.playTapSound();
                if (workoutStore?.toggleWarmupModal) workoutStore.toggleWarmupModal(true);
              }}
              className="text-xs py-2 px-3"
            >
              <Fire className="w-4 h-4 text-amber-500" /> Warmup Calculator
            </Button3D>

            <Button3D
              variant="blue"
              onClick={() => {
                soundscape.playTapSound();
                if (workoutStore?.startRestTimer) workoutStore.startRestTimer(90);
              }}
              className="text-xs py-2 px-3"
            >
              <Timer className="w-4 h-4" /> 90s Rest & 4-7-8 Pacer
            </Button3D>
          </div>
        </div>
      )}

      {/* Expandable Form Tips & Safety Drawer */}
      {currentExercise && (
        <div className="duo-card p-4 bg-white border border-slate-200 flex flex-col gap-2 shadow-xs">
          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className="flex items-center justify-between text-xs font-black text-slate-800 w-full"
          >
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600" /> Form Tips & Biomechanical Safety
            </span>
            <span className="text-emerald-600">{showTips ? "Hide" : "Show"}</span>
          </button>

          {showTips && (
            <ul className="flex flex-col gap-1.5 pt-2 border-t border-slate-200 text-xs font-bold text-slate-600 leading-relaxed">
              {(currentExercise.tips || []).map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Finish Workout CTA */}
      <Button3D variant="gold" fullWidth onClick={handleFinish} className="py-4">
        <CheckCircle2 className="w-5 h-5" /> Finish Workout & Claim XP
      </Button3D>

      {/* Modals & Overlays */}
      <WarmupPyramidModal />
      <PlateLoadingVisualizerModal />
      <SmartRestRecoveryOverlay />
      <PostWorkoutVictoryModal />
    </div>
  );
}
