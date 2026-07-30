import { create } from "zustand";

export interface LoggedSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  type: "warmup" | "work";
}

export interface ExerciseItem {
  id: string;
  name: string;
  muscleTag: string;
  formGuard: string;
  tips: string[];
  targetSets: number;
  sets: LoggedSet[];
}

interface WorkoutState {
  isWorkoutActive: boolean;
  currentExerciseIndex: number;
  exercises: ExerciseItem[];
  restCountdownSeconds: number;
  isRestActive: boolean;
  showWarmupModal: boolean;
  showPlateModal: boolean;
  showVictoryModal: boolean;
  selectedWeightForPlate: number;

  startWorkout: () => void;
  toggleSetComplete: (exerciseId: string, setIndex: number) => void;
  updateSetInput: (exerciseId: string, setIndex: number, weightKg: number, reps: number) => void;
  nextExercise: () => void;
  previousExercise: () => void;
  startRestTimer: (seconds?: number) => void;
  stopRestTimer: () => void;
  tickRestTimer: () => void;
  toggleWarmupModal: (show?: boolean) => void;
  openPlateModal: (weightKg: number) => void;
  closePlateModal: () => void;
  addExercise: (exercise: any) => void;
  removeExercise: (exerciseId: string) => void;
  reorderExercises: (startIndex: number, endIndex: number) => void;
  finishWorkout: () => void;
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
  currentExerciseIndex: 0,
  exercises: initialExercises,
  restCountdownSeconds: 90,
  isRestActive: false,
  showWarmupModal: false,
  showPlateModal: false,
  showVictoryModal: false,
  selectedWeightForPlate: 80,

  startWorkout: () => set({ isWorkoutActive: true, currentExerciseIndex: 0 }),
  
  toggleSetComplete: (exerciseId, setIndex) => {
    set((state) => {
      const updatedExercises = state.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const newSets = ex.sets.map((s, idx) => {
          if (idx !== setIndex) return s;
          return { ...s, completed: !s.completed };
        });
        return { ...ex, sets: newSets };
      });
      return { exercises: updatedExercises };
    });
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

  addExercise: (ex) => {
    set((state) => {
      const newExercise: ExerciseItem = {
        id: ex.id || Date.now().toString(),
        name: ex.name,
        muscleTag: ex.primary_muscle || "General",
        formGuard: "Form Guard: Focus on technique",
        tips: ex.instructions || ["Maintain proper form"],
        targetSets: 3,
        sets: [
          { setNumber: 1, weightKg: 0, reps: 10, completed: false, type: "work" },
          { setNumber: 2, weightKg: 0, reps: 10, completed: false, type: "work" },
          { setNumber: 3, weightKg: 0, reps: 10, completed: false, type: "work" }
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
  
  finishWorkout: () => set({ isWorkoutActive: false, showVictoryModal: true }),
  closeVictoryModal: () => set({ showVictoryModal: false }),
}));
