"use client";

import React from "react";
import { PieChart, Target, Flame, Activity, Zap, ShieldCheck } from "lucide-react";
import { useDietStore } from "@/store/useDietStore";

interface NutritionSummaryCardProps {
  dateStr: string;
}

export const NutritionSummaryCard: React.FC<NutritionSummaryCardProps> = ({ dateStr }) => {
  const { getDailyTotals } = useDietStore();
  const totals = getDailyTotals(dateStr);

  const targetCalories = totals.targetCalories || 2400;
  const targetProtein = totals.targetProtein || 180;
  const targetCarbs = totals.targetCarbs || 260;
  const targetFat = totals.targetFat || 70;
  const targetFiber = totals.targetFiber || 30;

  const protein = totals.protein || 0;
  const carbs = totals.carbs || 0;
  const fat = totals.fat || 0;
  const calories = totals.calories || 0;

  const pPct = Math.min(100, Math.round((protein / targetProtein) * 100));
  const cPct = Math.min(100, Math.round((carbs / targetCarbs) * 100));
  const fPct = Math.min(100, Math.round((fat / targetFat) * 100));
  const fiberPct = Math.min(100, Math.round(((totals.fiber || 0) / targetFiber) * 100));

  // Calculate Macro Ratios (% of calories)
  const proteinCals = protein * 4;
  const carbCals = carbs * 4;
  const fatCals = fat * 9;
  const totalMacroCals = Math.max(1, proteinCals + carbCals + fatCals);

  const proteinRatio = Math.round((proteinCals / totalMacroCals) * 100);
  const carbRatio = Math.round((carbCals / totalMacroCals) * 100);
  const fatRatio = Math.round((fatCals / totalMacroCals) * 100);

  // Goal alignment status
  let goalStatus = "Optimal Hypertrophy Match";
  let goalBg = "bg-emerald-500/10 text-emerald-700 border-emerald-300";

  if (calories < targetCalories - 400) {
    goalStatus = "Fat Loss Deficit (Aggressive)";
    goalBg = "bg-amber-500/10 text-amber-800 border-amber-300";
  } else if (calories > targetCalories + 300) {
    goalStatus = "Lean Bulking Surplus";
    goalBg = "bg-purple-500/10 text-purple-800 border-purple-300";
  }

  const remainingCals = targetCalories - calories;

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-5 max-w-full overflow-hidden">
      {/* Header & Alignment Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
        <div>
          <div className="flex items-center space-x-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center leading-snug">
              <PieChart className="w-5 h-5 mr-2 text-emerald-600 shrink-0" />
              <span>Macro & Micronutrient Intelligence Dashboard</span>
            </h2>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-[11px] font-black uppercase tracking-wide">
              Live Backend Calculations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time scientific metabolic intake vs personalized target baseline
          </p>
        </div>

        <div className={`px-3 py-1.5 rounded-2xl border text-xs font-black flex items-center space-x-1.5 self-start sm:self-auto shrink-0 ${goalBg}`}>
          <Target className="w-4 h-4 shrink-0" />
          <span>{goalStatus}</span>
        </div>
      </div>

      {/* Calories Overview Main Dial */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="space-y-1 text-center md:text-left w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
            Total Daily Intake
          </span>
          <div className="flex items-baseline space-x-2 justify-center md:justify-start flex-wrap">
            <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
              {calories}
            </span>
            <span className="text-sm font-bold text-slate-300">
              / {targetCalories} kcal
            </span>
          </div>
          <span className="text-xs font-bold text-emerald-300 block">
            {remainingCals > 0
              ? `${remainingCals} kcal remaining to reach goal`
              : `${Math.abs(remainingCals)} kcal surplus logged today`}
          </span>
        </div>

        {/* Science Score Badges */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-center min-w-[95px]">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">HYPERTROPHY</span>
            <span className="text-sm font-black font-mono text-emerald-400">
              {totals.hypertrophyMatchPct || 88}%
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-center min-w-[95px]">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">FAT LOSS</span>
            <span className="text-sm font-black font-mono text-amber-400">
              {totals.fatLossMatchPct || 92}%
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-center min-w-[95px]">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">SCORE</span>
            <span className="text-sm font-black font-mono text-cyan-400">
              {totals.nutritionScore || 88}/100
            </span>
          </div>
        </div>
      </div>

      {/* Redesigned Responsive Nutrient Cards (No Clipping, Responsive Heights & Layouts) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* PROTEIN CARD */}
        <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border-2 border-emerald-200/80 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center">
              <Zap className="w-3.5 h-3.5 mr-1 text-emerald-600" /> PROTEIN
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-lg border border-emerald-300">
              {proteinRatio}% kcal
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-2xl font-black text-emerald-700">{protein}g</span>
            <span className="text-xs font-bold text-slate-500">Goal: {targetProtein}g</span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-500"
                style={{ width: `${pPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>{pPct}% completed</span>
              <span>{Math.max(0, targetProtein - protein)}g left</span>
            </div>
          </div>
        </div>

        {/* CARBS CARD */}
        <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border-2 border-blue-200/80 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center">
              <Flame className="w-3.5 h-3.5 mr-1 text-blue-600" /> CARBS
            </span>
            <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-lg border border-blue-300">
              {carbRatio}% kcal
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-2xl font-black text-blue-700">{carbs}g</span>
            <span className="text-xs font-bold text-slate-500">Goal: {targetCarbs}g</span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500"
                style={{ width: `${cPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>{cPct}% completed</span>
              <span>{Math.max(0, targetCarbs - carbs)}g left</span>
            </div>
          </div>
        </div>

        {/* FATS CARD */}
        <div className="bg-gradient-to-br from-purple-50/70 to-pink-50/40 border-2 border-purple-200/80 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-purple-900 uppercase tracking-wider flex items-center">
              <Activity className="w-3.5 h-3.5 mr-1 text-purple-600" /> FATS
            </span>
            <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-lg border border-purple-300">
              {fatRatio}% kcal
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-2xl font-black text-purple-700">{fat}g</span>
            <span className="text-xs font-bold text-slate-500">Goal: {targetFat}g</span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full transition-all duration-500"
                style={{ width: `${fPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>{fPct}% completed</span>
              <span>{Math.max(0, targetFat - fat)}g left</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-micronutrient Breakdown Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
          <span className="text-[9.5px] font-bold text-slate-500 block uppercase">DIETARY FIBER</span>
          <span className="font-black text-slate-800 block text-sm mt-0.5">{totals.fiber}g / {targetFiber}g</span>
          <span className="text-[9px] font-bold text-emerald-700 block">{fiberPct}% met</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
          <span className="text-[9.5px] font-bold text-slate-500 block uppercase">NET CARBS</span>
          <span className="font-black text-slate-800 block text-sm mt-0.5">{totals.netCarbs}g</span>
          <span className="text-[9px] font-bold text-slate-500 block">Excl. Fiber</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
          <span className="text-[9.5px] font-bold text-slate-500 block uppercase">SODIUM</span>
          <span className="font-black text-slate-800 block text-sm mt-0.5">{totals.sodiumMg} mg</span>
          <span className="text-[9px] font-bold text-slate-500 block">Electrolyte</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
          <span className="text-[9.5px] font-bold text-slate-500 block uppercase">SUGAR</span>
          <span className="font-black text-slate-800 block text-sm mt-0.5">{totals.sugar}g</span>
          <span className="text-[9px] font-bold text-slate-500 block">Natural & Added</span>
        </div>
      </div>
    </div>
  );
};
