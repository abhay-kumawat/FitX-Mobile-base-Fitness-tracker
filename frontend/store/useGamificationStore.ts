import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QuestItem {
  id: string;
  title: string;
  category: "daily" | "weekly";
  xpReward: number;
  coinReward: number;
  progress: number;
  target: number;
}

export interface BadgeItem {
  id: string;
  title: string;
  icon: string;
  description: string;
  tier: "gold" | "silver" | "bronze" | "diamond";
  unlocked: boolean;
}

interface GamificationState {
  xp: number;
  level: number;
  coins: number;
  streakDays: number;
  streakShieldActive: boolean;
  activeCostume: "none" | "sweatband" | "crown" | "cape";
  claimedQuests: Record<string, boolean>;
  quests: QuestItem[];
  badges: BadgeItem[];
  addXP: (amount: number) => void;
  claimQuest: (questId: string, xpReward: number, coinReward: number) => void;
  setCostume: (costume: "none" | "sweatband" | "crown" | "cape") => void;
  toggleStreakShield: () => void;
}

const defaultQuests: QuestItem[] = [
  { id: "q1", title: "Complete Upper Body Target", category: "daily", xpReward: 150, coinReward: 50, progress: 1, target: 1 },
  { id: "q2", title: "Maintain 4-7-8 Breathing Pacer", category: "daily", xpReward: 100, coinReward: 30, progress: 1, target: 1 },
  { id: "q3", title: "Log 5 Sets with Form Guard", category: "daily", xpReward: 200, coinReward: 60, progress: 3, target: 5 },
  { id: "q4", title: "Achieve 7-Day Workout Streak", category: "weekly", xpReward: 500, coinReward: 150, progress: 7, target: 7 },
  { id: "q5", title: "Master Deload & HRV Sanctuary", category: "weekly", xpReward: 350, coinReward: 100, progress: 2, target: 3 },
];

const defaultBadges: BadgeItem[] = [
  { id: "b1", title: "Iron Pioneer", icon: "⚡", description: "Completed 10 Perfect Sets with Flexy", tier: "bronze", unlocked: true },
  { id: "b2", title: "Streak Master", icon: "🔥", description: "Reached 12-Day Consecutive Active Streak", tier: "gold", unlocked: true },
  { id: "b3", title: "HRV Guardian", icon: "💙", description: "Achieved 95%+ Autonomic Readiness Score", tier: "diamond", unlocked: true },
  { id: "b4", title: "Plate Crusher", icon: "🏋️", description: "Lifted over 4,000kg cumulative volume", tier: "silver", unlocked: true },
  { id: "b5", title: "Digital Twin Champion", icon: "👑", description: "Unlocked 13-Layer Scenario Simulation", tier: "diamond", unlocked: false },
];

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set) => ({
      xp: 2450,
      level: 5,
      coins: 380,
      streakDays: 12,
      streakShieldActive: true,
      activeCostume: "sweatband",
      claimedQuests: { q1: false },
      quests: defaultQuests,
      badges: defaultBadges,
      addXP: (amount) =>
        set((state) => {
          const newXP = state.xp + amount;
          const newLevel = Math.floor(newXP / 1000) + 1;
          return { xp: newXP, level: newLevel };
        }),
      claimQuest: (questId, xpReward, coinReward) =>
        set((state) => ({
          claimedQuests: { ...state.claimedQuests, [questId]: true },
          xp: state.xp + xpReward,
          coins: state.coins + coinReward,
        })),
      setCostume: (costume) => set({ activeCostume: costume }),
      toggleStreakShield: () => set((state) => ({ streakShieldActive: !state.streakShieldActive })),
    }),
    {
      name: "fitx_gamification_store",
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<GamificationState>),
        quests: (persistedState as GamificationState)?.quests || currentState.quests,
        badges: (persistedState as GamificationState)?.badges || currentState.badges,
      }),
    }
  )
);
