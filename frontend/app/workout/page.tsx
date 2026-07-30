"use client";

import React, { useState, useEffect } from "react";
import { useWorkoutStore } from "@/store/useWorkoutStore";
import { MascotVector } from "@/components/atomic/MascotVector";
import { PillBadge } from "@/components/atomic/PillBadge";
import { Button3D } from "@/components/atomic/Button3D";
import { CurrentSetLogger } from "@/components/workout/CurrentSetLogger";
import { CollapsedSetRow } from "@/components/workout/CollapsedSetRow";
import { RestTimerEngine } from "@/components/workout/RestTimerEngine";
import { WorkoutPlanner } from "@/components/workout/WorkoutPlanner";
import { EditableWorkoutBuilder } from "@/components/workout/EditableWorkoutBuilder";
import { WorkoutAddModal } from "@/components/workout/WorkoutAddModal";
import { DayActionContextMenu } from "@/components/workout/DayActionContextMenu";
import { ExercisePickerModal } from "@/components/workout/ExercisePickerModal";
import { DraggableFloatingAI } from "@/components/coach_chat/DraggableFloatingAI";
import { WarmupPyramidModal } from "@/components/workout/WarmupPyramidModal";
import { PlateLoadingVisualizerModal } from "@/components/workout/PlateLoadingVisualizerModal";
import { SmartRestRecoveryOverlay } from "@/components/workout/SmartRestRecoveryOverlay";
import { PostWorkoutVictoryModal } from "@/components/workout/PostWorkoutVictoryModal";
import { PerformanceReportModal } from "@/components/workout/PerformanceReportModal";
import { soundscape } from "@/lib/soundscapeEngine";
import { AuthGuard } from "@/components/AuthGuard";
import { ChevronRight, ChevronLeft, Flame, Info, CheckCircle2, Dumbbell, Calendar, Pause, Play, XCircle, Activity } from "lucide-react";

