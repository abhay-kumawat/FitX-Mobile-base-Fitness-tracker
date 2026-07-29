import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ScientificFoodItem, PREPOPULATED_FOOD_LIBRARY } from "@/data/foodLibrary";
import { mealService } from "@/services/mealService";

export type MealCategory = "Breakfast" | "Lunch" | "Dinner" | "Snacks";
export type TaskStatus = "pending" | "completed" | "skipped";
export type LiquidType = "Water" | "Electrolytes" | "Protein Shake" | "Tea & Coffee" | "Fresh Juice";
export type SupplementTiming = "Morning" | "With Meals" | "Pre-Workout" | "Post-Workout" | "Bedtime";

export interface LoggedMealItem {
  id: string;
  foodId: string;
  name: string;
  mealCategory: MealCategory;
  servingMultiplier: number;
  calories: number;
  protein: number;
  carbs: number;
  fiber: number;
  fat: number;
  sodiumMg: number;
  potassiumMg: number;
  badgeEmoji: string;
  status: TaskStatus;
  scheduledTime?: string;
  dateStr: string;
  completedAt?: string;
}

export interface LiquidEntry {
  id: string;
  type: LiquidType;
  volumeMl: number;
  timestamp: string;
  dateStr: string;
  emoji: string;
}

export interface SupplementEntry {
  id: string;
  name: string;
  dosage: string;
  timing: SupplementTiming;
  scheduledTime: string;
  status: TaskStatus;
  dateStr: string;
  completedAt?: string;
  badgeEmoji: string;
}

export interface MealCombo {
  id: string;
  name: string;
  items: { foodId: string; quantity: number }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  badgeEmoji: string;
}

export interface NotificationSetting {
  id: string;
  title: string;
  timeStr: string;
  enabled: boolean;
  type: "meal" | "water" | "supplement";
}

export interface ScienceTargets {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetFiber: number;
  targetWaterMl: number;
  hypertrophyMatchPct: number;
  fatLossMatchPct: number;
  maintenanceMatchPct: number;
  nutritionScore: number;
  netCarbs: number;
  satFat: number;
  unsatFat: number;
  sugar: number;
  sodiumMg: number;
  potassiumMg: number;
  cholesterolMg: number;
}

interface DietState {
  // Food database
  customFoods: ScientificFoodItem[];
  allFoods: () => ScientificFoodItem[];
  addCustomFood: (food: Omit<ScientificFoodItem, "id" | "isCustom">) => Promise<void>;

  // Dashboard Sync & Science Targets
  isLoading: boolean;
  targets: ScienceTargets;
  fetchDashboardForDate: (dateStr: string) => Promise<void>;

  // Meal Todo items
  mealsByDate: Record<string, LoggedMealItem[]>;
  addMealItem: (dateStr: string, item: Omit<LoggedMealItem, "id" | "status">) => Promise<void>;
  updateMealQuantity: (dateStr: string, id: string, multiplier: number) => Promise<void>;
  toggleMealStatus: (dateStr: string, id: string, newStatus?: TaskStatus) => Promise<void>;
  removeMealItem: (dateStr: string, id: string) => Promise<void>;
  copyPlanToDate: (fromDateStr: string, toDateStr: string) => Promise<void>;

  // Hydration
  hydrationByDate: Record<string, LiquidEntry[]>;
  dailyWaterTargetMl: number;
  addLiquid: (dateStr: string, type: LiquidType, volumeMl: number, emoji?: string) => Promise<void>;
  removeLiquid: (dateStr: string, id: string) => Promise<void>;
  setDailyWaterTarget: (targetMl: number, dateStr?: string) => Promise<void>;

  // Supplements & Meds
  supplementsByDate: Record<string, SupplementEntry[]>;
  addSupplement: (dateStr: string, supp: Omit<SupplementEntry, "id" | "status">) => Promise<void>;
  toggleSupplementStatus: (dateStr: string, id: string) => Promise<void>;
  removeSupplement: (dateStr: string, id: string) => Promise<void>;

  // Combos
  combos: MealCombo[];
  addMealCombo: (combo: Omit<MealCombo, "id">) => Promise<void>;

