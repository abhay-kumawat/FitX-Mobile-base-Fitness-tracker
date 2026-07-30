import { create } from "zustand";
import { fitxAPI } from "@/lib/api";

export interface LoggedSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  type: "warmup" | "work" | "failure" | "dropset";
  failureReason?: string;
  painLevel?: number;
  formRating?: number;
  rpe?: number;
}

export interface ExerciseItem {
  id: string;
  name: string;
  muscleTag: string;
  formGuard: string;
  tips: string[];
  targetSets: number;
  sets: LoggedSet[];
  tempo?: string;
  restSeconds?: number;
}

interface WorkoutState {
  isWorkoutActive: boolean;
  activeSessionId: number | null;
  workoutStatus: "idle" | "in_progress" | "paused" | "completed" | "cancelled";
  workoutName: string;
  currentExerciseIndex: number;
  exercises: ExerciseItem[];
  restCountdownSeconds: number;
  isRestActive: boolean;
  showWarmupModal: boolean;
  showPlateModal: boolean;
  showVictoryModal: boolean;
  showReportModal: boolean;
  selectedWeightForPlate: number;
  lastSessionSummary: any;

  // Calendar Scheduling State
  selectedDate: string;
  calendarAssignments: Record<string, any>;
  isCalendarLoading: boolean;
  showAddModal: boolean;
  showContextMenu: boolean;
  activeContextMenuDate: string | null;

  selectDate: (dateStr: string) => Promise<void>;
  fetchCalendarWeek: (startDate: string, endDate: string) => Promise<void>;
  assignToDay: (dateStr: string, assignmentData: any) => Promise<void>;
  saveSelectedDayWorkout: (exercises: ExerciseItem[]) => Promise<void>;
  performDayActionStore: (dateStr: string, action: string, targetDate?: string, payload?: any) => Promise<void>;
  toggleAddModal: (show?: boolean) => void;
  toggleContextMenu: (show?: boolean, dateStr?: string | null) => void;

  syncActiveSession: () => Promise<void>;
  startWorkout: (name?: string) => Promise<void>;
  pauseWorkout: () => Promise<void>;
  resumeWorkout: () => Promise<void>;
  cancelWorkout: (reason?: string) => Promise<void>;
  finishWorkout: (reportData?: any) => Promise<void>;
  
  toggleSetComplete: (exerciseId: string, setIndex: number, extraData?: any) => Promise<void>;
  updateSetInput: (exerciseId: string, setIndex: number, weightKg: number, reps: number) => void;
  skipSet: (exerciseId: string, setIndex: number, reason: string) => Promise<void>;
  skipExercise: (exerciseId: string, reason: string) => Promise<void>;

  nextExercise: () => void;
  previousExercise: () => void;
  startRestTimer: (seconds?: number) => void;
  stopRestTimer: () => void;
  tickRestTimer: () => void;
  
  toggleWarmupModal: (show?: boolean) => void;
  openPlateModal: (weightKg: number) => void;
  closePlateModal: () => void;
  toggleReportModal: (show?: boolean) => void;
  
  addExercise: (exercise: any) => void;
  removeExercise: (exerciseId: string) => void;
  reorderExercises: (startIndex: number, endIndex: number) => void;
  loadPlanIntoActive: (planName: string, exercisesList: ExerciseItem[]) => void;
  closeVictoryModal: () => void;
}


