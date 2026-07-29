// LocalStorage Session State Auto-Save & Recovery Manager
export interface SetLog {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  timestamp?: number;
}

export interface ExerciseState {
  id: string;
  name: string;
  muscles: string;
  targetSets: number;
  reps: string;
  weightKg: number;
  safetyNote: string;
  setsLog: SetLog[];
  isBodyweightAlt?: boolean;
  supersetGroup?: string;
}

export interface WorkoutSessionState {
  sessionId: string;
  routineTitle: string;
  energyLevel: number; // 30, 70, 100
  isTimeCrunched: boolean;
  isZenMode: boolean;
  nightMode: boolean;
  elapsedSeconds: number;
  exercises: ExerciseState[];
  currentExerciseIndex: number;
  lastUpdated: number;
}

const FITX_WORKOUT_SESSION_KEY = "fitx_active_workout_session_v1";

export const storage = {
  saveSession(state: WorkoutSessionState) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(FITX_WORKOUT_SESSION_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("FitX Storage: Failed to save workout session", e);
    }
  },

  loadSession(): WorkoutSessionState | null {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem(FITX_WORKOUT_SESSION_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      // Auto-expire session if older than 12 hours
      if (Date.now() - parsed.lastUpdated > 12 * 60 * 60 * 1000) {
        this.clearSession();
        return null;
      }
      return parsed;
    } catch (e) {
      console.warn("FitX Storage: Failed to parse workout session", e);
      return null;
    }
  },

  clearSession() {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(FITX_WORKOUT_SESSION_KEY);
    } catch (e) {
      console.warn("FitX Storage: Failed to clear session", e);
    }
  }
};
