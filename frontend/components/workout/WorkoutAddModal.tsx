"use client";

import React, { useState } from "react";
import { X, Plus, Sparkles, Copy, Calendar, RefreshCw, Moon, FileText, CheckCircle2 } from "lucide-react";
import { soundscape } from "@/lib/soundscapeEngine";
import { useWorkoutStore } from "@/store/useWorkoutStore";

const TEMPLATE_PRESETS = [
  { id: "tmpl_ppl_push", name: "Push Hypertrophy", goal: "Hypertrophy", exercisesCount: 4, estMin: 50 },
  { id: "tmpl_ppl_pull", name: "Pull Heavy Power", goal: "Strength", exercisesCount: 5, estMin: 60 },
  { id: "tmpl_ppl_legs", name: "Leg Quad & Glute Focus", goal: "Hypertrophy", exercisesCount: 4, estMin: 45 },
  { id: "tmpl_fullbody", name: "Full Body Athletic Conditioning", goal: "Endurance", exercisesCount: 6, estMin: 55 },
];

export function WorkoutAddModal() {
  const store = useWorkoutStore();
  const isOpen = store.showAddModal;
  const selectedDate = store.selectedDate;

  const [activeStep, setActiveStep] = useState<"menu" | "templates" | "duplicate" | "notes">("menu");
  const [duplicateTargetDate, setDuplicateTargetDate] = useState<string>("");
  const [notesInput, setNotesInput] = useState<string>("");

  if (!isOpen) return null;

  const dateFormatted = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });

  const handleClose = () => {
    soundscape.playTapSound();
    setActiveStep("menu");
    store.toggleAddModal(false);
  };

  const handleCreateNew = async () => {
    soundscape.playTapSound();
    await store.assignToDay(selectedDate, {
      assignment_type: "workout",
      name: "Custom Workout",
      goal: "Hypertrophy",
      workout_data: {
        exercises: [
          {
            id: `ex_${Date.now()}`,
            name: "Barbell Flat Bench Press",
            muscleTag: "Chest & Triceps",
            formGuard: "Form Guard: Retract Scapula 30°",
            tips: ["Control eccentric descent", "Explode off chest"],
            targetSets: 3,
            sets: [
              { setNumber: 1, weightKg: 60, reps: 10, completed: false, type: "work" },
              { setNumber: 2, weightKg: 70, reps: 8, completed: false, type: "work" },
              { setNumber: 3, weightKg: 70, reps: 8, completed: false, type: "work" },
            ]
          }
        ]
      }
    });
    handleClose();
  };

  const handleSelectTemplate = async (tmpl: typeof TEMPLATE_PRESETS[0]) => {
    soundscape.playTapSound();
    await store.assignToDay(selectedDate, {
      assignment_type: "workout",
      name: tmpl.name,
      goal: tmpl.goal,
      workout_data: {
        exercises: [
          {
            id: `tmpl_ex_1_${Date.now()}`,
            name: `${tmpl.name} Main Movement`,
            muscleTag: "Primary Target",
            formGuard: "Form Guard: Maintain strict cadence",
            tips: ["Keep core tight", "Rest 90 seconds between sets"],
            targetSets: 4,
            sets: [
              { setNumber: 1, weightKg: 60, reps: 10, completed: false, type: "warmup" },
              { setNumber: 2, weightKg: 80, reps: 8, completed: false, type: "work" },
              { setNumber: 3, weightKg: 80, reps: 8, completed: false, type: "work" },
              { setNumber: 4, weightKg: 80, reps: 8, completed: false, type: "work" },
            ]
          }
        ]
      }
    });
    handleClose();
  };

  const handleAIGenerate = async () => {
    soundscape.playTapSound();
    await store.performDayActionStore(selectedDate, "ai_generate");
    handleClose();
  };

  const handleRestDay = async () => {
    soundscape.playTapSound();
    await store.performDayActionStore(selectedDate, "rest");
    handleClose();
  };

  const handleImportPrevWeek = async () => {
    soundscape.playTapSound();
    // Calculate same weekday date 7 days ago
    const current = new Date(selectedDate + "T00:00:00");
    current.setDate(current.getDate() - 7);
    const prevDateStr = current.toISOString().split("T")[0];
    await store.performDayActionStore(prevDateStr, "duplicate", selectedDate);
    handleClose();
  };

  const handleDuplicateFromDay = async (sourceDate: string) => {
    soundscape.playTapSound();
    await store.performDayActionStore(sourceDate, "duplicate", selectedDate);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Assign Workout</span>
            <h2 className="text-base font-black text-slate-900">{dateFormatted}</h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Mode Selection Menu */}
        {activeStep === "menu" && (
          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:scale-[1.01] transition-transform text-left group"
            >
              <div className="p-2.5 bg-white/20 rounded-xl">
                <Plus className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider">Create New Workout</span>
                <span className="text-[11px] text-emerald-100 font-medium">Build a fresh workout routine for this day</span>
              </div>
            </button>

            <button
              onClick={handleAIGenerate}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition-colors text-left"
            >
              <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider text-purple-300">AI Generate Workout</span>
                <span className="text-[11px] text-slate-400 font-medium">Auto-generate optimal exercises based on recovery</span>
              </div>
            </button>

            <button
              onClick={() => setActiveStep("templates")}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-emerald-50 hover:border-emerald-200 transition-colors text-left"
            >
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider">Choose Existing Template</span>
                <span className="text-[11px] text-slate-500 font-medium">Pick from saved PPL, Full Body & Split presets</span>
              </div>
            </button>

            <button
              onClick={() => setActiveStep("duplicate")}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-emerald-50 hover:border-emerald-200 transition-colors text-left"
            >
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                <Copy className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider">Duplicate Another Day</span>
                <span className="text-[11px] text-slate-500 font-medium">Copy workout plan from another day of the week</span>
              </div>
            </button>

            <button
              onClick={handleImportPrevWeek}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-emerald-50 hover:border-emerald-200 transition-colors text-left"
            >
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider">Import Previous Week</span>
                <span className="text-[11px] text-slate-500 font-medium">Import last week's workout for this same day</span>
              </div>
            </button>

            <button
              onClick={handleRestDay}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 hover:bg-indigo-100 transition-colors text-left"
            >
              <div className="p-2.5 bg-indigo-200 text-indigo-800 rounded-xl">
                <Moon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-900">Set as Rest & Active Recovery</span>
                <span className="text-[11px] text-indigo-600 font-medium">Mark this calendar day for rest and tissue repair</span>
              </div>
            </button>
          </div>
        )}

        {/* Step 2: Templates Selection */}
        {activeStep === "templates" && (
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setActiveStep("menu")}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 self-start mb-1"
            >
              ← Back to options
            </button>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Select Workout Template</h3>
            <div className="flex flex-col gap-2">
              {TEMPLATE_PRESETS.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-800">{tmpl.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{tmpl.goal} • {tmpl.exercisesCount} Movements</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 rounded-md text-slate-600">~{tmpl.estMin}m</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Duplicate Picker */}
        {activeStep === "duplicate" && (
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setActiveStep("menu")}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 self-start mb-1"
            >
              ← Back to options
            </button>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Choose Day to Copy From</h3>
            <div className="flex flex-col gap-2">
              {Object.keys(store.calendarAssignments).length === 0 ? (
                <span className="text-xs text-slate-400 py-4 text-center">No other day plans found in this week yet</span>
              ) : (
                Object.entries(store.calendarAssignments).map(([dateKey, assignment]: [string, any]) => {
                  if (dateKey === selectedDate) return null;
                  return (
                    <button
                      key={dateKey}
                      onClick={() => handleDuplicateFromDay(dateKey)}
                      className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-left flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800">{assignment.name}</span>
                        <span className="text-[10px] font-bold text-slate-400">{dateKey}</span>
                      </div>
                      <Copy className="w-4 h-4 text-emerald-600" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
