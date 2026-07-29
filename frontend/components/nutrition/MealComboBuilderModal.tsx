"use client";

import React, { useState } from "react";
import { Layers, X, Plus, Sparkles, Check } from "lucide-react";
import { useDietStore } from "@/store/useDietStore";
import { soundscape } from "@/lib/soundscapeEngine";

interface MealComboBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
}

export const MealComboBuilderModal: React.FC<MealComboBuilderModalProps> = ({
  isOpen,
  onClose,
  dateStr,
}) => {
  const { allFoods, addMealItem, combos, addMealCombo } = useDietStore();
  const [comboName, setComboName] = useState("");
  const [selectedFoodIds, setSelectedFoodIds] = useState<{ foodId: string; quantity: number }[]>([]);

  if (!isOpen) return null;

  const foods = allFoods();

  const handleToggleFood = (foodId: string) => {
    soundscape.playTapSound();
    if (selectedFoodIds.some((item) => item.foodId === foodId)) {
      setSelectedFoodIds(selectedFoodIds.filter((item) => item.foodId !== foodId));
    } else {
      setSelectedFoodIds([...selectedFoodIds, { foodId, quantity: 1.0 }]);
    }
  };

  const handleQuantityChange = (foodId: string, quantity: number) => {
    setSelectedFoodIds(
      selectedFoodIds.map((item) => (item.foodId === foodId ? { ...item, quantity } : item))
    );
  };

  // Calculate combo totals
  const selectedFoodDetails = selectedFoodIds.map((item) => {
    const food = foods.find((f) => f.id === item.foodId);
    return {
      food,
      quantity: item.quantity,
      cal: food ? Math.round(food.calories * item.quantity) : 0,
      p: food ? Math.round(food.protein * item.quantity) : 0,
      c: food ? Math.round(food.carbs * item.quantity) : 0,
      f: food ? Math.round(food.fat * item.quantity) : 0,
    };
  });

  const totalCal = selectedFoodDetails.reduce((sum, i) => sum + i.cal, 0);
  const totalP = selectedFoodDetails.reduce((sum, i) => sum + i.p, 0);
  const totalC = selectedFoodDetails.reduce((sum, i) => sum + i.c, 0);
  const totalF = selectedFoodDetails.reduce((sum, i) => sum + i.f, 0);

  const handleSaveCombo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comboName.trim() || selectedFoodIds.length === 0) return;

    soundscape.playTapSound();

    addMealCombo({
      name: comboName,
      items: selectedFoodIds,
      totalCalories: totalCal,
      totalProtein: totalP,
      totalCarbs: totalC,
      totalFat: totalF,
      badgeEmoji: "🥣",
    });

    // Automatically log this combo as a meal today
    addMealItem(dateStr, {
      foodId: `combo_${Date.now()}`,
      name: comboName,
      mealCategory: "Breakfast",
      servingMultiplier: 1.0,
      calories: totalCal,
      protein: totalP,
      carbs: totalC,
      fiber: 6,
      fat: totalF,
      sodiumMg: 150,
      potassiumMg: 350,
      badgeEmoji: "🥣",
      dateStr,
    });

    onClose();
  };

  const handleLogExistingCombo = (combo: (typeof combos)[0]) => {
    soundscape.playTapSound();
    addMealItem(dateStr, {
      foodId: combo.id,
      name: combo.name,
      mealCategory: "Breakfast",
      servingMultiplier: 1.0,
      calories: combo.totalCalories,
      protein: combo.totalProtein,
      carbs: combo.totalCarbs,
      fiber: 5,
      fat: combo.totalFat,
      sodiumMg: 150,
      potassiumMg: 350,
      badgeEmoji: combo.badgeEmoji,
      dateStr,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-xl bg-white border-t-2 sm:border-2 border-slate-300 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-base font-black text-slate-900 flex items-center">
            <Layers className="w-5 h-5 mr-1.5 text-amber-500" /> Smart Recipe & Meal Combo Builder
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Combos */}
        {combos.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Saved Preset Recipes
            </span>
            <div className="flex flex-wrap gap-2">
              {combos.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleLogExistingCombo(c)}
                  className="px-3 py-1.5 bg-amber-50 border border-amber-300 hover:bg-amber-500 hover:text-white rounded-xl text-xs font-bold text-amber-900 flex items-center space-x-1.5 transition-all shadow-2xs"
                >
                  <span>{c.badgeEmoji}</span>
                  <span>{c.name} ({c.totalCalories} kcal)</span>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form to build new combo */}
        <form onSubmit={handleSaveCombo} className="space-y-3 overflow-y-auto flex-1 pr-1">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Combo Recipe Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Post-Workout Anabolic Shake & Oats"
              value={comboName}
              onChange={(e) => setComboName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Select Ingredients to Combine:</label>
            <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-200 rounded-2xl p-2 bg-slate-50">
              {foods.map((food) => {
                const isSelected = selectedFoodIds.some((i) => i.foodId === food.id);
                return (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => handleToggleFood(food.id)}
                    className={`w-full p-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-amber-100 border border-amber-300 text-amber-900 font-bold"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{food.badgeEmoji} {food.name} ({food.calories} kcal)</span>
                    {isSelected ? <Check className="w-4 h-4 text-amber-700" /> : <Plus className="w-4 h-4 text-slate-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Combo Totals Preview */}
          {selectedFoodIds.length > 0 && (
            <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-1 font-mono text-xs">
              <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                Calculated Recipe Totals ({selectedFoodIds.length} items)
              </span>
              <div className="flex items-center space-x-4">
                <span className="text-amber-300 font-black">{totalCal} kcal</span>
                <span>P: {totalP}g</span>
                <span>C: {totalC}g</span>
                <span>F: {totalF}g</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={selectedFoodIds.length === 0}
            className="w-full py-3 bg-amber-600 text-white rounded-2xl text-xs font-black hover:bg-amber-700 disabled:opacity-50 transition-all shadow-md active:scale-98"
          >
            ✨ Create Recipe & Add To Today's Plan
          </button>
        </form>
      </div>
    </div>
  );
};