export default function WorkoutHUDPage() {
  const workoutStore = useWorkoutStore();
  const [mounted, setMounted] = useState(false);

  const [activeTab, setActiveTab] = useState<"planner" | "active">("active");
  const [showTips, setShowTips] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    workoutStore.syncActiveSession();
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentExerciseIndex = workoutStore?.currentExerciseIndex || 0;
  const exercisesList = workoutStore?.exercises && workoutStore.exercises.length > 0 ? workoutStore.exercises : [];
  const currentExercise = exercisesList[currentExerciseIndex] || exercisesList[0];

  const handleOpenFinishReport = () => {
    soundscape.playTapSound();
    workoutStore.toggleReportModal(true);
  };

  const handleFinalSubmit = async (reportData: any) => {
    soundscape.playVictoryFanfare();
    await workoutStore.finishWorkout(reportData);
  };

  return (
    <AuthGuard>
      <div className="flex flex-col gap-6 pb-28 animate-smooth-reveal">
      
      {/* Session Status & Control Bar */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${workoutStore.isWorkoutActive ? "bg-emerald-400 animate-ping" : workoutStore.workoutStatus === "paused" ? "bg-amber-400" : "bg-slate-500"}`} />
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-slate-200">
              {workoutStore.workoutName}
            </span>
            <span className="text-[10px] font-bold text-emerald-400 capitalize">
              Status: {workoutStore.workoutStatus}
            </span>
          </div>
        </div>

        {/* Workout Control Actions */}
        <div className="flex items-center gap-1.5">
          {workoutStore.isWorkoutActive ? (
            <button
              onClick={() => { soundscape.playTapSound(); workoutStore.pauseWorkout(); }}
              className="px-2.5 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-amber-500/30"
            >
              <Pause className="w-3.5 h-3.5" /> Pause
            </button>
          ) : workoutStore.workoutStatus === "paused" ? (
            <button
              onClick={() => { soundscape.playTapSound(); workoutStore.resumeWorkout(); }}
              className="px-2.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-emerald-500/30"
            >
              <Play className="w-3.5 h-3.5" /> Resume
            </button>
          ) : (
            <button
              onClick={() => { soundscape.playTapSound(); workoutStore.startWorkout(); }}
              className="px-2.5 py-1.5 bg-emerald-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm"
            >
              <Play className="w-3.5 h-3.5" /> Start
            </button>
          )}

          {(workoutStore.isWorkoutActive || workoutStore.workoutStatus === "paused") && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to cancel this workout session?")) {
                  workoutStore.cancelWorkout("User cancelled");
                }
              }}
              className="p-1.5 bg-slate-800 text-rose-400 hover:bg-rose-500/20 rounded-xl border border-slate-700"
              title="Cancel Session"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => { soundscape.playTapSound(); setActiveTab("active"); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${activeTab === "active" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Dumbbell className="w-4 h-4" /> Active HUD
        </button>
        <button
          onClick={() => { soundscape.playTapSound(); setActiveTab("planner"); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${activeTab === "planner" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Calendar className="w-4 h-4" /> Planner & Builder
        </button>
      </div>

      {activeTab === "planner" && (
        <div className="flex flex-col gap-6">
          <WorkoutPlanner onAddExercise={() => { setActiveTab("active"); }} />
          <EditableWorkoutBuilder onAddExercise={() => setIsPickerOpen(true)} />
        </div>
      )}

      {activeTab === "active" && (
        <div className="flex flex-col gap-5">
          {/* Real-Time Cheer Banner */}
          <div className="p-3.5 rounded-2xl duo-card bg-white border border-slate-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <MascotVector mood="pumped" size={54} />
              <div className="flex flex-col">
                <span className="text-xs font-black text-emerald-600">AI Live Form Guard</span>
                <span className="text-[11px] font-bold text-slate-700">"Drive through your heels and control the eccentrics!"</span>
              </div>
            </div>
            <PillBadge variant="gold" icon={<Flame className="w-3 h-3 text-amber-500 fill-amber-500" />}>
              Movement {currentExerciseIndex + 1}/{exercisesList.length}
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

              {/* Guided Workout Sets */}
              <div className="flex flex-col gap-3">
                {(() => {
                  const sets = currentExercise.sets || [];
                  const activeSetIndex = sets.findIndex(s => !s.completed);
                  const isAllComplete = activeSetIndex === -1;
                  
                  return (
                    <>
                      {/* Completed Sets (Collapsed) */}
                      {sets.map((set, idx) => {
                        if (isAllComplete || idx < activeSetIndex) {
                          return (
                            <CollapsedSetRow
                              key={idx}
                              exerciseId={currentExercise.id}
                              setIndex={idx}
                              set={set}
                              onLogSet={(data) => {
                                workoutStore.toggleSetComplete(currentExercise.id, idx, data);
                              }}
                            />
                          );
                        }
                        return null;
                      })}

                      {/* Active Set or Rest Timer */}
                      {!isAllComplete && workoutStore.isRestActive ? (
                        <div className="flex flex-col gap-2 animate-smooth-reveal">
                          <RestTimerEngine 
                            initialSeconds={workoutStore.restCountdownSeconds || 90} 
                            autoStart={true}
                            onComplete={() => workoutStore.stopRestTimer()}
                          />
                          <button 
                            onClick={() => workoutStore.stopRestTimer()}
                            className="text-xs font-bold text-slate-400 hover:text-slate-600 underline text-center"
                          >
                            Skip Rest
                          </button>
                          <div className="mt-2 opacity-60 pointer-events-none scale-95 origin-top">
                            {/* Peek at the next set */}
                            <CurrentSetLogger
                              exerciseId={currentExercise.id}
                              setIndex={activeSetIndex}
                              set={sets[activeSetIndex]}
                            />
                          </div>
                        </div>
                      ) : !isAllComplete ? (
                        <div className="animate-smooth-reveal">
                          <CurrentSetLogger
                            exerciseId={currentExercise.id}
                            setIndex={activeSetIndex}
                            set={sets[activeSetIndex]}
                            onLogSet={(data) => {
                              workoutStore.toggleSetComplete(currentExercise.id, activeSetIndex, data);
                            }}
                          />
                        </div>
                      ) : (
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center animate-smooth-reveal flex flex-col items-center justify-center">
                          <span className="text-sm font-black text-emerald-600 block mb-3">Exercise Complete!</span>
                          {currentExerciseIndex < exercisesList.length - 1 ? (
                            <button
                              onClick={() => {
                                soundscape.playTapSound();
                                workoutStore.nextExercise();
                              }}
                              className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 shadow-sm"
                            >
                              Move to Next Exercise
                            </button>
                          ) : (
                            <button
                              onClick={handleOpenFinishReport}
                              className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 shadow-sm"
                            >
                              Finish Workout
                            </button>
                          )}
                        </div>
                      )}

                      {/* Upcoming Sets (Minimal) */}
                      {!isAllComplete && sets.map((set, idx) => {
                        if (idx > activeSetIndex) {
                          return (
                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 opacity-50">
                              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Set {set.setNumber}</span>
                              <span className="text-xs font-bold text-slate-400">{set.weightKg} kg × {set.reps}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </>
                  );
                })()}
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
                  <Info className="w-4 h-4 text-emerald-600" /> Form Tips & Safety Cues
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
          <Button3D variant="gold" fullWidth onClick={handleOpenFinishReport} className="py-4">
            <CheckCircle2 className="w-5 h-5" /> Finish Workout & Submit Report
          </Button3D>
        </div>
      )}

      {/* Persistent AI Coach */}
      <DraggableFloatingAI />

      {/* Modals & Overlays */}
      <ExercisePickerModal 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)}
        onSelect={(ex) => {
          workoutStore.addExercise(ex);
          setIsPickerOpen(false);
        }}
      />
      <WarmupPyramidModal />
      <PlateLoadingVisualizerModal />
      <SmartRestRecoveryOverlay />
      <PostWorkoutVictoryModal />
      
      {/* Performance Report Drawer Modal */}
      <PerformanceReportModal
        isOpen={workoutStore.showReportModal}
        onClose={() => workoutStore.toggleReportModal(false)}
        onSubmitReport={handleFinalSubmit}
      />

      {/* Calendar Planner Modals & Context Menus */}
      <WorkoutAddModal />
      <DayActionContextMenu />
    </div>
  </AuthGuard>
);

}
