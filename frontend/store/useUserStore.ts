import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  name: string;
  fitnessLevel?: "Beginner" | "Intermediate" | "Advanced" | "Athlete";
  primaryGoal?: "Build Muscle" | "Burn Fat" | "Build Habit" | "Athletic Power";
  weightKg?: number;
  heightCm?: number;
  injuries: string[];
  equipment: string[];
  hrvScore?: number;
  readinessPct?: number;
}

interface UserState {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  toggleInjury: (injury: string) => void;
  toggleEquipment: (equip: string) => void;
}

const defaultProfile: UserProfile = {
  name: "User",
  injuries: [],
  equipment: ["Barbell", "Dumbbells", "Cable Machine", "Pull-Up Bar"],
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      updateProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),
      toggleInjury: (injury) =>
        set((state) => {
          const current = state.profile?.injuries || [];
          const updated = current.includes(injury)
            ? current.filter((i) => i !== injury)
            : [...current, injury];
          return { profile: { ...state.profile, injuries: updated } };
        }),
      toggleEquipment: (equip) =>
        set((state) => {
          const current = state.profile?.equipment || [];
          const updated = current.includes(equip)
            ? current.filter((e) => e !== equip)
            : [...current, equip];
          return { profile: { ...state.profile, equipment: updated } };
        }),
    }),
    {
      name: "fitx_user_store_v4",
    }
  )
);