  // Reminders
  notifications: NotificationSetting[];
  toggleNotification: (id: string) => Promise<void>;

  // Streaks & Timeline Indicators
  completedStreakDays: number;
  timelineIndicators: Record<string, any>;
  fetchTimelineIndicators: (startDate: string, endDate: string) => Promise<void>;
  scheduleMealEvent: (payload: any) => Promise<void>;
  copyRangePlans: (fromStartDate: string, fromEndDate: string, toStartDate: string) => Promise<void>;
  getDailyTotals: (dateStr: string) => {
    calories: number;
    protein: number;
    carbs: number;
    netCarbs: number;
    fiber: number;
    fat: number;
    satFat: number;
    unsatFat: number;
    sugar: number;
    sodiumMg: number;
    potassiumMg: number;
    cholesterolMg: number;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
    targetFiber: number;
    waterMl: number;
    targetWaterMl: number;
    completedMeals: number;
    totalMeals: number;
    completedSupplements: number;
    totalSupplements: number;
    hypertrophyMatchPct: number;
    fatLossMatchPct: number;
    maintenanceMatchPct: number;
    nutritionScore: number;
  };
}

const getTodayStr = () => new Date().toISOString().split("T")[0];

const defaultTargets: ScienceTargets = {
  targetCalories: 2400,
  targetProtein: 180,
  targetCarbs: 260,
  targetFat: 70,
  targetFiber: 30,
  targetWaterMl: 3500,
  hypertrophyMatchPct: 88,
  fatLossMatchPct: 92,
  maintenanceMatchPct: 85,
  nutritionScore: 88,
  netCarbs: 0,
  satFat: 0,
  unsatFat: 0,
  sugar: 0,
  sodiumMg: 0,
  potassiumMg: 0,
  cholesterolMg: 0,
};

