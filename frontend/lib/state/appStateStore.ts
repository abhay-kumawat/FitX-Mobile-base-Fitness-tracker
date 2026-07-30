// FitX Master JSON AppState Store & AI Agent Action Dispatcher
import { useState, useEffect } from "react";

export interface CalendarEvent {
  id: string;
  date: string; // 'YYYY-MM-DD'
  title: string;
  type: "workout" | "rest" | "meal_prep" | "cardio" | "custom";
  status: "scheduled" | "completed" | "skipped" | "rescheduled";
  durationMins: number;
  routineId?: string;
  notes?: string;
}

export interface SetEntry {
  setNumber: number;
  type: "warmup" | "working" | "dropset" | "superset" | "failure";
  weightKg: number;
  reps: number;
  rpe?: number; // 1-10
  rir?: number; // Reps in reserve
  tempo?: string; // "3-1-1-0"
  completed: boolean;
  timestamp?: number;
}

export interface ExerciseItem {
  id: string;
  name: string;
  category: "chest" | "back" | "legs" | "shoulders" | "arms" | "core" | "cardio";
  targetMuscles: string[];
  sets: SetEntry[];
  safetyNote?: string;
  isBodyweightAlt?: boolean;
  supersetGroupId?: string;
  notes?: string;
}

export interface RoutineSession {
  id: string;
  title: string;
  energyLevel: number; // 30, 70, 100
  isTimeCrunched: boolean;
  isZenMode: boolean;
  nightMode: boolean;
  elapsedSeconds: number;
  exercises: ExerciseItem[];
  currentExerciseIndex: number;
}

export interface NutritionMacroState {
  consumedCalories: number;
  targetCalories: number;
  proteinGrams: number;
  targetProteinGrams: number;
  carbsGrams: number;
  targetCarbsGrams: number;
  fatGrams: number;
  targetFatGrams: number;
  waterMl: number;
  targetWaterMl: number;
  dailyBudgetUsd: number;
  dietPreference: string;
  fastingProtocol: "16:8" | "18:6" | "20:4" | "none";
  fastingElapsedHours: number;
  groceryChecklist: Record<string, boolean>;
}

export interface RecoveryBiometricState {
  readinessScore: number; // 0-100%
  hrvMs: number;
  restingHeartRateBpm: number;
  sleepDurationHours: number;
  sleepDeepHours: number;
  sleepRemHours: number;
  sorenessPercent: number;
  perceivedStressLevel: number; // 1-5
  activeInjuries: string[];
  acwrRatio: number;
  estimatedVo2Max: number;
  dominantHrZone: string;
  weightKg: number;
  bodyFatPercent: number;
}

export interface GamificationState {
  level: number;
  levelTitle: string;
  currentXp: number;
  targetXp: number;
  streakDays: number;
  streakFreezeTokens: number;
  unlockedBadges: string[];
  prWall: Array<{ exercise: string; record: string; date: string }>;
  kudosCount: Record<number, number>;
}

export interface MobileUXState {
  activeView: "dashboard" | "calendar" | "workout" | "recovery" | "meals" | "community" | "wearables" | "health";
  viewMode: "390px_frame" | "fluid";
  themeMode: "dark_obsidian" | "pastel_zen";
  widgetLayout: string[];
  mealPlanReview: { isOpen: boolean; recommendations: any[] };
}

export interface AppStateSnapshot {
  timestamp: number;
  description: string;
  state: string; // JSON serialized state
}

export interface AppState {
  version: string;
  calendar: CalendarEvent[];
  activeWorkout: RoutineSession | null;
  nutrition: NutritionMacroState;
  recovery: RecoveryBiometricState;
  gamification: GamificationState;
  ux: MobileUXState;
  historySnapshots: AppStateSnapshot[];
  historyIndex: number;
}

const STORAGE_KEY = "fitx_master_app_state_v2";

