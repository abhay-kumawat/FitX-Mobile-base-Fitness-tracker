"use client";

import React, { useState } from "react";
import { Plus, GripVertical, Trash2, Edit3, Save, Calendar, CheckCircle2, Moon } from "lucide-react";
import { soundscape } from "@/lib/soundscapeEngine";
import { useWorkoutStore } from "@/store/useWorkoutStore";

export function EditableWorkoutBuilder({ onAddExercise }: { onAddExercise?: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const store = useWorkoutStore();
  const selectedDate = store.selectedDate;
  const workoutName = store.workoutName;
  const exercises = store.exercises;

  const dateFormatted = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });

  const toggleEdit = async () => {
    soundscape.playTapSound();
    if (isEditing) {
      // Save changes specifically to selected date in backend DB
      await store.saveSelectedDayWorkout(exercises);
    }
    setIsEditing(!isEditing);
  };

  const handleRemove = async (id: string) => {
    soundscape.playTapSound();
    const updated = exercises.filter((ex) => ex.id !== id);
    await store.saveSelectedDayWorkout(updated);
  };

  return (
    <div className="duo-card p-4 bg-white border border-slate-200 shadow-sm flex flex-col gap-3">
      {/* Dynamic Header displaying currently selected calendar day */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-black uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>Structure for {dateFormatted}</span>
          </div>
          <h3 className="text-base font-black text-slate-900 mt-0.5">{workoutName || "Custom Workout"}</h3>
        </div>

        <button 
          onClick={toggleEdit}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isEditing 
              ? "bg-emerald-500 text-slate-950 shadow-sm hover:bg-emerald-400" 
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {isEditing ? <><Save className="w-3.5 h-3.5" /> Save Day Plan</> : <><Edit3 className="w-3.5 h-3.5" /> Edit Day Plan</>}
        </button>
      </div>

      {/* Movements list or empty/rest state */}
      {exercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 gap-2">
          <Moon className="w-6 h-6 text-indigo-400" />
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">No Exercises Assigned</span>
          <span className="text-[11px] text-slate-400 max-w-xs">
            This day is either marked as Rest or waiting for a workout plan to be added.
          </span>
          <button
            onClick={() => store.toggleAddModal(true)}
            className="mt-2 px-3 py-1.5 bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-emerald-400 transition-colors"
          >
            Assign Workout to {dateFormatted.split(",")[0]}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {exercises.map((ex, idx) => (
            <div key={ex.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 group hover:border-slate-300 transition-all">
              {isEditing && (
                <button className="text-slate-400 cursor-grab active:cursor-grabbing hover:text-slate-600">
                  <GripVertical className="w-4 h-4" />
                </button>
              )}
              <div className="flex flex-col flex-1">
                <span className="text-xs font-black text-slate-800">{idx + 1}. {ex.name}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  {ex.targetSets || ex.sets.length} Sets × {ex.sets[0]?.reps || 10} Reps • {ex.muscleTag || "Target Muscle"}
                </span>
              </div>
              {isEditing && (
                <button 
                  onClick={() => handleRemove(ex.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove exercise from day"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isEditing && (
        <button 
          onClick={() => onAddExercise && onAddExercise()}
          className="mt-1 w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-emerald-500" /> Add Movement to {dateFormatted.split(",")[0]}
        </button>
      )}
    </div>
  );
}
