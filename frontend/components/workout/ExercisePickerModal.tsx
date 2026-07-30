"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Dumbbell, Activity, Filter, Info, Plus } from "lucide-react";
import { fitxAPI } from "@/lib/api";
import { useWorkoutStore } from "@/store/useWorkoutStore";

interface ExercisePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (exercise: any) => void;
}

export function ExercisePickerModal({ isOpen, onClose, onSelect }: ExercisePickerModalProps) {
  const addExercise = useWorkoutStore((state) => state.addExercise);
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("");
  const [equipment, setEquipment] = useState("");
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      handleSearch();
    }
  }, [isOpen, query, muscle, equipment]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await fitxAPI.getExercises(query, muscle, equipment, null);
      setExercises(results || []);
    } catch (e) {
      console.error("Failed to fetch exercises", e);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header & Search */}
      <div className="pt-safe bg-slate-900 text-white pb-4">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-black">Add Exercise</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button className="p-2 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700">
            <Filter className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Filters (Simplified) */}
      <div className="flex gap-2 overflow-x-auto p-4 border-b border-slate-200 no-scrollbar shrink-0">
        <select 
          value={muscle} 
          onChange={(e) => setMuscle(e.target.value)}
          className="px-3 py-1.5 rounded-full bg-slate-100 text-xs font-bold text-slate-700 border-none focus:ring-0"
        >
          <option value="">Any Muscle</option>
          <option value="chest">Chest</option>
          <option value="back">Back</option>
          <option value="legs">Legs</option>
          <option value="shoulders">Shoulders</option>
        </select>
        
        <select 
          value={equipment} 
          onChange={(e) => setEquipment(e.target.value)}
          className="px-3 py-1.5 rounded-full bg-slate-100 text-xs font-bold text-slate-700 border-none focus:ring-0"
        >
          <option value="">Any Equipment</option>
          <option value="barbell">Barbell</option>
          <option value="dumbbell">Dumbbell</option>
          <option value="machine">Machine</option>
          <option value="bodyweight">Bodyweight</option>
        </select>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center p-8 text-slate-400">No exercises found.</div>
        ) : (
          exercises.map((ex) => (
            <div key={ex.id} className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <Dumbbell className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{ex.name}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{ex.primary_muscle} • {ex.equipment}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (onSelect) onSelect(ex);
                  addExercise(ex);
                  onClose();
                }}
                className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
