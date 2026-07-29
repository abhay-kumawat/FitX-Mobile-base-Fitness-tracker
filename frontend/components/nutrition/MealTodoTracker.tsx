"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Flame, Plus, Trash2, Check, Sparkles } from "lucide-react";
import { useDietStore, MealCategory, TaskStatus } from "@/store/useDietStore";
import { CATEGORY_BADGES } from "@/data/foodLibrary";
import { soundscape } from "@/lib/soundscapeEngine";

interface MealTodoTrackerProps {
  dateStr: string;
  onOpenSearch: (category: MealCategory) => void;
}

export const MealTodoTracker: React.FC<MealTodoTrackerProps> = ({ dateStr, onOpenSearch }) => {
  const { mealsByDate, toggleMealStatus, removeMealItem, completedStreakDays } = useDietStore();
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const meals = mealsByDate[dateStr] || [];
  const categories: MealCategory[] = ["Breakfast", "Lunch", "Dinner", "Snacks"];

  const filteredMeals = filterCategory === "All"
    ? meals
    : meals.filter((m) => m.mealCategory === filterCategory);

  const completedCount = meals.filter((m) => m.status === "completed").length;
  const progressPct = meals.length > 0 ? Math.round((completedCount / meals.length) * 100) : 0;

  const handleToggle = (id: string) => {
    soundscape.playTapSound();
    toggleMealStatus(dateStr, id);
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 max-w-full overflow-hidden">
      {/* Header & Streak Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center leading-snug">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 text-emerald-600 shrink-0" />
              <span>Meal Checklist & Todo Tracker</span>
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
              {completedCount}/{meals.length} Done ({progressPct}%)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Check off planned meals to log macros & keep your streak alive</p>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300/60 rounded-2xl px-3 py-1.5 self-start sm:self-auto shrink-0">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0 animate-pulse" />
          <span className="text-xs font-black text-amber-900 whitespace-nowrap">
            {completedStreakDays} Days 100% Streak!
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Category Tabs & Quick Add Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterCategory("All")}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              filterCategory === "All"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({meals.length})
          </button>
          {categories.map((cat) => {
            const count = meals.filter((m) => m.mealCategory === cat).length;
            const badge = CATEGORY_BADGES[cat];
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all ${
                  filterCategory === cat
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{badge?.emoji}</span>
                <span className="whitespace-nowrap">{cat} ({count})</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onOpenSearch("Breakfast")}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-extrabold flex items-center space-x-1 shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">Add Food</span>
        </button>
      </div>

      {/* Meals Checkable Todo List */}
      <div className="space-y-2.5">
        {filteredMeals.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
            <p className="text-xs font-bold text-slate-500">No meals logged for this category yet.</p>
            <button
              onClick={() => onOpenSearch("Breakfast")}
              className="mt-2 text-xs font-extrabold text-emerald-600 hover:underline"
            >
              + Search & Add Foods to Plan
            </button>
          </div>
        ) : (
          filteredMeals.map((meal) => {
            const isDone = meal.status === "completed";
            const badge = CATEGORY_BADGES[meal.mealCategory] || { emoji: "🍽️", bg: "bg-slate-100 text-slate-700 border-slate-200" };

            return (
              <div
                key={meal.id}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-2 max-w-full overflow-hidden ${
                  isDone
                    ? "bg-emerald-50/60 border-emerald-200 opacity-90 shadow-none"
                    : "bg-white border-slate-200 shadow-sm hover:border-slate-300"
                }`}
              >
                <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                  {/* Todo Checkbox Button */}
                  <button
                    onClick={() => handleToggle(meal.id)}
                    className={`mt-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                      isDone
                        ? "bg-emerald-600 text-white shadow-sm scale-105"
                        : "border-2 border-slate-300 hover:border-emerald-500 text-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-lg border shrink-0 ${badge.bg}`}>
                        {badge.emoji} {meal.mealCategory}
                      </span>
                      <span className={`text-xs sm:text-sm font-black ${isDone ? "line-through text-slate-400" : "text-slate-900"} truncate`}>
                        {meal.name}
                      </span>
                      {meal.scheduledTime && (
                        <span className="text-[10px] font-mono text-slate-400 flex items-center shrink-0">
                          <Clock className="w-3 h-3 mr-0.5 inline" /> {meal.scheduledTime}
                        </span>
                      )}
                    </div>

                    {/* Macro details */}
                    <div className="flex items-center space-x-2 text-[11px] font-mono mt-1 text-slate-600 flex-wrap">
                      <span className="font-extrabold text-amber-700">{meal.calories} kcal</span>
                      <span>P: <strong className="text-emerald-700">{meal.protein}g</strong></span>
                      <span>C: <strong className="text-blue-700">{meal.carbs}g</strong></span>
                      <span>F: <strong className="text-purple-700">{meal.fat}g</strong></span>
                    </div>

                    {isDone && meal.completedAt && (
                      <span className="text-[10px] text-emerald-700 font-bold mt-1 block flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 inline shrink-0" /> Checked off at {meal.completedAt}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => {
                    soundscape.playTapSound();
                    removeMealItem(dateStr, meal.id);
                  }}
                  className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 shrink-0"
                  title="Remove meal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
