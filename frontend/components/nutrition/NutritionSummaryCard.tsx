"use client";

import React from "react";
import { PieChart, Target, Flame, Activity, Zap } from "lucide-react";
import { useDietStore } from "@/store/useDietStore";
import {
  ResponsiveCard,
  MetricCard,
  AdaptiveBadge,
  FlexibleRow,
  FlexibleGrid,
  FlexibleStack,
  AdaptiveHeading,
  AdaptiveText,
  AdaptiveNumber,
  ResponsiveIconContainer,
} from "@/components/ui/primitives";

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

  const fiberPct = Math.min(100, Math.round(((totals.fiber || 0) / targetFiber) * 100));

  // Calculate Macro Ratios (% of total macro calories)
  const proteinCals = protein * 4;
  const carbCals = carbs * 4;
  const fatCals = fat * 9;
  const totalMacroCals = Math.max(1, proteinCals + carbCals + fatCals);

  const proteinRatio = Math.round((proteinCals / totalMacroCals) * 100);
  const carbRatio = Math.round((carbCals / totalMacroCals) * 100);
  const fatRatio = Math.round((fatCals / totalMacroCals) * 100);

  // Determine Goal Alignment Status
  let goalStatus = "Optimal Hypertrophy Match";
  let goalVariant: "emerald" | "amber" | "purple" = "emerald";

  if (calories < targetCalories - 400) {
    goalStatus = "Fat Loss Deficit (Aggressive)";
    goalVariant = "amber";
  } else if (calories > targetCalories + 300) {
    goalStatus = "Lean Bulking Surplus";
    goalVariant = "purple";
  }

  const remainingCals = targetCalories - calories;

  return (
    <ResponsiveCard variant="default" padding="normal" radius="3xl">
      <FlexibleStack gap="md">
        {/* Header & Alignment Badge */}
        <FlexibleRow justify="between" align="center" gap="sm">
          <FlexibleRow justify="start" align="center" gap="xs" className="flex-1 min-w-0">
            <ResponsiveIconContainer size="sm" variant="emerald">
              <PieChart className="w-4 h-4 text-emerald-600" />
            </ResponsiveIconContainer>
            <div className="min-w-0 flex-1">
              <FlexibleRow justify="start" align="center" gap="xs">
                <AdaptiveHeading level={3} className="truncate">
                  Macro & Micronutrient Intelligence
                </AdaptiveHeading>
                <AdaptiveBadge variant="emerald" size="xs">
                  Live Engine
                </AdaptiveBadge>
              </FlexibleRow>
              <AdaptiveText size="xs" variant="muted" className="mt-0.5">
                Real-time scientific metabolic intake vs baseline targets
              </AdaptiveText>
            </div>
          </FlexibleRow>

          <AdaptiveBadge variant={goalVariant} size="sm" icon={<Target className="w-3.5 h-3.5" />}>
            {goalStatus}
          </AdaptiveBadge>
        </FlexibleRow>

        {/* Main Calories Intake Overview Banner */}
        <ResponsiveCard variant="hero" padding="compact" radius="2xl" elevation="none">
          <FlexibleRow justify="between" align="center" gap="md">
            <FlexibleStack gap="xs" className="flex-1 min-w-0">
              <AdaptiveText size="xs" variant="muted" className="uppercase tracking-widest font-bold text-slate-400">
                Total Daily Intake
              </AdaptiveText>
              <FlexibleRow justify="start" align="baseline" gap="xs">
                <AdaptiveNumber value={calories} color="emerald" size="xl" />
                <span className="text-sm font-mono font-bold text-slate-300">
                  / {targetCalories} kcal
                </span>
              </FlexibleRow>
              <AdaptiveText size="xs" variant="accent" className="text-emerald-300 font-bold">
                {remainingCals > 0
                  ? `${remainingCals} kcal remaining to reach target`
                  : `${Math.abs(remainingCals)} kcal surplus logged today`}
              </AdaptiveText>
            </FlexibleStack>

            {/* Science Match Badges */}
            <FlexibleRow justify="end" align="center" gap="xs" className="shrink-0">
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1.5 text-center min-w-[85px]">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">HYPERTROPHY</span>
                <span className="text-xs font-black font-mono text-emerald-400">
                  {totals.hypertrophyMatchPct || 88}%
                </span>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1.5 text-center min-w-[85px]">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">FAT LOSS</span>
                <span className="text-xs font-black font-mono text-amber-400">
                  {totals.fatLossMatchPct || 92}%
                </span>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1.5 text-center min-w-[85px]">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">SCORE</span>
                <span className="text-xs font-black font-mono text-cyan-400">
                  {totals.nutritionScore || 88}/100
                </span>
              </div>
            </FlexibleRow>
          </FlexibleRow>
        </ResponsiveCard>

        {/* Adaptive Metric Cards Grid (Protein, Carbs, Fats) */}
        <FlexibleGrid minItemWidth={160} gap="sm">
          <MetricCard
            label="Protein"
            value={protein}
            target={targetProtein}
            unit="g"
            accentColor="emerald"
            ratioBadge={`${proteinRatio}% kcal`}
            icon={<Zap className="w-3.5 h-3.5 text-emerald-600" />}
            subLabel={`${Math.max(0, targetProtein - protein)}g left`}
          />

          <MetricCard
            label="Carbs"
            value={carbs}
            target={targetCarbs}
            unit="g"
            accentColor="blue"
            ratioBadge={`${carbRatio}% kcal`}
            icon={<Flame className="w-3.5 h-3.5 text-blue-600" />}
            subLabel={`${Math.max(0, targetCarbs - carbs)}g left`}
          />

          <MetricCard
            label="Fats"
            value={fat}
            target={targetFat}
            unit="g"
            accentColor="purple"
            ratioBadge={`${fatRatio}% kcal`}
            icon={<Activity className="w-3.5 h-3.5 text-purple-600" />}
            subLabel={`${Math.max(0, targetFat - fat)}g left`}
          />
        </FlexibleGrid>

        {/* Sub-micronutrient Breakdown Bar */}
        <FlexibleGrid minItemWidth={120} gap="xs">
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 text-center min-w-0">
            <span className="text-[9.5px] font-bold text-slate-500 block uppercase truncate">DIETARY FIBER</span>
            <span className="font-black text-slate-900 block text-xs sm:text-sm mt-0.5 font-mono">{totals.fiber}g / {targetFiber}g</span>
            <span className="text-[9px] font-bold text-emerald-700 block">{fiberPct}% met</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 text-center min-w-0">
            <span className="text-[9.5px] font-bold text-slate-500 block uppercase truncate">NET CARBS</span>
            <span className="font-black text-slate-900 block text-xs sm:text-sm mt-0.5 font-mono">{totals.netCarbs}g</span>
            <span className="text-[9px] font-bold text-slate-500 block">Excl. Fiber</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 text-center min-w-0">
            <span className="text-[9.5px] font-bold text-slate-500 block uppercase truncate">SODIUM</span>
            <span className="font-black text-slate-900 block text-xs sm:text-sm mt-0.5 font-mono">{totals.sodiumMg} mg</span>
            <span className="text-[9px] font-bold text-slate-500 block">Electrolyte</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 text-center min-w-0">
            <span className="text-[9.5px] font-bold text-slate-500 block uppercase truncate">SUGAR</span>
            <span className="font-black text-slate-900 block text-xs sm:text-sm mt-0.5 font-mono">{totals.sugar}g</span>
            <span className="text-[9px] font-bold text-slate-500 block">Natural/Added</span>
          </div>
        </FlexibleGrid>
      </FlexibleStack>
    </ResponsiveCard>
  );
};
