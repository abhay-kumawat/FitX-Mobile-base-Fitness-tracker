"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Flame, Plus, Trash2, Check, Sparkles, Scale } from "lucide-react";
import { useDietStore, MealCategory } from "@/store/useDietStore";
import { CATEGORY_BADGES } from "@/data/foodLibrary";
import { soundscape } from "@/lib/soundscapeEngine";
import {
  ResponsiveCard,
  AdaptiveBadge,
  FlexibleRow,
  FlexibleStack,
  AdaptiveHeading,
  AdaptiveText,
  FluidProgress,
  SmartButton,
  ResponsiveIconContainer,
} from "@/components/ui/primitives";

interface MealTodoTrackerProps {
  dateStr: string;
  onOpenSearch: (category: MealCategory) => void;
}

export const MealTodoTracker: React.FC<MealTodoTrackerProps> = ({ dateStr, onOpenSearch }) => {
  const { mealsByDate, toggleMealStatus, removeMealItem, updateMealQuantity, completedStreakDays } = useDietStore();
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

  const handleUpdateQuantity = (id: string, newMultiplier: number) => {
    soundscape.playTapSound();
    updateMealQuantity(dateStr, id, newMultiplier);
  };

  return (
    <ResponsiveCard variant="default" padding="normal" radius="3xl">
      <FlexibleStack gap="md">
        {/* Header & Streak Badge */}
        <FlexibleRow justify="between" align="center" gap="sm">
          <FlexibleRow justify="start" align="center" gap="xs" className="flex-1 min-w-0">
            <ResponsiveIconContainer size="sm" variant="emerald">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </ResponsiveIconContainer>
            <div className="min-w-0 flex-1">
              <FlexibleRow justify="start" align="center" gap="xs">
                <AdaptiveHeading level={3} className="truncate">
                  Daily Meal Tracker & Nutrition Progress
                </AdaptiveHeading>
                <AdaptiveBadge variant="emerald" size="xs">
                  {completedCount}/{meals.length} Completed ({progressPct}%)
                </AdaptiveBadge>
              </FlexibleRow>
              <AdaptiveText size="xs" variant="muted" className="mt-0.5">
                Log, adjust portions, and check off meals for scientific recalculations
              </AdaptiveText>
            </div>
          </FlexibleRow>

          <AdaptiveBadge variant="amber" size="sm" icon={<Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400 animate-pulse" />}>
            {completedStreakDays} Days Streak!
          </AdaptiveBadge>
        </FlexibleRow>

        {/* Dynamic Fluid Progress Meter */}
        <FluidProgress value={progressPct} height="sm" color="emerald" />

        {/* Category Filter Pills & Add Action Button */}
        <FlexibleRow justify="between" align="center" gap="xs">
          <FlexibleRow justify="start" align="center" gap="xs" className="flex-1 min-w-0">
            <button
              onClick={() => setFilterCategory("All")}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                filterCategory === "All"
                  ? "bg-slate-900 text-white shadow-xs"
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
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{badge?.emoji}</span>
                  <span className="whitespace-nowrap">{cat} ({count})</span>
                </button>
              );
            })}
          </FlexibleRow>

          <SmartButton
            variant="emerald"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => onOpenSearch("Breakfast")}
          >
            Add Food
          </SmartButton>
        </FlexibleRow>

        {/* Meal List Containers */}
        <FlexibleStack gap="xs">
          {filteredMeals.length === 0 ? (
            <ResponsiveCard variant="subtle" padding="compact" radius="2xl" className="text-center border-dashed">
              <AdaptiveText size="xs" variant="muted" className="font-bold">
                No meals logged for this category yet.
              </AdaptiveText>
              <button
                onClick={() => onOpenSearch("Breakfast")}
                className="mt-1 text-xs font-black text-emerald-600 hover:underline"
              >
                + Search 1,000+ Foods to Plan
              </button>
            </ResponsiveCard>
          ) : (
            filteredMeals.map((meal) => {
              const isDone = meal.status === "completed";
              const badge = CATEGORY_BADGES[meal.mealCategory] || { emoji: "🍽️", bg: "bg-slate-100 text-slate-700 border-slate-200" };
              const mult = meal.servingMultiplier || 1.0;

              return (
                <ResponsiveCard
                  key={meal.id}
                  variant={isDone ? "subtle" : "default"}
                  padding="compact"
                  radius="2xl"
                  className={`transition-all duration-200 ${isDone ? "opacity-90 border-emerald-200 bg-emerald-50/40" : "hover:border-slate-300"}`}
                >
                  <FlexibleRow justify="between" align="center" gap="sm">
                    {/* Meal Info & Status Button */}
                    <FlexibleRow justify="start" align="start" gap="xs" className="flex-1 min-w-0">
                      <button
                        onClick={() => handleToggle(meal.id)}
                        className={`mt-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                          isDone
                            ? "bg-emerald-600 text-white shadow-xs scale-105"
                            : "border-2 border-slate-300 hover:border-emerald-500 text-transparent"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <FlexibleStack gap="xs" className="flex-1 min-w-0">
                        <FlexibleRow justify="start" align="center" gap="xs">
                          <AdaptiveBadge variant="slate" size="xs">
                            {badge.emoji} {meal.mealCategory}
                          </AdaptiveBadge>

                          <span className={`text-xs sm:text-sm font-black leading-tight ${isDone ? "line-through text-slate-400" : "text-slate-900"} break-words`}>
                            {meal.name}
                          </span>

                          {meal.scheduledTime && (
                            <span className="text-[10px] font-mono text-slate-400 flex items-center shrink-0">
                              <Clock className="w-3 h-3 mr-0.5 inline" /> {meal.scheduledTime}
                            </span>
                          )}
                        </FlexibleRow>

                        {/* Macro details */}
                        <FlexibleRow justify="start" align="center" gap="xs" className="text-[11px] font-mono text-slate-600">
                          <span className="font-extrabold text-amber-700">{meal.calories} kcal</span>
                          <span>P: <strong className="text-emerald-700">{meal.protein}g</strong></span>
                          <span>C: <strong className="text-blue-700">{meal.carbs}g</strong></span>
                          <span>F: <strong className="text-purple-700">{meal.fat}g</strong></span>
                        </FlexibleRow>

                        {isDone && meal.completedAt && (
                          <AdaptiveText size="xs" variant="accent" className="flex items-center text-emerald-700">
                            <Sparkles className="w-3 h-3 mr-1 inline shrink-0" /> Logged at {meal.completedAt}
                          </AdaptiveText>
                        )}
                      </FlexibleStack>
                    </FlexibleRow>

                    {/* Portion Multiplier Controls & Actions */}
                    <FlexibleRow justify="end" align="center" gap="xs" className="shrink-0">
                      <div className="flex items-center space-x-1 font-mono bg-slate-50 border border-slate-200 rounded-xl p-1">
                        <Scale className="w-3 h-3 text-slate-400 ml-0.5" />
                        {[0.5, 1.0, 1.5, 2.0].map((mVal) => (
                          <button
                            key={mVal}
                            onClick={() => handleUpdateQuantity(meal.id, mVal)}
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded-lg transition-all ${
                              mult === mVal
                                ? "bg-slate-900 text-white shadow-2xs"
                                : "text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {mVal}x
                          </button>
                        ))}
                      </div>

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
                    </FlexibleRow>
                  </FlexibleRow>
                </ResponsiveCard>
              );
            })
          )}
        </FlexibleStack>
      </FlexibleStack>
    </ResponsiveCard>
  );
};
