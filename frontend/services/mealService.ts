import { fetchApi } from "@/services/apiBase";
import { MealCategory, TaskStatus, LiquidType, SupplementTiming } from "@/store/useDietStore";

export interface LoggedMealDto {
  id: string;
  food_id?: string;
  name: string;
  meal_category: MealCategory;
  serving_multiplier: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium_mg: number;
  potassium_mg: number;
  badge_emoji: string;
  status: TaskStatus;
  scheduled_time?: string;
  completed_at?: string;
  date_str: string;
  temporal_event_id?: string;
}

export interface HydrationLogDto {
  id: string;
  liquid_type: LiquidType;
  volume_ml: number;
  emoji: string;
  timestamp: string;
  date_str: string;
  temporal_event_id?: string;
}

export interface SupplementDto {
  id: string;
  name: string;
  dosage: string;
  timing: SupplementTiming;
  scheduled_time: string;
  status: TaskStatus;
  completed_at?: string;
  badge_emoji: string;
  date_str: string;
  temporal_event_id?: string;
}

export interface MealComboDto {
  id: string;
  name: string;
  items: { foodId: string; quantity: number }[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  badge_emoji: string;
}

export interface ReminderRuleDto {
  id: string;
  title: string;
  time_str: string;
  reminder_type: "meal" | "water" | "supplement";
  enabled: boolean;
  temporal_event_id?: string;
}

export interface DailyTotalsDto {
  calories: number;
  protein: number;
  carbs: number;
  net_carbs?: number;
  fat: number;
  sat_fat?: number;
  unsat_fat?: number;
  fiber: number;
  sugar?: number;
  sodium_mg?: number;
  potassium_mg?: number;
  cholesterol_mg?: number;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  target_fiber: number;
  water_ml: number;
  target_water_ml: number;
  completed_meals: number;
  total_meals: number;
  completed_supplements: number;
  total_supplements: number;
  streak_days: number;
  hypertrophy_match_pct?: number;
  fat_loss_match_pct?: number;
  maintenance_match_pct?: number;
  nutrition_score?: number;
}

export interface DailyNutritionDashboardDto {
  date_str: string;
  meals: LoggedMealDto[];
  hydration: HydrationLogDto[];
  supplements: SupplementDto[];
  combos: MealComboDto[];
  notifications: ReminderRuleDto[];
  totals: DailyTotalsDto;
}

export interface ScientificFoodDto {
  id: string;
  name: string;
  category: string;
  serving_size: string;
  serving_weight_g?: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  net_carbs_g?: number;
  fat_g: number;
  sat_fat_g?: number;
  unsat_fat_g?: number;
  fiber_g: number;
  sugar_g?: number;
  sodium_mg: number;
  potassium_mg: number;
  calcium_mg?: number;
  iron_mg?: number;
  brand?: string;
  search_keywords?: string[];
  aliases?: string[];
  regional_names?: string;
  badge_emoji: string;
  verified: boolean;
  is_custom: boolean;
  is_favorite?: boolean;
  is_recent?: boolean;
}

export interface FoodSearchResultDto {
  total_count: number;
  page: number;
  limit: number;
  items: ScientificFoodDto[];
}

export const mealService = {
  getDashboard: async (dateStr: string): Promise<DailyNutritionDashboardDto> => {
    return fetchApi<DailyNutritionDashboardDto>(`/api/v1/meals/dashboard?date=${dateStr}`);
  },

  addMealItem: async (meal: {
    date_str: string;
    food_id?: string;
    name: string;
    meal_category: MealCategory;
    serving_multiplier: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium_mg?: number;
    potassium_mg?: number;
    badge_emoji: string;
    scheduled_time?: string;
  }): Promise<LoggedMealDto> => {
    return fetchApi<LoggedMealDto>("/api/v1/meals/items", {
      method: "POST",
      body: JSON.stringify(meal),
    });
  },

  updateMealItem: async (mealId: string, payload: {
    serving_multiplier?: number;
    status?: TaskStatus;
    meal_category?: MealCategory;
    scheduled_time?: string;
  }): Promise<LoggedMealDto> => {
    return fetchApi<LoggedMealDto>(`/api/v1/meals/items/${mealId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  toggleMealStatus: async (dateStr: string, mealId: string, status?: TaskStatus): Promise<LoggedMealDto> => {
    return fetchApi<LoggedMealDto>(`/api/v1/meals/items/${mealId}/status?date=${dateStr}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  removeMealItem: async (dateStr: string, mealId: string): Promise<void> => {
    await fetchApi(`/api/v1/meals/items/${mealId}?date=${dateStr}`, {
      method: "DELETE",
    });
  },

  copyPlanToDate: async (fromDateStr: string, toDateStr: string): Promise<void> => {
    await fetchApi("/api/v1/meals/copy-plan", {
      method: "POST",
      body: JSON.stringify({ from_date_str: fromDateStr, to_date_str: toDateStr }),
    });
  },

  searchFoods: async (query?: string, category?: string, onlyFavorites?: boolean): Promise<FoodSearchResultDto> => {
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (category && category !== "All") params.append("category", category);
    if (onlyFavorites) params.append("only_favorites", "true");
    params.append("limit", "100");
    return fetchApi<FoodSearchResultDto>(`/api/v1/meals/foods/search?${params.toString()}`);
  },

  toggleFavoriteFood: async (foodId: string): Promise<{ food_id: string; is_favorite: boolean }> => {
    return fetchApi<{ food_id: string; is_favorite: boolean }>("/api/v1/meals/foods/favorite", {
      method: "POST",
      body: JSON.stringify({ food_id: foodId }),
    });
  },

  addCustomFood: async (food: {
    name: string;
    category: string;
    serving_size: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    sodium_mg?: number;
    potassium_mg?: number;
    badge_emoji: string;
  }): Promise<ScientificFoodDto> => {
    return fetchApi<ScientificFoodDto>("/api/v1/meals/foods/custom", {
      method: "POST",
      body: JSON.stringify(food),
    });
  },

  addHydration: async (data: {
    date_str: string;
    liquid_type: LiquidType;
    volume_ml: number;
    emoji: string;
  }): Promise<HydrationLogDto> => {
    return fetchApi<HydrationLogDto>("/api/v1/meals/hydration", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  removeHydration: async (dateStr: string, hydId: string): Promise<void> => {
    await fetchApi(`/api/v1/meals/hydration/${hydId}?date=${dateStr}`, {
      method: "DELETE",
    });
  },

  updateWaterTarget: async (dateStr: string, targetWaterMl: number): Promise<void> => {
    await fetchApi(`/api/v1/meals/hydration/target?date=${dateStr}`, {
      method: "PUT",
      body: JSON.stringify({ target_water_ml: targetWaterMl }),
    });
  },

  addSupplement: async (supp: {
    date_str: string;
    name: string;
    dosage: string;
    timing: SupplementTiming;
    scheduled_time: string;
    badge_emoji: string;
  }): Promise<SupplementDto> => {
    return fetchApi<SupplementDto>("/api/v1/meals/supplements", {
      method: "POST",
      body: JSON.stringify(supp),
    });
  },

  toggleSupplementStatus: async (dateStr: string, suppId: string): Promise<SupplementDto> => {
    return fetchApi<SupplementDto>(`/api/v1/meals/supplements/${suppId}/status?date=${dateStr}`, {
      method: "PATCH",
    });
  },

  removeSupplement: async (dateStr: string, suppId: string): Promise<void> => {
    await fetchApi(`/api/v1/meals/supplements/${suppId}?date=${dateStr}`, {
      method: "DELETE",
    });
  },

  getRecipes: async (): Promise<MealComboDto[]> => {
    return fetchApi<MealComboDto[]>("/api/v1/meals/recipes");
  },

  addRecipeCombo: async (combo: {
    name: string;
    items: { foodId: string; quantity: number }[];
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
    badge_emoji: string;
  }): Promise<MealComboDto> => {
    return fetchApi<MealComboDto>("/api/v1/meals/recipes", {
      method: "POST",
      body: JSON.stringify(combo),
    });
  },

  getReminders: async (): Promise<ReminderRuleDto[]> => {
    return fetchApi<ReminderRuleDto[]>("/api/v1/meals/reminders");
  },

  toggleReminder: async (id: string): Promise<ReminderRuleDto> => {
    return fetchApi<ReminderRuleDto>(`/api/v1/meals/reminders/${id}`, {
      method: "PATCH",
    });
  },

  scheduleMealEvent: async (payload: any): Promise<LoggedMealDto> => {
    return fetchApi<LoggedMealDto>("/api/v1/meals/events", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateMealEvent: async (eventId: string, payload: any): Promise<LoggedMealDto> => {
    return fetchApi<LoggedMealDto>(`/api/v1/meals/events/${eventId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  copyRangePlans: async (fromStartDate: string, fromEndDate: string, toStartDate: string): Promise<void> => {
    await fetchApi("/api/v1/meals/copy-range", {
      method: "POST",
      body: JSON.stringify({
        from_start_date: fromStartDate,
        from_end_date: fromEndDate,
        to_start_date: toStartDate,
      }),
    });
  },

  getTimelineIndicators: async (startDate: string, endDate: string): Promise<any[]> => {
    return fetchApi<any[]>(`/api/v1/meals/timeline-indicators?start_date=${startDate}&end_date=${endDate}`);
  },
};
