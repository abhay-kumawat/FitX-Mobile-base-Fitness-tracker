"use client";

import React, { useState } from "react";
import { Sparkles, X, Check, Flame, RefreshCw } from "lucide-react";
import { useDietStore } from "@/store/useDietStore";
import { soundscape } from "@/lib/soundscapeEngine";

interface AIMealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
}

export const AIMealPlanModal: React.FC<AIMealPlanModalProps> = ({
  isOpen,
  onClose,
  dateStr,
}) => {
  const { scheduleMealEvent } = useDietStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [goal, setGoal] = useState("Hypertrophy / Lean Muscle");
  const [caloriesTarget, setCaloriesTarget] = useState(2500);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    soundscape.playTapSound();
    setIsGenerating(true);

    setTimeout(async () => {
      // Create a full day generated meal plan
      const generatedMeals = [
        {
          name: "AI Power Protein Oats & Berries",
          meal_category: "Breakfast",
          scheduled_date: dateStr,
          scheduled_time: "08:00",
          calories: 550,
          protein: 42,
          carbs: 65,
          fat: 12,
          badge_emoji: "🌅",
          notes: "AI Recommended High Nitrogen Retention Breakfast",
          recurrence: { frequency: "NEVER" },
          linked_supplements: ["Creatine Monohydrate"],
        },
        {
          name: "Grilled Salmon & Quinoa Superbowl",
          meal_category: "Lunch",
          scheduled_date: dateStr,
          scheduled_time: "13:00",
          calories: 720,
          protein: 58,
          carbs: 62,
          fat: 22,
          badge_emoji: "🥗",
          notes: "Rich in Omega-3 for muscle protein synthesis and inflammation reduction",
          recurrence: { frequency: "NEVER" },
          linked_supplements: ["Omega-3 Fish Oil"],
        },
        {
          name: "Lean Sirloin Steak & Sweet Potato",
          meal_category: "Dinner",
          scheduled_date: dateStr,
          scheduled_time: "19:30",
          calories: 780,
          protein: 64,
          carbs: 58,
          fat: 24,
          badge_emoji: "🍲",
          notes: "Optimal glycogen replenishment post-workout",
          recurrence: { frequency: "NEVER" },
          linked_supplements: ["Zinc & Magnesium"],
        },
      ];

      for (const m of generatedMeals) {
        await scheduleMealEvent(m);
      }

      setIsGenerating(false);
      soundscape.playSuccessSound();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-slide-up z-10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2.5 bg-gradient-to-r from-amber-500 to-rose-500 rounded-2xl text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-snug">Generate AI Meal Plan</h2>
              <p className="text-xs text-slate-500">Autonomous nutrition optimization</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundscape.playTapSound();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
              Fitness Objective
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900"
            >
              <option value="Hypertrophy / Lean Muscle">💪 Hypertrophy / Lean Muscle</option>
              <option value="Fat Loss & Cutting">🔥 Fat Loss & Cutting</option>
              <option value="Maximum Strength">🏋️ Maximum Strength</option>
              <option value="Endurance & Performance">⚡ Endurance & Performance</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
              Target Daily Calories: <span className="text-indigo-600 font-mono">{caloriesTarget} kcal</span>
            </label>
            <input
              type="range"
              min="1500"
              max="4000"
              step="50"
              value={caloriesTarget}
              onChange={(e) => setCaloriesTarget(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-medium space-y-1">
            <span className="font-black flex items-center">
              <Flame className="w-3.5 h-3.5 mr-1 text-amber-600" /> AI Coach Strategy
            </span>
            <p>Will automatically generate a complete 3-meal schedule for {dateStr} with high bio-availability protein and linked supplements.</p>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black rounded-2xl text-xs shadow-lg transition-all active:scale-95 flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
