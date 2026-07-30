"use client";

import React, { useState, useEffect } from "react";
import { useWorkoutStore } from "@/store/useWorkoutStore";
import { MascotVector } from "@/components/atomic/MascotVector";
import { PillBadge } from "@/components/atomic/PillBadge";
import { Button3D } from "@/components/atomic/Button3D";
import { DetailedSetLogger } from "@/components/workout/DetailedSetLogger";
import { RestTimerEngine } from "@/components/workout/RestTimerEngine";
import { WorkoutPlanner } from "@/components/workout/WorkoutPlanner";
import { EditableWorkoutBuilder } from "@/components/workout/EditableWorkoutBuilder";
import { PersistentAICoach } from "@/components/workout/PersistentAICoach";
import { WarmupPyramidModal } from "@/components/workout/WarmupPyramidModal";
import { PlateLoadingVisualizerModal } from "@/components/workout/PlateLoadingVisualizerModal";
import { SmartRestRecoveryOverlay } from "@/components/workout/SmartRestRecoveryOverlay";
import { PostWorkoutVictoryModal } from "@/components/workout/PostWorkoutVictoryModal";
import { soundscape } from "@/lib/soundscapeEngine";
import { ChevronRight, ChevronLeft, Flame, Info, CheckCircle2, Dumbbell, Calendar, LayoutDashboard } from "lucide-react";

export default function WorkoutHUDPage() {
  const workoutStore = useWorkoutStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"planner" | "active">("active");
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

  const currentExerciseIndex = workoutStore?.currentExerciseIndex || 0;
  const exercisesList = workoutStore?.exercises && workoutStore.exercises.length > 0 ? workoutStore.exercises : [
    {
      id: "ex1",
      name: "Barbell Incline Bench Press",
      muscleTag: "Upper Chest",
      formGuard: "Form Guard Active",
      tips: ["Retract shoulders", "Control descent"],
      targetSets: 4,
      sets: [
        { setNumber: 1, weightKg: 60, reps: 10, completed: true, type: "warmup" as const },
        { setNumber: 2, weightKg: 80, reps: 8, completed: false, type: "work" as const },
      ],
    }
  ];

  const currentExercise = exercisesList[currentExerciseIndex] || exercisesList[0];

  const handleFinish = () => {
    soundscape.playVictoryFanfare();
    if (workoutStore?.finishWorkout) workoutStore.finishWorkout();
  };

  return (
    <div className="flex flex-col gap-6 pb-28 animate-smooth-reveal">
      
      {/* Dashboard Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => { soundscape.playTapSound(); setActiveTab("active"); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${activeTab === "active" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Dumbbell className="w-4 h-4" /> Today's Workout
        </button>
        <button
          onClick={() => { soundscape.playTapSound(); setActiveTab("planner"); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${activeTab === "planner" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Calendar className="w-4 h-4" /> Planner
        </button>
      </div>

      {activeTab === "planner" && (
        <div className="flex flex-col gap-6">
          <WorkoutPlanner />
          <EditableWorkoutBuilder />
        </div>
      )}

      {activeTab === "active" && (
        <div className="flex flex-col gap-5">
          {/* Real-Time Cheer Banner */}
          <div className="p-3.5 rounded-2xl duo-card bg-white border border-slate-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <MascotVector mood="pumped" size={54} />
              <div className="flex flex-col">
                <span className="text-xs font-black text-emerald-600">AI Form Guard</span>
                <span className="text-[11px] font-bold text-slate-700">"Drive with your elbows and feel the stretch!"</span>
              </div>
            </div>
            <PillBadge variant="gold" icon={<Flame className="w-3 h-3 text-amber-500 fill-amber-500" />}>
              Set {currentExerciseIndex + 1}/{exercisesList.length}
            </PillBadge>
          </div>

          {/* Exercise Navigation Header */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => { soundscape.playTapSound(); workoutStore?.previousExercise && workoutStore.previousExercise(); }}
              disabled={currentExerciseIndex === 0}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 disabled:opacity-40 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Movement {currentExerciseIndex + 1} of {exercisesList.length}
            </span>
            <button
              onClick={() => { soundscape.playTapSound(); workoutStore?.nextExercise && workoutStore.nextExercise(); }}
              disabled={currentExerciseIndex === exercisesList.length - 1}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 disabled:opacity-40 text-slate-700 hover:bg-slate-200 transition-colors"
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

              {/* Detailed Set Logger */}
              <div className="flex flex-col gap-2.5">
                {(currentExercise.sets || []).map((set, idx) => (
                  <DetailedSetLogger
                    key={idx}
                    exerciseId={currentExercise.id}
                    setIndex={idx}
                    set={set}
                    onLogSet={(data) => {
                      console.log("Logged Set:", data);
                    }}
                  />
                ))}
              </div>

              {/* Rest Timer Engine */}
              <div className="pt-2 border-t border-slate-200">
                <RestTimerEngine initialSeconds={90} mode="rest" />
              </div>
            </div>
          )}

          {/* Expandable Form Tips */}
          {currentExercise && (
            <div className="duo-card p-4 bg-white border border-slate-200 flex flex-col gap-2 shadow-xs">
              <button
                onClick={() => { soundscape.playTapSound(); setShowTips(!showTips); }}
                className="flex items-center justify-between text-xs font-black text-slate-800 w-full"
              >
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600" /> Form Tips & Safety
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
        </div>
      )}

      {/* Persistent AI Coach */}
      <PersistentAICoach />

      {/* Modals & Overlays */}
      <WarmupPyramidModal />
      <PlateLoadingVisualizerModal />
      <SmartRestRecoveryOverlay />
      <PostWorkoutVictoryModal />
    </div>
  );
}
