"use client";

import React, { useState } from "react";
import { Search, X, Plus, Sparkles, SlidersHorizontal, ShieldCheck } from "lucide-react";
import { useDietStore, MealCategory } from "@/store/useDietStore";
import { ScientificFoodItem } from "@/data/foodLibrary";
import { soundscape } from "@/lib/soundscapeEngine";

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  defaultCategory?: MealCategory;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  defaultCategory = "Breakfast",
}) => {
  const { allFoods, addMealItem, addCustomFood } = useDietStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedMealCategory, setSelectedMealCategory] = useState<MealCategory>(defaultCategory);
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [activeTab, setActiveTab] = useState<"search" | "custom">("search");

  // Custom food form state
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState<ScientificFoodItem["category"]>("Proteins");
  const [customServingUnit, setCustomServingUnit] = useState("100g");
  const [customCalories, setCustomCalories] = useState<number>(150);
  const [customProtein, setCustomProtein] = useState<number>(20);
  const [customCarbs, setCustomCarbs] = useState<number>(10);
  const [customFat, setCustomFat] = useState<number>(5);
  const [customFiber, setCustomFiber] = useState<number>(2);

  if (!isOpen) return null;

  const foods = allFoods();

  const categories = [
    "All",
    "Proteins",
    "Carbs & Grains",
    "Vegetables & Greens",
    "Healthy Fats & Nuts",
    "Dairy & Alternatives",
    "Supplements & Meds",
  ];

  const filteredFoods = foods.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddFood = (food: ScientificFoodItem) => {
    soundscape.playTapSound();

    const scaledCalories = Math.round(food.calories * multiplier);
    const scaledProtein = Math.round(food.protein * multiplier);
    const scaledCarbs = Math.round(food.carbs * multiplier);
    const scaledFiber = Math.round(food.fiber * multiplier);
    const scaledFat = Math.round(food.fat * multiplier);

    addMealItem(dateStr, {
      foodId: food.id,
      name: food.name,
      mealCategory: selectedMealCategory,
      servingMultiplier: multiplier,
      calories: scaledCalories,
      protein: scaledProtein,
      carbs: scaledCarbs,
      fiber: scaledFiber,
      fat: scaledFat,
      sodiumMg: Math.round(food.sodiumMg * multiplier),
      potassiumMg: Math.round(food.potassiumMg * multiplier),
      badgeEmoji: food.badgeEmoji,
      dateStr,
    });

    onClose();
  };

  const handleCreateCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    soundscape.playTapSound();

    addCustomFood({
      name: customName,
      category: customCategory,
      servingUnit: customServingUnit,
      servingSizeGrams: 100,
      calories: Number(customCalories),
      protein: Number(customProtein),
      carbs: Number(customCarbs),
      netCarbs: Math.max(0, Number(customCarbs) - Number(customFiber)),
      fiber: Number(customFiber),
      fat: Number(customFat),
      satFat: 1.0,
      sodiumMg: 50,
      potassiumMg: 150,
      calciumMg: 20,
      ironMg: 0.5,
      badgeEmoji: "✨",
      badgeBg: "bg-purple-100 text-purple-700 border-purple-200",
    });

    // Reset and switch to search
    setSearchQuery(customName);
    setActiveTab("search");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-2xl bg-white border-t-2 sm:border-2 border-slate-300 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-2xl max-h-[88vh] flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center truncate">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 text-emerald-600 shrink-0" /> <span className="truncate">Scientific Food Library & Search</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors rounded-lg shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("search")}
            className={`pb-2.5 px-3 sm:px-4 text-xs font-black border-b-2 transition-all whitespace-nowrap ${
              activeTab === "search"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            🔍 Search Database ({foods.length})
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`pb-2.5 px-3 sm:px-4 text-xs font-black border-b-2 transition-all whitespace-nowrap ${
              activeTab === "custom"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            ✨ Custom Food Creation
          </button>
        </div>

        {activeTab === "search" ? (
          <>
            {/* Search Input & Serving Multiplier */}
            <div className="space-y-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search oats, chicken, salmon, protein powder..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Meal Slot & Multiplier Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 min-w-0">
                <div className="flex items-center space-x-2 min-w-0">
                  <label className="text-[11px] font-bold text-slate-600 shrink-0">Assign To:</label>
                  <select
                    value={selectedMealCategory}
                    onChange={(e) => setSelectedMealCategory(e.target.value as MealCategory)}
                    className="p-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 shrink-0"
                  >
                    <option value="Breakfast">🌅 Breakfast</option>
                    <option value="Lunch">🥗 Lunch</option>
                    <option value="Dinner">🍲 Dinner</option>
                    <option value="Snacks">🍎 Snacks</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <label className="text-[11px] font-bold text-slate-600 shrink-0">Portion:</label>
                  <div className="flex items-center space-x-1 font-mono">
                    {[0.5, 1.0, 1.5, 2.0].map((m) => (
                      <button
                        key={m}
                        onClick={() => setMultiplier(m)}
                        className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                          multiplier === m
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {m}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                      selectedCategory === cat
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Items List */}
            <div className="overflow-y-auto flex-1 min-h-0 space-y-2 pr-1">
              {filteredFoods.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-slate-500">No matching food item found.</p>
                  <button
                    onClick={() => setActiveTab("custom")}
                    className="text-xs font-extrabold text-emerald-600 hover:underline"
                  >
                    + Add "{searchQuery}" as a Custom Food
                  </button>
                </div>
              ) : (
                filteredFoods.map((food) => (
                  <div
                    key={food.id}
                    className="p-3 bg-white border border-slate-200 rounded-2xl hover:border-emerald-400 transition-all flex items-center justify-between gap-2 group shadow-sm hover:shadow min-w-0"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg border shrink-0 ${food.badgeBg || "bg-slate-100 border-slate-200"}`}>
                        {food.badgeEmoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="text-xs font-black text-slate-900 truncate">{food.name}</span>
                          {food.isCustom && (
                            <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-purple-100 text-purple-700 rounded border border-purple-200 shrink-0">
                              Custom
                            </span>
                          )}
                        </div>
                        <span className="text-[10.5px] text-slate-400 font-mono block truncate">
                          Base: {food.servingUnit} ({food.category})
                        </span>
                        <div className="flex items-center space-x-2 text-[11px] font-mono mt-0.5 flex-wrap">
                          <span className="font-extrabold text-amber-600">
                            {Math.round(food.calories * multiplier)} kcal
                          </span>
                          <span className="text-emerald-700">P: {Math.round(food.protein * multiplier)}g</span>
                          <span className="text-blue-700">C: {Math.round(food.carbs * multiplier)}g</span>
                          <span className="text-purple-700">F: {Math.round(food.fat * multiplier)}g</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddFood(food)}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-black hover:bg-emerald-600 hover:text-white transition-all flex items-center space-x-1 shadow-sm active:scale-95 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* Custom Food Creation Form */
          <form onSubmit={handleCreateCustomFood} className="space-y-3 overflow-y-auto flex-1 min-h-0 pr-1">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Enter precise nutritional data for your custom ingredient or recipe. Custom foods are stored locally for immediate reuse.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Food Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Homemade Anabolic Protein Cookie"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Proteins">Proteins</option>
                  <option value="Carbs & Grains">Carbs & Grains</option>
                  <option value="Vegetables & Greens">Vegetables & Greens</option>
                  <option value="Healthy Fats & Nuts">Healthy Fats & Nuts</option>
                  <option value="Dairy & Alternatives">Dairy & Alternatives</option>
                  <option value="Supplements & Meds">Supplements & Meds</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Serving Unit</label>
                <input
                  type="text"
                  placeholder="e.g. 1 cookie (80g)"
                  value={customServingUnit}
                  onChange={(e) => setCustomServingUnit(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  required
                  value={customCalories}
                  onChange={(e) => setCustomCalories(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold text-amber-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Protein (g)</label>
                <input
                  type="number"
                  required
                  value={customProtein}
                  onChange={(e) => setCustomProtein(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold text-emerald-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Carbohydrates (g)</label>
                <input
                  type="number"
                  required
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold text-blue-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Fats (g)</label>
                <input
                  type="number"
                  required
                  value={customFat}
                  onChange={(e) => setCustomFat(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold text-purple-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Dietary Fiber (g)</label>
                <input
                  type="number"
                  value={customFiber}
                  onChange={(e) => setCustomFiber(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black hover:bg-emerald-700 shadow-md transition-all active:scale-98 mt-2"
            >
              ✨ Save Custom Food & Add To Search
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
