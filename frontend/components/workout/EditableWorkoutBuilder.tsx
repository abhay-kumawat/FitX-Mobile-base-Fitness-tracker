"use client";

import React, { useState } from "react";
import { Plus, GripVertical, Trash2, Edit3, Save } from "lucide-react";
import { soundscape } from "@/lib/soundscapeEngine";

export function EditableWorkoutBuilder() {
  const [isEditing, setIsEditing] = useState(false);
  const [exercises, setExercises] = useState([
    { id: "ex1", name: "Barbell Bench Press", sets: 3, reps: "8-10", rest: 90 },
    { id: "ex2", name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: 60 }
  ]);

  const toggleEdit = () => {
    soundscape.playTapSound();
    setIsEditing(!isEditing);
  };

  const removeExercise = (id: string) => {
    soundscape.playTapSound();
    setExercises(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="duo-card p-4 bg-white border border-slate-200 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Workout Structure</h3>
        <button 
          onClick={toggleEdit}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
        >
          {isEditing ? <><Save className="w-3 h-3" /> Save</> : <><Edit3 className="w-3 h-3" /> Edit</>}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {exercises.map((ex, idx) => (
          <div key={ex.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 group">
            {isEditing && (
              <button className="text-slate-400 cursor-grab active:cursor-grabbing hover:text-slate-600">
                <GripVertical className="w-4 h-4" />
              </button>
            )}
            <div className="flex flex-col flex-1">
              <span className="text-xs font-black text-slate-700">{idx + 1}. {ex.name}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                {ex.sets} Sets × {ex.reps} Reps • {ex.rest}s Rest
              </span>
            </div>
            {isEditing && (
              <button 
                onClick={() => removeExercise(ex.id)}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {isEditing && (
        <button className="mt-2 w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-xs font-black text-slate-400 uppercase tracking-widest hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center gap-1">
          <Plus className="w-4 h-4" /> Add Exercise
        </button>
      )}
    </div>
  );
}