const initialExercises: ExerciseItem[] = [
  {
    id: "ex1",
    name: "Barbell Incline Bench Press",
    muscleTag: "Upper Chest & Anterior Delts",
    formGuard: "Form Guard: Keep Scapula Retracted 30°",
    tips: [
      "Retract shoulders firmly against bench cushion before unrack.",
      "Lower bar smoothly to upper sternum under 2-second control.",
      "Drive feet firmly into floor without arching lower back excessively."
    ],
    targetSets: 4,
    sets: [
      { setNumber: 1, weightKg: 60, reps: 10, completed: true, type: "warmup" },
      { setNumber: 2, weightKg: 80, reps: 8, completed: true, type: "work" },
      { setNumber: 3, weightKg: 85, reps: 8, completed: false, type: "work" },
      { setNumber: 4, weightKg: 85, reps: 6, completed: false, type: "work" },
    ],
  },
  {
    id: "ex2",
    name: "Weighted Chest Dips",
    muscleTag: "Lower Pecs & Triceps Brachii",
    formGuard: "Form Guard: Torso Forward Lean 15°",
    tips: [
      "Lean torso forward slightly to isolate chest fibers over triceps.",
      "Control descent until elbows reach 90 degrees.",
      "Lock out explosively without shrugging shoulders."
    ],
    targetSets: 3,
    sets: [
      { setNumber: 1, weightKg: 15, reps: 10, completed: false, type: "work" },
      { setNumber: 2, weightKg: 20, reps: 8, completed: false, type: "work" },
      { setNumber: 3, weightKg: 20, reps: 8, completed: false, type: "work" },
    ],
  },
  {
    id: "ex3",
    name: "Cable Lateral Raises",
    muscleTag: "Lateral Deltoid Core",
    formGuard: "Form Guard: Lead With Elbows",
    tips: [
      "Position pulley at knee height for continuous tension curve.",
      "Lead upward movement with elbows rather than hands.",
      "Pause for 0.5s at shoulder peak contraction."
    ],
    targetSets: 4,
    sets: [
      { setNumber: 1, weightKg: 12.5, reps: 12, completed: false, type: "work" },
      { setNumber: 2, weightKg: 12.5, reps: 12, completed: false, type: "work" },
      { setNumber: 3, weightKg: 15, reps: 10, completed: false, type: "work" },
      { setNumber: 4, weightKg: 15, reps: 10, completed: false, type: "work" },
    ],
  },
];

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  isWorkoutActive: false,
  activeSessionId: null,
  workoutStatus: "idle",
  workoutName: "Hypertrophy Push Protocol",
  currentExerciseIndex: 0,
  exercises: initialExercises,
  restCountdownSeconds: 90,
  isRestActive: false,
  showWarmupModal: false,
  showPlateModal: false,
  showVictoryModal: false,
  showReportModal: false,
  selectedWeightForPlate: 80,
  lastSessionSummary: null,

  // Calendar Scheduling State
  selectedDate: new Date().toISOString().split("T")[0],
  calendarAssignments: {},
  isCalendarLoading: false,
  showAddModal: false,
  showContextMenu: false,
  activeContextMenuDate: null,

  selectDate: async (dateStr: string) => {
    set({ selectedDate: dateStr });
    const { calendarAssignments } = get();
    const assignment = calendarAssignments[dateStr];
    if (assignment) {
      if (assignment.assignment_type === "rest") {
        set({
          workoutName: "Rest & Active Recovery",
          exercises: [],
          currentExerciseIndex: 0
        });
      } else {
        const exs = assignment.workout_data?.exercises || [];
        set({
          workoutName: assignment.name || "Custom Workout",
          exercises: exs.length > 0 ? exs : initialExercises,
          currentExerciseIndex: 0
        });
      }
    }
  },

  fetchCalendarWeek: async (startDate: string, endDate: string) => {
    set({ isCalendarLoading: true });
    try {
      const res = await fitxAPI.getCalendarAssignments(startDate, endDate);
      const map: Record<string, any> = {};
      if (Array.isArray(res)) {
        res.forEach((item: any) => {
          map[item.planned_date] = item;
        });
      }
      set({ calendarAssignments: map });

      const { selectedDate } = get();
      if (map[selectedDate]) {
        const item = map[selectedDate];
        if (item.assignment_type === "rest") {
          set({ workoutName: "Rest & Active Recovery", exercises: [], currentExerciseIndex: 0 });
        } else if (item.workout_data?.exercises?.length > 0) {
          set({ workoutName: item.name, exercises: item.workout_data.exercises, currentExerciseIndex: 0 });
        }
      }
    } catch (e) {
      console.warn("Failed to fetch calendar assignments", e);
    } finally {
      set({ isCalendarLoading: false });
    }
  },

  assignToDay: async (dateStr: string, assignmentData: any) => {
    try {
      const payload = {
        planned_date: dateStr,
        assignment_type: assignmentData.assignment_type || "workout",
        name: assignmentData.name || "Custom Workout",
        goal: assignmentData.goal || "Hypertrophy",
        template_id: assignmentData.template_id || null,
        workout_data: assignmentData.workout_data || { exercises: [] },
        notes: assignmentData.notes || "",
        completion_status: assignmentData.completion_status || "scheduled"
      };
      
      const res = await fitxAPI.assignCalendarWorkout(payload);
      const updated = res || payload;

      set((state) => {
        const newMap = { ...state.calendarAssignments, [dateStr]: updated };
        const isCurrentSelected = state.selectedDate === dateStr;
        return {
          calendarAssignments: newMap,
          ...(isCurrentSelected ? {
            workoutName: updated.name,
            exercises: updated.workout_data?.exercises || [],
            currentExerciseIndex: 0
          } : {})
        };
      });
    } catch (e) {
      console.warn("Error assigning workout to day", e);
    }
  },

  saveSelectedDayWorkout: async (updatedExercises: ExerciseItem[]) => {
    const { selectedDate, workoutName, calendarAssignments } = get();
    const existing = calendarAssignments[selectedDate] || {};

    const payload = {
      planned_date: selectedDate,
      assignment_type: updatedExercises.length === 0 ? "rest" : "workout",
      name: workoutName || "Custom Workout",
      goal: existing.goal || "Hypertrophy",
      template_id: existing.template_id || null,
      workout_data: { exercises: updatedExercises },
      notes: existing.notes || "",
      completion_status: existing.completion_status || "scheduled"
    };

    set({ exercises: updatedExercises });

    try {
      const res = await fitxAPI.assignCalendarWorkout(payload);
      if (res) {
        set((state) => ({
          calendarAssignments: { ...state.calendarAssignments, [selectedDate]: res }
        }));
      }
    } catch (e) {
      console.warn("Failed to save selected day workout to backend", e);
    }
  },

  performDayActionStore: async (dateStr: string, action: string, targetDate?: string, payload?: any) => {
    try {
      await fitxAPI.performDayAction(dateStr, action, targetDate, payload);
      // Refresh timeline
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const d1 = new Date(today);
      d1.setDate(diff);
      const d2 = new Date(today);
      d2.setDate(diff + 6);
      const start = d1.toISOString().split("T")[0];
      const end = d2.toISOString().split("T")[0];
      await get().fetchCalendarWeek(start, end);
    } catch (e) {
      console.warn(`Day action ${action} failed`, e);
    }
  },

  toggleAddModal: (show) => set((state) => ({ showAddModal: show ?? !state.showAddModal })),
  toggleContextMenu: (show, dateStr) => set((state) => ({
    showContextMenu: show ?? !state.showContextMenu,
    activeContextMenuDate: dateStr !== undefined ? dateStr : state.activeContextMenuDate
  })),

  syncActiveSession: async () => {

    try {
      const active = await fitxAPI.getActiveSession();
      if (active && active.id) {
        set({
          isWorkoutActive: active.status === "in_progress",
          activeSessionId: active.id,
          workoutStatus: active.status,
          workoutName: active.name || "Hypertrophy Push Protocol"
        });
      }
    } catch (e) {
      console.warn("Failed to sync active session", e);
    }
  },

  startWorkout: async (name) => {
    const sessionName = name || get().workoutName;
    try {
      const res = await fitxAPI.startWorkout(sessionName);
      if (res && res.id) {
        set({
          isWorkoutActive: true,
          activeSessionId: res.id,
          workoutStatus: "in_progress",
          workoutName: sessionName,
          currentExerciseIndex: 0
        });
        return;
      }
    } catch (e) {
      console.warn("Start workout API error, fallback to local", e);
    }
    set({
      isWorkoutActive: true,
      activeSessionId: Date.now(),
      workoutStatus: "in_progress",
      workoutName: sessionName,
      currentExerciseIndex: 0
    });
  },

  pauseWorkout: async () => {
    const { activeSessionId } = get();
    if (activeSessionId) {
      try {
        await fitxAPI.pauseSession(activeSessionId);
      } catch (e) { console.warn(e); }
    }
    set({ workoutStatus: "paused" });
  },

  resumeWorkout: async () => {
    const { activeSessionId } = get();
    if (activeSessionId) {
      try {
        await fitxAPI.resumeSession(activeSessionId);
      } catch (e) { console.warn(e); }
    }
    set({ workoutStatus: "in_progress" });
  },

  cancelWorkout: async (reason = "User cancelled") => {
    const { activeSessionId } = get();
    if (activeSessionId) {
      try {
        await fitxAPI.cancelSession(activeSessionId, reason);
      } catch (e) { console.warn(e); }
    }
    set({
      isWorkoutActive: false,
      activeSessionId: null,
      workoutStatus: "cancelled"
    });
  },

  toggleSetComplete: async (exerciseId, setIndex, extraData) => {
    const { exercises, activeSessionId, startRestTimer } = get();
    const ex = exercises.find((e) => e.id === exerciseId);
    if (!ex) return;

    const currentSet = ex.sets[setIndex];
    if (!currentSet) return;

    const newCompleted = !currentSet.completed;

    // Local optimistic update
    const updatedExercises = exercises.map((item) => {
      if (item.id !== exerciseId) return item;
      const newSets = item.sets.map((s, idx) => {
        if (idx !== setIndex) return s;
        return {
          ...s,
          completed: newCompleted,
          failureReason: extraData?.failureReason || s.failureReason,
          painLevel: extraData?.painLevel || s.painLevel,
          formRating: extraData?.formRating || s.formRating
        };
      });
      return { ...item, sets: newSets };
    });

    set({ exercises: updatedExercises });

    if (newCompleted) {
      startRestTimer(ex.restSeconds || 90);
    }

    // Backend sync
    if (activeSessionId && newCompleted) {
      try {
        await fitxAPI.logSet({
          session_id: activeSessionId,
          exercise_name: ex.name,
          set_number: currentSet.setNumber,
          set_type: currentSet.type,
          planned_reps: currentSet.reps,
          reps: extraData?.reps || currentSet.reps,
          target_weight_kg: currentSet.weightKg,
          weight_kg: extraData?.weightKg || currentSet.weightKg,
          failure_reason: extraData?.failureReason || null,
          pain_level: extraData?.painLevel || 0,
          form_rating: extraData?.formRating || 5,
          notes: extraData?.notes || ""
        });
      } catch (e) {
        console.warn("Set log API failed", e);
      }
    }
  },

  updateSetInput: (exerciseId, setIndex, weightKg, reps) => {
    set((state) => {
      const updatedExercises = state.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const newSets = ex.sets.map((s, idx) => {
          if (idx !== setIndex) return s;
          return { ...s, weightKg, reps };
        });
        return { ...ex, sets: newSets };
      });
      return { exercises: updatedExercises };
    });
  },

  skipSet: async (exerciseId, setIndex, reason) => {
    const { exercises, activeSessionId } = get();
    const ex = exercises.find((e) => e.id === exerciseId);
    if (!ex) return;

    const updatedExercises = exercises.map((item) => {
      if (item.id !== exerciseId) return item;
      const newSets = item.sets.map((s, idx) => {
        if (idx !== setIndex) return s;
        return { ...s, completed: false, failureReason: `Skipped: ${reason}` };
      });
      return { ...item, sets: newSets };
    });

    set({ exercises: updatedExercises });

    if (activeSessionId) {
      try {
        await fitxAPI.skipSet(activeSessionId, ex.name, setIndex + 1, reason);
      } catch (e) { console.warn(e); }
    }
  },

  skipExercise: async (exerciseId, reason) => {
    const { exercises, activeSessionId, currentExerciseIndex } = get();
    const ex = exercises.find((e) => e.id === exerciseId);
    if (!ex) return;

    const updatedExercises = exercises.filter((e) => e.id !== exerciseId);
    set({
      exercises: updatedExercises,
      currentExerciseIndex: Math.min(currentExerciseIndex, updatedExercises.length - 1)
    });

    if (activeSessionId) {
      try {
        await fitxAPI.skipExercise(activeSessionId, ex.name, reason);
      } catch (e) { console.warn(e); }
    }
  },

  finishWorkout: async (reportData) => {
    const { activeSessionId, exercises } = get();
    let summary = null;

    let totalVolume = 0;
    let totalSets = 0;
    exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed) {
          totalVolume += s.weightKg * s.reps;
          totalSets += 1;
        }
      });
    });

    if (activeSessionId) {
      try {
        if (reportData) {
          await fitxAPI.submitReport({
            session_id: activeSessionId,
            ...reportData
          });
        }
        const res = await fitxAPI.completeSession(activeSessionId, reportData?.notes || "");
        summary = res;
      } catch (e) {
        console.warn("Complete workout API error", e);
      }
    }

    set({
      isWorkoutActive: false,
      activeSessionId: null,
      workoutStatus: "completed",
      showVictoryModal: true,
      lastSessionSummary: summary || { total_volume_kg: totalVolume, total_sets: totalSets }
    });
  },

  addExercise: (ex) => {
    set((state) => {
      const newExercise: ExerciseItem = {
        id: ex.id || Date.now().toString(),
        name: ex.name,
        muscleTag: ex.primary_muscle || "General Muscle",
        formGuard: "Form Guard: Maintain controlled tempo",
        tips: ex.instructions || ["Maintain proper form and core brace"],
        targetSets: 3,
        sets: [
          { setNumber: 1, weightKg: 20, reps: 10, completed: false, type: "work" },
          { setNumber: 2, weightKg: 25, reps: 10, completed: false, type: "work" },
          { setNumber: 3, weightKg: 25, reps: 10, completed: false, type: "work" }
        ]
      };
      return { exercises: [...state.exercises, newExercise] };
    });
  },

  removeExercise: (exerciseId) => {
    set((state) => ({
      exercises: state.exercises.filter((e) => e.id !== exerciseId)
    }));
  },

  reorderExercises: (startIndex, endIndex) => {
    set((state) => {
      const result = Array.from(state.exercises);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { exercises: result };
    });
  },

  loadPlanIntoActive: (planName, exercisesList) => {
    set({
      workoutName: planName,
      exercises: exercisesList,
      currentExerciseIndex: 0
    });
  },

  nextExercise: () => {
    const { currentExerciseIndex, exercises } = get();
    if (currentExerciseIndex < exercises.length - 1) {
      set({ currentExerciseIndex: currentExerciseIndex + 1 });
    }
  },

  previousExercise: () => {
    const { currentExerciseIndex } = get();
    if (currentExerciseIndex > 0) {
      set({ currentExerciseIndex: currentExerciseIndex - 1 });
    }
  },

  startRestTimer: (seconds = 90) => set({ restCountdownSeconds: seconds, isRestActive: true }),
  stopRestTimer: () => set({ isRestActive: false }),
  tickRestTimer: () => set((state) => {
    if (state.restCountdownSeconds <= 1) {
      return { restCountdownSeconds: 0, isRestActive: false };
    }
    return { restCountdownSeconds: state.restCountdownSeconds - 1 };
  }),

  toggleWarmupModal: (show) => set((state) => ({ showWarmupModal: show ?? !state.showWarmupModal })),
  openPlateModal: (weightKg) => set({ showPlateModal: true, selectedWeightForPlate: weightKg }),
  closePlateModal: () => set({ showPlateModal: false }),
  toggleReportModal: (show) => set((state) => ({ showReportModal: show ?? !state.showReportModal })),
  closeVictoryModal: () => set({ showVictoryModal: false }),
}));