export const useDietStore = create<DietState>()(
  persist(
    (set, get) => ({
      customFoods: [],
      isLoading: false,
      targets: defaultTargets,
      mealsByDate: {},
      hydrationByDate: {},
      supplementsByDate: {},
      dailyWaterTargetMl: 3500,
      combos: [],
      notifications: [],
      completedStreakDays: 5,
      timelineIndicators: {},

      fetchTimelineIndicators: async (startDate, endDate) => {
        try {
          const indicators = await mealService.getTimelineIndicators(startDate, endDate);
          const mapped: Record<string, any> = {};
          indicators.forEach((item) => {
            mapped[item.date] = item;
          });
          set((state) => ({
            timelineIndicators: { ...state.timelineIndicators, ...mapped }
          }));
        } catch (e) {
          console.warn("[FitX Store] Fetch timeline indicators error", e);
        }
      },

      scheduleMealEvent: async (payload) => {
        try {
          await mealService.scheduleMealEvent(payload);
          await get().fetchDashboardForDate(payload.scheduled_date);
        } catch (e) {
          console.error("[FitX Store] Schedule meal event error", e);
        }
      },

      copyRangePlans: async (fromStartDate, fromEndDate, toStartDate) => {
        try {
          await mealService.copyRangePlans(fromStartDate, fromEndDate, toStartDate);
          await get().fetchDashboardForDate(toStartDate);
        } catch (e) {
          console.error("[FitX Store] Copy range plans error", e);
        }
      },

      allFoods: () => [...PREPOPULATED_FOOD_LIBRARY, ...get().customFoods],

      fetchDashboardForDate: async (dateStr) => {
        set({ isLoading: true });
        try {
          const dashboard = await mealService.getDashboard(dateStr);
          
          const mappedMeals: LoggedMealItem[] = dashboard.meals.map((m) => ({
            id: m.id,
            foodId: m.food_id || "",
            name: m.name,
            mealCategory: m.meal_category,
            servingMultiplier: m.serving_multiplier,
            calories: m.calories,
            protein: m.protein,
            carbs: m.carbs,
            fat: m.fat,
            fiber: m.fiber,
            sodiumMg: m.sodium_mg,
            potassiumMg: m.potassium_mg,
            badgeEmoji: m.badge_emoji,
            status: m.status,
            scheduledTime: m.scheduled_time || undefined,
            completedAt: m.completed_at || undefined,
            dateStr: m.date_str,
          }));

          const mappedHydration: LiquidEntry[] = dashboard.hydration.map((h) => ({
            id: h.id,
            type: h.liquid_type,
            volumeMl: h.volume_ml,
            timestamp: h.timestamp,
            dateStr: h.date_str,
            emoji: h.emoji,
          }));

          const mappedSupplements: SupplementEntry[] = dashboard.supplements.map((s) => ({
            id: s.id,
            name: s.name,
            dosage: s.dosage,
            timing: s.timing,
            scheduledTime: s.scheduled_time,
            status: s.status,
            completedAt: s.completed_at || undefined,
            badgeEmoji: s.badge_emoji,
            dateStr: s.date_str,
          }));

          const mappedCombos: MealCombo[] = dashboard.combos.map((c) => ({
            id: c.id,
            name: c.name,
            items: c.items,
            totalCalories: c.total_calories,
            totalProtein: c.total_protein,
            totalCarbs: c.total_carbs,
            totalFat: c.total_fat,
            badgeEmoji: c.badge_emoji,
          }));

          const mappedNotifications: NotificationSetting[] = dashboard.notifications.map((n) => ({
            id: n.id,
            title: n.title,
            timeStr: n.time_str,
            enabled: n.enabled,
            type: n.reminder_type,
          }));

          const t = dashboard.totals;
          set((state) => ({
            isLoading: false,
            completedStreakDays: t.streak_days,
            dailyWaterTargetMl: t.target_water_ml,
            targets: {
              targetCalories: t.target_calories || 2400,
              targetProtein: t.target_protein || 180,
              targetCarbs: t.target_carbs || 260,
              targetFat: t.target_fat || 70,
              targetFiber: t.target_fiber || 30,
              targetWaterMl: t.target_water_ml || 3500,
              hypertrophyMatchPct: t.hypertrophy_match_pct || 88,
              fatLossMatchPct: t.fat_loss_match_pct || 92,
              maintenanceMatchPct: t.maintenance_match_pct || 85,
              nutritionScore: t.nutrition_score || 88,
              netCarbs: t.net_carbs || 0,
              satFat: t.sat_fat || 0,
              unsatFat: t.unsat_fat || 0,
              sugar: t.sugar || 0,
              sodiumMg: t.sodium_mg || 0,
              potassiumMg: t.potassium_mg || 0,
              cholesterolMg: t.cholesterol_mg || 0,
            },
            mealsByDate: { ...state.mealsByDate, [dateStr]: mappedMeals },
            hydrationByDate: { ...state.hydrationByDate, [dateStr]: mappedHydration },
            supplementsByDate: { ...state.supplementsByDate, [dateStr]: mappedSupplements },
            combos: mappedCombos,
            notifications: mappedNotifications,
          }));
        } catch (error) {
          console.warn("[FitX DietStore] Dashboard fetch fallback to cache:", error);
          set({ isLoading: false });
        }
      },

      addCustomFood: async (food: any) => {
        const protein = food.proteinG ?? food.protein ?? 0;
        const carbs = food.carbsG ?? food.carbs ?? 0;
        const fat = food.fatG ?? food.fat ?? 0;
        const fiber = food.fiberG ?? food.fiber ?? 0;
        const servingSize = food.servingSize ?? food.servingUnit ?? "100g";

        try {
          const res = await mealService.addCustomFood({
            name: food.name,
            category: food.category,
            serving_size: servingSize,
            calories: food.calories,
            protein_g: protein,
            carbs_g: carbs,
            fat_g: fat,
            fiber_g: fiber,
            sodium_mg: food.sodiumMg || 0,
            potassium_mg: food.potassiumMg || 0,
            badge_emoji: food.badgeEmoji || "✨",
          });

          const newFood: ScientificFoodItem = {
            id: res.id,
            name: res.name,
            category: res.category as any,
            servingUnit: res.serving_size,
            servingSizeGrams: 100,
            calories: res.calories,
            protein: res.protein_g,
            carbs: res.carbs_g,
            netCarbs: Math.max(0, res.carbs_g - res.fiber_g),
            fiber: res.fiber_g,
            fat: res.fat_g,
            satFat: 1.0,
            sodiumMg: res.sodium_mg,
            potassiumMg: res.potassium_mg,
            calciumMg: 20,
            ironMg: 0.5,
            badgeEmoji: res.badge_emoji,
            badgeBg: "bg-purple-100 text-purple-700 border-purple-200",
            isCustom: true,
          };
          set((state) => ({ customFoods: [...state.customFoods, newFood] }));
        } catch (e) {
          const newFood: ScientificFoodItem = { ...food, id: `custom_${Date.now()}`, isCustom: true };
          set((state) => ({ customFoods: [...state.customFoods, newFood] }));
        }
      },

      addMealItem: async (dateStr, item) => {
        const tempId = `meal_${Date.now()}`;
        const newItem: LoggedMealItem = { ...item, id: tempId, status: "pending" };
        set((state) => ({
          mealsByDate: {
            ...state.mealsByDate,
            [dateStr]: [...(state.mealsByDate[dateStr] || []), newItem],
          },
        }));

        try {
          const created = await mealService.addMealItem({
            date_str: dateStr,
            food_id: item.foodId,
            name: item.name,
            meal_category: item.mealCategory,
            serving_multiplier: item.servingMultiplier,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            fiber: item.fiber,
            sodium_mg: item.sodiumMg,
            potassium_mg: item.potassiumMg,
            badge_emoji: item.badgeEmoji,
            scheduled_time: item.scheduledTime,
          });

          set((state) => {
            const list = state.mealsByDate[dateStr] || [];
            return {
              mealsByDate: {
                ...state.mealsByDate,
                [dateStr]: list.map((m) => (m.id === tempId ? { ...m, id: created.id } : m)),
              },
            };
          });

          await get().fetchDashboardForDate(dateStr);
        } catch (e) {
          console.warn("[FitX DietStore] Add meal backend error", e);
        }
      },

      updateMealQuantity: async (dateStr, id, multiplier) => {
        set((state) => {
          const list = state.mealsByDate[dateStr] || [];
          const updated = list.map((item) => {
            if (item.id === id) {
              const oldM = item.servingMultiplier || 1.0;
              const ratio = multiplier / oldM;
              return {
                ...item,
                servingMultiplier: multiplier,
                calories: Math.round(item.calories * ratio),
                protein: Math.round(item.protein * ratio),
                carbs: Math.round(item.carbs * ratio),
                fat: Math.round(item.fat * ratio),
                fiber: Math.round(item.fiber * ratio),
              };
            }
            return item;
          });
          return { mealsByDate: { ...state.mealsByDate, [dateStr]: updated } };
        });

        try {
          await mealService.updateMealItem(id, { serving_multiplier: multiplier });
          await get().fetchDashboardForDate(dateStr);
        } catch (e) {
          console.warn("[FitX DietStore] Update meal multiplier error", e);
        }
      },

      toggleMealStatus: async (dateStr, id, newStatus) => {
        set((state) => {
          const current = state.mealsByDate[dateStr] || [];
          const updated = current.map((item) => {
            if (item.id === id) {
              const nextStatus: TaskStatus =
                newStatus || (item.status === "completed" ? "pending" : "completed");
              return {
                ...item,
                status: nextStatus,
                completedAt: nextStatus === "completed" ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
              };
            }
            return item;
          });
          return { mealsByDate: { ...state.mealsByDate, [dateStr]: updated } };
        });

        try {
          await mealService.toggleMealStatus(dateStr, id, newStatus);
          await get().fetchDashboardForDate(dateStr);
        } catch (e) {
          console.warn("[FitX DietStore] Toggle status backend error", e);
        }
      },

      removeMealItem: async (dateStr, id) => {
        set((state) => ({
          mealsByDate: {
            ...state.mealsByDate,
            [dateStr]: (state.mealsByDate[dateStr] || []).filter((m) => m.id !== id),
          },
        }));

        try {
          await mealService.removeMealItem(dateStr, id);
          await get().fetchDashboardForDate(dateStr);
        } catch (e) {
          console.warn("[FitX DietStore] Remove meal backend error", e);
        }
      },

      copyPlanToDate: async (fromDateStr, toDateStr) => {
        const sourceMeals = get().mealsByDate[fromDateStr] || [];
        set((state) => ({
          mealsByDate: {
            ...state.mealsByDate,
            [toDateStr]: sourceMeals.map((m) => ({ ...m, id: `meal_${Date.now()}_${Math.random()}`, dateStr: toDateStr, status: "pending" })),
          },
        }));

        try {
          await mealService.copyPlanToDate(fromDateStr, toDateStr);
          await get().fetchDashboardForDate(toDateStr);
        } catch (e) {
          console.warn("[FitX DietStore] Copy plan backend error", e);
        }
      },

      addLiquid: async (dateStr, type, volumeMl, emoji = "💧") => {
        const tempId = `hyd_${Date.now()}`;
        const newEntry: LiquidEntry = {
          id: tempId,
          type,
          volumeMl,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          dateStr,
          emoji,
        };

        set((state) => ({
          hydrationByDate: {
            ...state.hydrationByDate,
            [dateStr]: [...(state.hydrationByDate[dateStr] || []), newEntry],
          },
        }));

        try {
          const res = await mealService.addHydration({
            date_str: dateStr,
            liquid_type: type,
            volume_ml: volumeMl,
            emoji,
          });
          set((state) => {
            const list = state.hydrationByDate[dateStr] || [];
            return {
              hydrationByDate: {
                ...state.hydrationByDate,
                [dateStr]: list.map((h) => (h.id === tempId ? { ...h, id: res.id } : h)),
              },
            };
          });
        } catch (e) {
          console.warn("[FitX DietStore] Add hydration backend error", e);
        }
      },

      removeLiquid: async (dateStr, id) => {
        set((state) => ({
          hydrationByDate: {
            ...state.hydrationByDate,
            [dateStr]: (state.hydrationByDate[dateStr] || []).filter((h) => h.id !== id),
          },
        }));

        try {
          await mealService.removeHydration(dateStr, id);
        } catch (e) {
          console.warn("[FitX DietStore] Remove hydration error", e);
        }
      },

      setDailyWaterTarget: async (targetMl, dateStr = getTodayStr()) => {
        set({ dailyWaterTargetMl: targetMl });
        try {
          await mealService.updateWaterTarget(dateStr, targetMl);
        } catch (e) {
          console.warn("[FitX DietStore] Update water target error", e);
        }
      },

      addSupplement: async (dateStr, supp) => {
        const tempId = `supp_${Date.now()}`;
        const newSupp: SupplementEntry = { ...supp, id: tempId, status: "pending", dateStr };
        set((state) => ({
          supplementsByDate: {
            ...state.supplementsByDate,
            [dateStr]: [...(state.supplementsByDate[dateStr] || []), newSupp],
          },
        }));

        try {
          const res = await mealService.addSupplement({
            date_str: dateStr,
            name: supp.name,
            dosage: supp.dosage,
            timing: supp.timing,
            scheduled_time: supp.scheduledTime,
            badge_emoji: supp.badgeEmoji,
          });

          set((state) => {
            const list = state.supplementsByDate[dateStr] || [];
            return {
              supplementsByDate: {
                ...state.supplementsByDate,
                [dateStr]: list.map((s) => (s.id === tempId ? { ...s, id: res.id } : s)),
              },
            };
          });
        } catch (e) {
          console.warn("[FitX DietStore] Add supplement error", e);
        }
      },

      toggleSupplementStatus: async (dateStr, id) => {
        set((state) => {
          const current = state.supplementsByDate[dateStr] || [];
          const updated = current.map((item) => {
            if (item.id === id) {
              const nextStatus: TaskStatus = item.status === "completed" ? "pending" : "completed";
              return {
                ...item,
                status: nextStatus,
                completedAt: nextStatus === "completed" ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
              };
            }
            return item;
          });
          return { supplementsByDate: { ...state.supplementsByDate, [dateStr]: updated } };
        });

        try {
          await mealService.toggleSupplementStatus(dateStr, id);
        } catch (e) {
          console.warn("[FitX DietStore] Toggle supplement error", e);
        }
      },

      removeSupplement: async (dateStr, id) => {
        set((state) => ({
          supplementsByDate: {
            ...state.supplementsByDate,
            [dateStr]: (state.supplementsByDate[dateStr] || []).filter((s) => s.id !== id),
          },
        }));

        try {
          await mealService.removeSupplement(dateStr, id);
        } catch (e) {
          console.warn("[FitX DietStore] Remove supplement error", e);
        }
      },

      addMealCombo: async (combo) => {
        try {
          const res = await mealService.addRecipeCombo({
            name: combo.name,
            items: combo.items,
            total_calories: combo.totalCalories,
            total_protein: combo.totalProtein,
            total_carbs: combo.totalCarbs,
            total_fat: combo.totalFat,
            badge_emoji: combo.badgeEmoji,
          });

          set((state) => ({
            combos: [...state.combos, {
              id: res.id,
              name: res.name,
              items: res.items,
              totalCalories: res.total_calories,
              totalProtein: res.total_protein,
              totalCarbs: res.total_carbs,
              totalFat: res.total_fat,
              badgeEmoji: res.badge_emoji,
            }],
          }));
        } catch (e) {
          set((state) => ({
            combos: [...state.combos, { ...combo, id: `combo_${Date.now()}` }],
          }));
        }
      },

      toggleNotification: async (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, enabled: !n.enabled } : n
          ),
        }));

        try {
          await mealService.toggleReminder(id);
        } catch (e) {
          console.warn("[FitX DietStore] Toggle notification error", e);
        }
      },

      getDailyTotals: (dateStr) => {
        const meals = get().mealsByDate[dateStr] || [];
        const hydration = get().hydrationByDate[dateStr] || [];
        const supplements = get().supplementsByDate[dateStr] || [];
        const targets = get().targets || defaultTargets;

        const totals = meals.reduce(
          (acc, m) => {
            acc.calories += m.calories;
            acc.protein += m.protein;
            acc.carbs += m.carbs;
            acc.fiber += m.fiber;
            acc.fat += m.fat;
            acc.sodiumMg += m.sodiumMg || 0;
            acc.potassiumMg += m.potassiumMg || 0;
            if (m.status === "completed") acc.completedMeals++;
            return acc;
          },
          {
            calories: 0,
            protein: 0,
            carbs: 0,
            netCarbs: 0,
            fiber: 0,
            fat: 0,
            satFat: 0,
            unsatFat: 0,
            sugar: 0,
            sodiumMg: 0,
            potassiumMg: 0,
            cholesterolMg: 0,
            waterMl: 0,
            completedMeals: 0,
            totalMeals: meals.length,
            completedSupplements: 0,
            totalSupplements: supplements.length,
          }
        );

        totals.waterMl = hydration.reduce((sum, h) => sum + h.volumeMl, 0);
        totals.completedSupplements = supplements.filter((s) => s.status === "completed").length;
        totals.netCarbs = Math.max(0, totals.carbs - totals.fiber);
        totals.satFat = Math.round(totals.fat * 0.35);
        totals.unsatFat = Math.round(totals.fat * 0.65);
        totals.sugar = Math.round(totals.carbs * 0.1);
        totals.cholesterolMg = Math.round(totals.protein * 1.5);

        return {
          ...totals,
          targetCalories: targets.targetCalories || 2400,
          targetProtein: targets.targetProtein || 180,
          targetCarbs: targets.targetCarbs || 260,
          targetFat: targets.targetFat || 70,
          targetFiber: targets.targetFiber || 30,
          targetWaterMl: targets.targetWaterMl || 3500,
          hypertrophyMatchPct: targets.hypertrophyMatchPct || 88,
          fatLossMatchPct: targets.fatLossMatchPct || 92,
          maintenanceMatchPct: targets.maintenanceMatchPct || 85,
          nutritionScore: targets.nutritionScore || 88,
        };
      },
    }),
    {
      name: "fitx-diet-storage",
    }
  )
);
