import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ScientificFoodItem, PREPOPULATED_FOOD_LIBRARY } from "@/data/foodLibrary";

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
  scheduledTime?: string; // e.g. "08:30"
  dateStr: string; // YYYY-MM-DD
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
  dosage: string; // e.g. "5g", "1 pill", "2 softgels"
  timing: SupplementTiming;
  scheduledTime: string; // e.g. "07:30"
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

interface DietState {
  // Food database
  customFoods: ScientificFoodItem[];
  allFoods: () => ScientificFoodItem[];
  addCustomFood: (food: Omit<ScientificFoodItem, "id" | "isCustom">) => void;

  // Meal Todo items
  mealsByDate: Record<string, LoggedMealItem[]>;
  addMealItem: (dateStr: string, item: Omit<LoggedMealItem, "id" | "status">) => void;
  toggleMealStatus: (dateStr: string, id: string, newStatus?: TaskStatus) => void;
  removeMealItem: (dateStr: string, id: string) => void;
  copyPlanToDate: (fromDateStr: string, toDateStr: string) => void;

  // Hydration
  hydrationByDate: Record<string, LiquidEntry[]>;
  dailyWaterTargetMl: number;
  addLiquid: (dateStr: string, type: LiquidType, volumeMl: number, emoji?: string) => void;
  setDailyWaterTarget: (targetMl: number) => void;

  // Supplements & Meds
  supplementsByDate: Record<string, SupplementEntry[]>;
  addSupplement: (dateStr: string, supp: Omit<SupplementEntry, "id" | "status">) => void;
  toggleSupplementStatus: (dateStr: string, id: string) => void;
  removeSupplement: (dateStr: string, id: string) => void;

  // Combos
  combos: MealCombo[];
  addMealCombo: (combo: Omit<MealCombo, "id">) => void;

  // Reminders
  notifications: NotificationSetting[];
  toggleNotification: (id: string) => void;
  updateNotificationTime: (id: string, timeStr: string) => void;

  // Streaks & Stats
  completedStreakDays: number;
  getDailyTotals: (dateStr: string) => {
    calories: number;
    protein: number;
    carbs: number;
    fiber: number;
    fat: number;
    waterMl: number;
    completedMeals: number;
    totalMeals: number;
    completedSupplements: number;
    totalSupplements: number;
  };
}

const getTodayStr = () => new Date().toISOString().split("T")[0];