const INITIAL_STATE: AppState = {
  version: "2.5.0-master",
  calendar: [
    { id: "cal-1", date: "2026-07-28", title: "Hypertrophy Push Session", type: "workout", status: "scheduled", durationMins: 45 },
    { id: "cal-2", date: "2026-07-29", title: "Pull & Biceps Volume", type: "workout", status: "scheduled", durationMins: 50 },
    { id: "cal-3", date: "2026-07-30", title: "Active Recovery & Mobility", type: "rest", status: "scheduled", durationMins: 30 },
    { id: "cal-4", date: "2026-07-31", title: "Legs & Core Power", type: "workout", status: "scheduled", durationMins: 55 },
    { id: "cal-5", date: "2026-08-01", title: "Zone 2 Aerobic Run", type: "cardio", status: "scheduled", durationMins: 40 },
  ],
  activeWorkout: {
    id: "session-active",
    title: "Hypertrophy Upper Body & Joint Safety",
    energyLevel: 70,
    isTimeCrunched: false,
    isZenMode: false,
    nightMode: false,
    elapsedSeconds: 0,
    currentExerciseIndex: 0,
    exercises: [
      {
        id: "ex-1",
        name: "Incline Dumbbell Press",
        category: "chest",
        targetMuscles: ["Upper Chest", "Front Delts"],
        safetyNote: "Rotator cuff protection: 45° angle neutral grip",
        sets: [
          { setNumber: 1, type: "working", weightKg: 28, reps: 10, rpe: 8, rir: 2, completed: false },
          { setNumber: 2, type: "working", weightKg: 28, reps: 10, rpe: 8, rir: 2, completed: false },
          { setNumber: 3, type: "working", weightKg: 28, reps: 10, rpe: 8.5, rir: 1, completed: false },
        ]
      },
      {
        id: "ex-2",
        name: "Dumbbell Lateral Raise",
        category: "shoulders",
        targetMuscles: ["Side Deltoids"],
        safetyNote: "Replaced Overhead Press to avoid shoulder impingement",
        sets: [
          { setNumber: 1, type: "working", weightKg: 12, reps: 12, rpe: 8, rir: 2, completed: false },
          { setNumber: 2, type: "working", weightKg: 12, reps: 12, rpe: 8, rir: 2, completed: false },
          { setNumber: 3, type: "working", weightKg: 12, reps: 12, rpe: 9, rir: 1, completed: false },
        ]
      }
    ]
  },
  nutrition: {
    consumedCalories: 640,
    targetCalories: 2400,
    proteinGrams: 120,
    targetProteinGrams: 175,
    carbsGrams: 180,
    targetCarbsGrams: 220,
    fatGrams: 45,
    targetFatGrams: 60,
    waterMl: 2250,
    targetWaterMl: 3000,
    dailyBudgetUsd: 18.0,
    dietPreference: "Non-Veg",
    fastingProtocol: "16:8",
    fastingElapsedHours: 13.5,
    groceryChecklist: { g1: false, g2: false, g3: false }
  },
  recovery: {
    readinessScore: 92,
    hrvMs: 78,
    restingHeartRateBpm: 62,
    sleepDurationHours: 8.2,
    sleepDeepHours: 2.5,
    sleepRemHours: 3.2,
    sorenessPercent: 18,
    perceivedStressLevel: 2,
    activeInjuries: ["Shoulder"],
    acwrRatio: 1.12,
    estimatedVo2Max: 48.5,
    dominantHrZone: "Zone 2",
    weightKg: 75.0,
    bodyFatPercent: 17.5
  },
  gamification: {
    level: 4,
    levelTitle: "Iron Titan",
    currentXp: 1450,
    targetXp: 4000,
    streakDays: 12,
    streakFreezeTokens: 2,
    unlockedBadges: ["Iron Titan", "7-Day Streak Master", "Zero-Waste Gourmet", "Century Club Bench"],
    prWall: [
      { exercise: "Barbell Bench Press", record: "102.5 kg", date: "2 days ago" },
      { exercise: "Barbell Back Squat", record: "140.0 kg", date: "5 days ago" },
      { exercise: "Incline DB Press", record: "34.0 kg x 8", date: "1 week ago" }
    ],
    kudosCount: { 1: 14, 2: 9, 3: 21 }
  },
  ux: {
    activeView: "dashboard",
    viewMode: "390px_frame",
    themeMode: "dark_obsidian",
    widgetLayout: ["hero", "readiness", "streak", "stats"],
    mealPlanReview: { isOpen: false, recommendations: [] }
  },
  historySnapshots: [],
  historyIndex: -1
};

