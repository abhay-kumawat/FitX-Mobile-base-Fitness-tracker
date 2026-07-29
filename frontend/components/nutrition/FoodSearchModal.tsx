"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Plus, Sparkles, Star, ShieldCheck } from "lucide-react";
import { useDietStore, MealCategory } from "@/store/useDietStore";
import { ScientificFoodItem } from "@/data/foodLibrary";
import { mealService, ScientificFoodDto } from "@/services/mealService";
import { soundscape } from "@/lib/soundscapeEngine";
import {
  ResponsiveCard,
  AdaptiveBadge,
  FlexibleRow,
  FlexibleGrid,
  FlexibleStack,
  AdaptiveHeading,
  AdaptiveText,
  SmartButton,
  ResponsiveIconContainer,
} from "@/components/ui/primitives";

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
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Backend foods state
  const [remoteFoods, setRemoteFoods] = useState<ScientificFoodDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Custom food form state
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState<ScientificFoodItem["category"]>("Proteins");
  const [customServingUnit, setCustomServingUnit] = useState("100g");
  const [customCalories, setCustomCalories] = useState<number>(150);
  const [customProtein, setCustomProtein] = useState<number>(20);
  const [customCarbs, setCustomCarbs] = useState<number>(10);
  const [customFat, setCustomFat] = useState<number>(5);
  const [customFiber, setCustomFiber] = useState<number>(2);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await mealService.searchFoods(searchQuery, selectedCategory, onlyFavorites);
        if (res && Array.isArray(res.items)) {
          setRemoteFoods(res.items);
        }
      } catch (err) {
        console.warn("[FitX FoodSearch] Remote search fallback:", err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isOpen, searchQuery, selectedCategory, onlyFavorites]);

  if (!isOpen) return null;

  const localFoods = allFoods();

  const mergedFoods: ScientificFoodItem[] = [
    ...localFoods.filter((f) => f.isCustom),
    ...remoteFoods.map((rf) => ({
      id: rf.id,
      name: rf.name,
      category: (rf.category as any) || "Proteins",
      servingUnit: rf.serving_size || "100g",
      servingSizeGrams: rf.serving_weight_g || 100,
      calories: rf.calories,
      protein: rf.protein_g,
      carbs: rf.carbs_g,
      netCarbs: rf.net_carbs_g || Math.max(0, rf.carbs_g - rf.fiber_g),
      fiber: rf.fiber_g,
      fat: rf.fat_g,
      satFat: rf.sat_fat_g || 0.5,
      sodiumMg: rf.sodium_mg,
      potassiumMg: rf.potassium_mg,
      calciumMg: rf.calcium_mg || 0,
      ironMg: rf.iron_mg || 0,
      badgeEmoji: rf.badge_emoji || "🥗",
      badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
      isCustom: rf.is_custom,
      isFavorite: rf.is_favorite,
    })),
  ];

  const uniqueFoodsMap = new Map<string, ScientificFoodItem & { isFavorite?: boolean }>();
  mergedFoods.forEach((item) => uniqueFoodsMap.set(item.id, item));
  const foodsList = Array.from(uniqueFoodsMap.values());

  const categories = [
    "All",
    "Proteins",
    "Carbs & Grains",
    "Vegetables & Greens",
    "Healthy Fats & Nuts",
    "Dairy & Alternatives",
    "Supplements & Meds",
  ];

  const handleToggleFavorite = async (e: React.MouseEvent, foodId: string) => {
    e.stopPropagation();
    soundscape.playTapSound();
    try {
      const res = await mealService.toggleFavoriteFood(foodId);
      setRemoteFoods((prev) =>
        prev.map((f) => (f.id === foodId ? { ...f, is_favorite: res.is_favorite } : f))
      );
    } catch (err) {
      console.warn("Toggle favorite error", err);
    }
  };

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
      sodiumMg: Math.round((food.sodiumMg || 0) * multiplier),
      potassiumMg: Math.round((food.potassiumMg || 0) * multiplier),
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

    setSearchQuery(customName);
    setActiveTab("search");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-2xl bg-white border-t-2 sm:border-2 border-slate-300 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-2xl max-h-[88vh] flex flex-col min-h-0">
        {/* Header */}
        <FlexibleRow justify="between" align="center" className="border-b border-slate-200 pb-3 shrink-0">
          <FlexibleRow justify="start" align="center" gap="xs" className="min-w-0">
            <ResponsiveIconContainer size="sm" variant="emerald">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </ResponsiveIconContainer>
            <AdaptiveHeading level={3} className="truncate">
              FitX 1,000+ Food Library Search
            </AdaptiveHeading>
          </FlexibleRow>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors rounded-lg shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </FlexibleRow>

        {/* Tab Switcher */}
        <FlexibleRow justify="between" align="center" className="border-b border-slate-200 shrink-0">
          <FlexibleRow justify="start" align="center" gap="xs">
            <button
              onClick={() => setActiveTab("search")}
              className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-all whitespace-nowrap ${
                activeTab === "search"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              🔍 Search Database ({foodsList.length})
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-all whitespace-nowrap ${
                activeTab === "custom"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              ✨ Custom Creation
            </button>
          </FlexibleRow>

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`pb-2 px-2 text-xs font-bold flex items-center space-x-1 rounded-xl transition-all ${
              onlyFavorites
                ? "bg-amber-100 text-amber-900 border border-amber-300"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? "fill-amber-500 text-amber-500" : ""}`} />
            <span>Favorites</span>
          </button>
        </FlexibleRow>

        {activeTab === "search" ? (
          <>
            {/* Search Input & Serving Multiplier */}
            <FlexibleStack gap="xs" className="shrink-0">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Roti, Dal, Paneer, Chicken, Oats, Biryani, Idli..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Meal Slot & Multiplier Controls */}
              <FlexibleRow justify="between" align="center" gap="xs" className="bg-slate-50 border border-slate-200 rounded-2xl p-2">
                <FlexibleRow justify="start" align="center" gap="xs" className="min-w-0">
                  <label className="text-[11px] font-bold text-slate-600 shrink-0">Assign To:</label>
                  <select
                    value={selectedMealCategory}
                    onChange={(e) => setSelectedMealCategory(e.target.value as MealCategory)}
                    className="p-1 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 shrink-0"
                  >
                    <option value="Breakfast">🌅 Breakfast</option>
                    <option value="Lunch">🥗 Lunch</option>
                    <option value="Dinner">🍲 Dinner</option>
                    <option value="Snacks">🍎 Snacks</option>
                  </select>
                </FlexibleRow>

                <FlexibleRow justify="end" align="center" gap="xs" className="shrink-0 font-mono">
                  <label className="text-[11px] font-bold text-slate-600 shrink-0">Portion:</label>
                  {[0.5, 1.0, 1.5, 2.0, 3.0].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMultiplier(m)}
                      className={`px-2 py-0.5 text-xs font-bold rounded-lg transition-all ${
                        multiplier === m
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {m}x
                    </button>
                  ))}
                </FlexibleRow>
              </FlexibleRow>

              {/* Category Filter Pills */}
              <FlexibleRow justify="start" align="center" gap="xs" className="overflow-x-auto no-scrollbar py-0.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </FlexibleRow>
            </FlexibleStack>

            {/* Food Items List */}
            <div className="overflow-y-auto flex-1 min-h-0 space-y-2 pr-1">
              {isSearching ? (
                <AdaptiveText size="xs" variant="muted" className="text-center py-6">
                  Searching 1,000+ scientific foods database...
                </AdaptiveText>
              ) : foodsList.length === 0 ? (
                <ResponsiveCard variant="subtle" padding="compact" radius="2xl" className="text-center border-dashed">
                  <AdaptiveText size="xs" variant="muted" className="font-bold">
                    No matching food item found in library.
                  </AdaptiveText>
                  <button
                    onClick={() => setActiveTab("custom")}
                    className="mt-1 text-xs font-black text-emerald-600 hover:underline"
                  >
                    + Add "{searchQuery}" as a Custom Food
                  </button>
                </ResponsiveCard>
              ) : (
                foodsList.map((food) => (
                  <ResponsiveCard
                    key={food.id}
                    variant="default"
                    padding="compact"
                    radius="2xl"
                    className="hover:border-emerald-400 transition-all"
                  >
                    <FlexibleRow justify="between" align="center" gap="xs">
                      <FlexibleRow justify="start" align="center" gap="xs" className="flex-1 min-w-0">
                        <ResponsiveIconContainer size="md" variant="slate">
                          <span>{food.badgeEmoji}</span>
                        </ResponsiveIconContainer>

                        <FlexibleStack gap="xs" className="flex-1 min-w-0">
                          <FlexibleRow justify="start" align="center" gap="xs">
                            <span className="text-xs font-black text-slate-900 truncate">
                              {food.name}
                            </span>
                            <button
                              onClick={(e) => handleToggleFavorite(e, food.id)}
                              className="p-0.5 hover:scale-110 transition-transform shrink-0"
                              title="Favorite food"
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  food.isFavorite
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300 hover:text-amber-400"
                                }`}
                              />
                            </button>
                            {food.isCustom && (
                              <AdaptiveBadge variant="purple" size="xs">
                                Custom
                              </AdaptiveBadge>
                            )}
                          </FlexibleRow>

                          <AdaptiveText size="xs" variant="muted" className="font-mono truncate">
                            Base: {food.servingUnit} ({food.category})
                          </AdaptiveText>

                          <FlexibleRow justify="start" align="center" gap="xs" className="text-[11px] font-mono">
                            <span className="font-extrabold text-amber-600">
                              {Math.round(food.calories * multiplier)} kcal
                            </span>
                            <span className="text-emerald-700">P: {Math.round(food.protein * multiplier)}g</span>
                            <span className="text-blue-700">C: {Math.round(food.carbs * multiplier)}g</span>
                            <span className="text-purple-700">F: {Math.round(food.fat * multiplier)}g</span>
                          </FlexibleRow>
                        </FlexibleStack>
                      </FlexibleRow>

                      <SmartButton
                        variant="emerald"
                        size="sm"
                        icon={<Plus className="w-3.5 h-3.5" />}
                        onClick={() => handleAddFood(food)}
                      >
                        Add
                      </SmartButton>
                    </FlexibleRow>
                  </ResponsiveCard>
                ))
              )}
            </div>
          </>
        ) : (
          /* Custom Food Form */
          <form onSubmit={handleCreateCustomFood} className="space-y-3 overflow-y-auto flex-1 min-h-0 pr-1">
            <ResponsiveCard variant="subtle" padding="compact" radius="2xl" className="border-emerald-200 bg-emerald-50/70">
              <FlexibleRow justify="start" align="start" gap="xs" className="text-xs text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Enter precise nutritional data for your custom food or recipe. Custom items are saved to your personal library.
                </span>
              </FlexibleRow>
            </ResponsiveCard>

            <FlexibleGrid minItemWidth={150} gap="xs" className="font-mono">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Food Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Homemade Roti Roll"
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
                  placeholder="e.g. 1 serving (120g)"
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
            </FlexibleGrid>

            <SmartButton type="submit" variant="emerald" size="md" fullWidth>
              ✨ Save Custom Food & Add To Library
            </SmartButton>
          </form>
        )}
      </div>
    </div>
  );
};