export const useDietStore = create<DietState>()(
  persist(
    (set, get) => ({
      customFoods: [],
      allFoods: () => [...PREPOPULATED_FOOD_LIBRARY, ...get().customFoods],

      addCustomFood: (food) => {
        const newFood: ScientificFoodItem = {
          ...food,
          id: `custom_${Date.now()}`,
          isCustom: true,
        };
        set((state) => ({ customFoods: [...state.customFoods, newFood] }));
      },

      mealsByDate: {
        [getTodayStr()]: [
          {
            id: "m1",
            foodId: "c1",
            name: "Gold Protein Oats & Banana",
            mealCategory: "Breakfast",
            servingMultiplier: 1.5,
            calories: 520,
            protein: 38,
            carbs: 64,
            fiber: 8,
            fat: 12,
            sodiumMg: 140,
            potassiumMg: 520,
            badgeEmoji: "🌅",
            status: "completed",
            scheduledTime: "08:00",
            dateStr: getTodayStr(),
            completedAt: "08:15 AM",
          },
          {
            id: "m2",
            foodId: "p1",
            name: "Seared Chicken Breast & Quinoa Bowl",
            mealCategory: "Lunch",
            servingMultiplier: 2.0,
            calories: 680,
            protein: 55,
            carbs: 58,
            fiber: 10,
            fat: 16,
            sodiumMg: 280,
            potassiumMg: 710,
            badgeEmoji: "🥗",
            status: "pending",
            scheduledTime: "13:00",
            dateStr: getTodayStr(),
          },
          {
            id: "m3",
            foodId: "p5",
            name: "Lean Beef Stir-Fry & Jasmine Rice",
            mealCategory: "Dinner",
            servingMultiplier: 1.8,
            calories: 720,
            protein: 58,
            carbs: 62,
            fiber: 6,
            fat: 20,
            sodiumMg: 350,
            potassiumMg: 680,
            badgeEmoji: "🍲",
            status: "pending",
            scheduledTime: "19:30",
            dateStr: getTodayStr(),
          },
          {
            id: "m4",
            foodId: "d1",
            name: "Greek Yogurt & Honey Crunch",
            mealCategory: "Snacks",
            servingMultiplier: 1.5,
            calories: 280,
            protein: 24,
            carbs: 28,
            fiber: 4,
            fat: 4,
            sodiumMg: 90,
            potassiumMg: 360,
            badgeEmoji: "🍎",
            status: "pending",
            scheduledTime: "16:30",
            dateStr: getTodayStr(),
          },
        ],
      },

      addMealItem: (dateStr, item) => {
        const newItem: LoggedMealItem = {
          ...item,
          id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          status: "pending",
        };
        set((state) => {
          const current = state.mealsByDate[dateStr] || [];
          return {
            mealsByDate: {
              ...state.mealsByDate,
              [dateStr]: [...current, newItem],
            },
          };
        });
      },

      toggleMealStatus: (dateStr, id, newStatus) => {
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
          return {
            mealsByDate: {
              ...state.mealsByDate,
              [dateStr]: updated,
            },
          };
        });
      },

      removeMealItem: (dateStr, id) => {
        set((state) => ({
          mealsByDate: {
            ...state.mealsByDate,
            [dateStr]: (state.mealsByDate[dateStr] || []).filter((m) => m.id !== id),
          },
        }));
      },

      copyPlanToDate: (fromDateStr, toDateStr) => {
        set((state) => {
          const sourceMeals = state.mealsByDate[fromDateStr] || [];
          const sourceSupps = state.supplementsByDate[fromDateStr] || [];

          const copiedMeals = sourceMeals.map((m) => ({
            ...m,
            id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            status: "pending" as TaskStatus,
            dateStr: toDateStr,
            completedAt: undefined,
          }));

          const copiedSupps = sourceSupps.map((s) => ({
            ...s,
            id: `supp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            status: "pending" as TaskStatus,
            dateStr: toDateStr,
            completedAt: undefined,
          }));

          return {
            mealsByDate: { ...state.mealsByDate, [toDateStr]: copiedMeals },
            supplementsByDate: { ...state.supplementsByDate, [toDateStr]: copiedSupps },
          };
        });
      },

      // Hydration
      hydrationByDate: {
        [getTodayStr()]: [
          { id: "h1", type: "Water", volumeMl: 500, timestamp: "08:00 AM", dateStr: getTodayStr(), emoji: "💧" },
          { id: "h2", type: "Protein Shake", volumeMl: 400, timestamp: "09:00 AM", dateStr: getTodayStr(), emoji: "🥛" },
          { id: "h3", type: "Electrolytes", volumeMl: 500, timestamp: "12:00 PM", dateStr: getTodayStr(), emoji: "⚡" },
          { id: "h4", type: "Water", volumeMl: 750, timestamp: "02:30 PM", dateStr: getTodayStr(), emoji: "💧" },
        ],
      },
      dailyWaterTargetMl: 3000,

      addLiquid: (dateStr, type, volumeMl, emoji = "💧") => {
        const newEntry: LiquidEntry = {
          id: `liq_${Date.now()}`,
          type,
          volumeMl,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          dateStr,
          emoji,
        };
        set((state) => {
          const current = state.hydrationByDate[dateStr] || [];
          return {
            hydrationByDate: {
              ...state.hydrationByDate,
              [dateStr]: [...current, newEntry],
            },
          };
        });
      },

      setDailyWaterTarget: (targetMl) => set({ dailyWaterTargetMl: targetMl }),

      // Supplements & Meds
      supplementsByDate: {
        [getTodayStr()]: [
          {
            id: "sp1",
            name: "Creatine Monohydrate",
            dosage: "5g (1 scoop)",
            timing: "Pre-Workout",
            scheduledTime: "10:30",
            status: "completed",
            dateStr: getTodayStr(),
            completedAt: "10:25 AM",
            badgeEmoji: "⚡",
          },
          {
            id: "sp2",
            name: "Omega-3 Fish Oil",
            dosage: "2 softgels",
            timing: "With Meals",
            scheduledTime: "13:00",
            status: "pending",
            dateStr: getTodayStr(),
            badgeEmoji: "💊",
          },
          {
            id: "sp3",
            name: "Daily Multivitamin",
            dosage: "1 tablet",
            timing: "Morning",
            scheduledTime: "08:00",
            status: "completed",
            dateStr: getTodayStr(),
            completedAt: "08:10 AM",
            badgeEmoji: "💊",
          },
          {
            id: "sp4",
            name: "Pre-Workout Energy Matrix",
            dosage: "1 scoop (12g)",
            timing: "Pre-Workout",
            scheduledTime: "16:00",
            status: "pending",
            dateStr: getTodayStr(),
            badgeEmoji: "🔥",
          },
        ],
      },

      addSupplement: (dateStr, supp) => {
        const newSupp: SupplementEntry = {
          ...supp,
          id: `supp_${Date.now()}`,
          status: "pending",
        };
        set((state) => {
          const current = state.supplementsByDate[dateStr] || [];
          return {
            supplementsByDate: {
              ...state.supplementsByDate,
              [dateStr]: [...current, newSupp],
            },
          };
        });
      },

      toggleSupplementStatus: (dateStr, id) => {
        set((state) => {
          const current = state.supplementsByDate[dateStr] || [];
          const updated = current.map((s) => {
            if (s.id === id) {
              const nextStatus: TaskStatus = s.status === "completed" ? "pending" : "completed";
              return {
                ...s,
                status: nextStatus,
                completedAt: nextStatus === "completed" ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
              };
            }
            return s;
          });
          return {
            supplementsByDate: {
              ...state.supplementsByDate,
              [dateStr]: updated,
            },
          };
        });
      },

      removeSupplement: (dateStr, id) => {
        set((state) => ({
          supplementsByDate: {
            ...state.supplementsByDate,
            [dateStr]: (state.supplementsByDate[dateStr] || []).filter((s) => s.id !== id),
          },
        }));
      },

      // Combos
      combos: [
        {
          id: "cb1",
          name: "Anabolic Morning Oats",
          items: [
            { foodId: "c1", quantity: 1.5 },
            { foodId: "p2", quantity: 1.0 },
            { foodId: "f3", quantity: 0.5 },
          ],
          totalCalories: 485,
          totalProtein: 37,
          totalCarbs: 55,
          totalFat: 12,
          badgeEmoji: "🥣",
        },
      ],

      addMealCombo: (combo) => {
        const newCombo: MealCombo = {
          ...combo,
          id: `combo_${Date.now()}`,
        };
        set((state) => ({ combos: [...state.combos, newCombo] }));
      },

      // Notifications
      notifications: [
        { id: "n1", title: "Breakfast Meal Reminder", timeStr: "08:00", enabled: true, type: "meal" },
        { id: "n2", title: "Midday Hydration Check (500ml)", timeStr: "12:00", enabled: true, type: "water" },
        { id: "n3", title: "Pre-Workout Supplement Dose", timeStr: "16:00", enabled: true, type: "supplement" },
        { id: "n4", title: "Dinner Meal & Evening Meds", timeStr: "19:30", enabled: true, type: "meal" },
      ],

      toggleNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, enabled: !n.enabled } : n
          ),
        }));
      },

      updateNotificationTime: (id, timeStr) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, timeStr } : n
          ),
        }));
      },

      completedStreakDays: 5,

      getDailyTotals: (dateStr) => {
        const meals = get().mealsByDate[dateStr] || [];
        const hydration = get().hydrationByDate[dateStr] || [];
        const supps = get().supplementsByDate[dateStr] || [];

        const totals = meals.reduce(
          (acc, m) => {
            acc.calories += m.calories;
            acc.protein += m.protein;
            acc.carbs += m.carbs;
            acc.fiber += m.fiber;
            acc.fat += m.fat;
            if (m.status === "completed") acc.completedMeals += 1;
            return acc;
          },
          { calories: 0, protein: 0, carbs: 0, fiber: 0, fat: 0, completedMeals: 0 }
        );

        const waterMl = hydration.reduce((sum, h) => sum + h.volumeMl, 0);
        const completedSupplements = supps.filter((s) => s.status === "completed").length;

        return {
          ...totals,
          waterMl,
          totalMeals: meals.length,
          completedSupplements,
          totalSupplements: supps.length,
        };
      },
    }),
    {
      name: "fitx-diet-store-v2",
    }
  )
);
