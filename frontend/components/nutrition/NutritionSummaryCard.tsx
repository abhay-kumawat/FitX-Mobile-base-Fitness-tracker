"use client";

import React from "react";
import { PieChart, Target } from "lucide-react";
import { useDietStore } from "@/store/useDietStore";

interface NutritionSummaryCardProps {
  dateStr: string;
}

export const NutritionSummaryCard: React.FC<NutritionSummaryCardProps> = ({ dateStr }) => {
  const { getDailyTotals } = useDietStore();
  const totals = getDailyTotals(dateStr);

  const targetCalories = 2400;
  const targetProtein = 180; // grams
  const targetCarbs = 260; // grams
  const targetFat = 70; // grams
  const targetFiber = 30; // grams

  const pPct = Math.min(100, Math.round((totals.protein / targetProtein) * 100));
  const fiberPct = Math.min(100, Math.round((totals.fiber / targetFiber) * 100));

  // Determine Goal Alignment
  let goalStatus = "Optimal Hypertrophy Match";
  let goalBg = "bg-emerald-100 text-emerald-800 border-emerald-300";

  if (totals.calories < targetCalories - 400) {
    goalStatus = "Fat Loss Deficit (Aggressive)";
    goalBg = "bg-amber-100 text-amber-800 border-amber-300";
  } else if (totals.calories > targetCalories + 300) {
    goalStatus = "Lean Bulking Surplus";
    goalBg = "bg-purple-100 text-purple-800 border-purple-300";
  }

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center leading-snug">
            <PieChart className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 text-emerald-600 shrink-0" />
            <span>Macro & Micronutrient Dashboard</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Live scientific breakdown vs daily targets</p>
        </div>

        <div className={`px-2.5 py-1 rounded-2xl border text-[11px] sm:text-xs font-black flex items-center space-x-1 self-start sm:self-auto shrink-0 ${goalBg}`}>
          <Target className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">{goalStatus}</span>
        </div>
      </div>

      {/* Calories Overview Dial */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="space-y-0.5 text-center sm:text-left w-full sm:w-auto">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Intake</span>
          <div className="flex items-baseline space-x-1 justify-center sm:justify-start">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">{totals.calories}</span>
            <span className="text-xs font-bold text-slate-500">/ {targetCalories} kcal</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 block">
            {targetCalories - totals.calories > 0
              ? `${targetCalories - totals.calories} kcal remaining to goal`
              : `${totals.calories - targetCalories} kcal surplus logged`}
          </span>
        </div>

        {/* Macros Mini Bar Cards */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full sm:w-auto font-mono">
          <div className="bg-white p-2 border border-slate-200 rounded-xl text-center shadow-2xs">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">PROTEIN</span>
            <span className="text-xs sm:text-sm font-black text-emerald-600">{totals.protein}g</span>
            <span className="text-[8.5px] text-slate-400 block font-sans">Goal {targetProtein}g</span>
          </div>

          <div className="bg-white p-2 border border-slate-200 rounded-xl text-center shadow-2xs">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">CARBS</span>
            <span className="text-xs sm:text-sm font-black text-blue-600">{totals.carbs}g</span>
            <span className="text-[8.5px] text-slate-400 block font-sans">Goal {targetCarbs}g</span>
          </div>

          <div className="bg-white p-2 border border-slate-200 rounded-xl text-center shadow-2xs">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">FATS</span>
            <span className="text-xs sm:text-sm font-black text-purple-600">{totals.fat}g</span>
            <span className="text-[8.5px] text-slate-400 block font-sans">Goal {targetFat}g</span>
          </div>
        </div>
      </div>

      {/* Progress Bars for Micronutrients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Fiber Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold font-mono">
            <span className="text-slate-700">Dietary Fiber</span>
            <span className="text-emerald-700">{totals.fiber}g / {targetFiber}g ({fiberPct}%)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${fiberPct}%` }} />
          </div>
        </div>

        {/* Protein Target Gauge */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold font-mono">
            <span className="text-slate-700">Protein Goal</span>
            <span className="text-emerald-700">{totals.protein}g / {targetProtein}g ({pPct}%)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full transition-all duration-500" style={{ width: `${pPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