// Internal memory state & listeners
let currentState: AppState = (() => {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return INITIAL_STATE;
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_STATE;
  }
})();

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    } catch (e) {}
  }
}

// React Hook to consume AppState
export function useAppState(): AppState {
  const [state, setState] = useState<AppState>(currentState);

  useEffect(() => {
    const handleUpdate = () => setState(currentState);
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return state;
}

// Centralized Action Dispatcher for UI and AI Agent
export function dispatchAIAction(type: string, payload: any): AppState {
  const prevSnapshot = JSON.stringify(currentState);

  let updated = { ...currentState };

  switch (type) {
    // 1. Calendar Actions
    case "SCHEDULE_EVENT": {
      const newEvent: CalendarEvent = {
        id: `cal-${Date.now()}`,
        date: payload.date || new Date().toISOString().split("T")[0],
        title: payload.title || "Scheduled Workout",
        type: payload.type || "workout",
        status: "scheduled",
        durationMins: payload.durationMins || 45,
      };
      updated.calendar = [...updated.calendar, newEvent];
      break;
    }

    case "SHIFT_CALENDAR_DATE": {
      updated.calendar = updated.calendar.map((evt) => {
        if (evt.id === payload.eventId || evt.title.toLowerCase().includes(payload.titleQuery?.toLowerCase() || "")) {
          return { ...evt, date: payload.newDate, status: "rescheduled" };
        }
        return evt;
      });
      break;
    }

    case "RESCHEDULE_WORKOUT": {
      updated.calendar = updated.calendar.map((evt) => {
        if (evt.id === payload.eventId) {
          return { ...evt, date: payload.newDate, status: "rescheduled" };
        }
        return evt;
      });
      break;
    }

    // 2. Workout Actions
    case "TOGGLE_SET": {
      if (updated.activeWorkout) {
        const exList = updated.activeWorkout.exercises.map((ex) => {
          if (ex.id === payload.exerciseId) {
            const sets = [...ex.sets];
            if (sets[payload.setIndex]) {
              sets[payload.setIndex] = {
                ...sets[payload.setIndex],
                completed: !sets[payload.setIndex].completed,
              };
            }
            return { ...ex, sets };
          }
          return ex;
        });
        updated.activeWorkout = { ...updated.activeWorkout, exercises: exList };
      }
      break;
    }

    case "SWAP_EXERCISE": {
      if (updated.activeWorkout) {
        const exList = updated.activeWorkout.exercises.map((ex) => {
          if (ex.id === payload.exerciseId) {
            return { ...ex, name: payload.newExerciseName };
          }
          return ex;
        });
        updated.activeWorkout = { ...updated.activeWorkout, exercises: exList };
      }
      break;
    }

    case "ADD_SET": {
      if (updated.activeWorkout) {
        const exList = updated.activeWorkout.exercises.map((ex) => {
          if (ex.id === payload.exerciseId) {
            const nextSetNum = ex.sets.length + 1;
            const lastSet = ex.sets[ex.sets.length - 1] || { weightKg: 20, reps: 10 };
            const newSet: SetEntry = {
              setNumber: nextSetNum,
              type: "working",
              weightKg: lastSet.weightKg,
              reps: lastSet.reps,
              completed: false,
            };
            return {
              ...ex,
              sets: [...ex.sets, newSet],
            };
          }
          return ex;
        });
        updated.activeWorkout = { ...updated.activeWorkout, exercises: exList };
      }
      break;
    }


    // 3. Nutrition & Hydration
    case "LOG_WATER": {
      const added = payload.amountMl || 250;
      updated.nutrition = {
        ...updated.nutrition,
        waterMl: Math.min(updated.nutrition.targetWaterMl + 1000, updated.nutrition.waterMl + added),
      };
      break;
    }

    case "ADD_MEAL": {
      updated.nutrition = {
        ...updated.nutrition,
        consumedCalories: updated.nutrition.consumedCalories + (payload.calories || 400),
        proteinGrams: updated.nutrition.proteinGrams + (payload.proteinGrams || 30),
      };
      break;
    }

    case "SET_NUTRITION_BUDGET": {
      updated.nutrition = {
        ...updated.nutrition,
        dailyBudgetUsd: payload.budgetUsd || 20.0,
      };
      break;
    }

    // 4. Recovery & Biometrics
    case "SET_READINESS_SCORE": {
      updated.recovery = {
        ...updated.recovery,
        readinessScore: payload.score,
      };
      break;
    }

    case "TOGGLE_INJURY_SHIELD": {
      const joint = payload.joint;
      const injuries = updated.recovery.activeInjuries.includes(joint)
        ? updated.recovery.activeInjuries.filter((j) => j !== joint)
        : [...updated.recovery.activeInjuries, joint];
      updated.recovery = { ...updated.recovery, activeInjuries: injuries };
      break;
    }

    case "LOG_VITALS": {
      updated.recovery = {
        ...updated.recovery,
        weightKg: payload.weightKg || updated.recovery.weightKg,
        bodyFatPercent: payload.bodyFatPercent || updated.recovery.bodyFatPercent,
        restingHeartRateBpm: payload.rhr || updated.recovery.restingHeartRateBpm,
      };
      break;
    }

    // 5. Gamification & XP
    case "AWARD_XP": {
      const gained = payload.xp || 100;
      let newXp = updated.gamification.currentXp + gained;
      let level = updated.gamification.level;
      if (newXp >= updated.gamification.targetXp) {
        level += 1;
        newXp = newXp - updated.gamification.targetXp;
      }
      updated.gamification = {
        ...updated.gamification,
        currentXp: newXp,
        level,
      };
      break;
    }

    // 6. Data Sovereignty & State History
    case "IMPORT_JSON_STATE": {
      if (payload.state) {
        try {
          const parsed = typeof payload.state === "string" ? JSON.parse(payload.state) : payload.state;
          updated = { ...parsed };
        } catch (e) {}
      }
      break;
    }

    // 7. Modals
    case "OPEN_MEAL_PLAN_REVIEW": {
      updated.ux = {
        ...updated.ux,
        mealPlanReview: {
          isOpen: true,
          recommendations: payload.recommendations || []
        }
      };
      break;
    }

    case "CLOSE_MEAL_PLAN_REVIEW": {
      updated.ux = {
        ...updated.ux,
        mealPlanReview: {
          ...updated.ux.mealPlanReview,
          isOpen: false
        }
      };
      break;
    }

    default:
      console.warn(`[dispatchAIAction] Unknown action type: ${type}`);
  }

  // Push snapshot for undo history
  const snapshot: AppStateSnapshot = {
    timestamp: Date.now(),
    description: `Action: ${type}`,
    state: prevSnapshot,
  };

  updated.historySnapshots = [...(updated.historySnapshots || []).slice(-10), snapshot];
  updated.historyIndex = updated.historySnapshots.length - 1;

  currentState = updated;
  notifyListeners();
  return currentState;
}

// Reset/Export helper functions
export function getAppStateJSON(): string {
  return JSON.stringify(currentState, null, 2);
}
