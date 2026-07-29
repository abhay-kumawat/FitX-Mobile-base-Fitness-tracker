"use client";

import React from "react";
import { MascotBubble } from "@/components/atomic/MascotBubble";
import { Button3D } from "@/components/atomic/Button3D";
import { PillBadge } from "@/components/atomic/PillBadge";
import { useRouter } from "next/navigation";
import { soundscape } from "@/lib/soundscapeEngine";
import confetti from "canvas-confetti";
import { Dumbbell, Target, Flame, ArrowRight } from "lucide-react";

export const HeroMissionSection: React.FC = () => {
  const router = useRouter();

  const handleStartMission = (e: React.MouseEvent) => {
    soundscape.playVictoryFanfare();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    confetti({
      particleCount: 50,
      spread: 80,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
    });
    router.push("/workout");
  };

  return (
    <div className="flex flex-col gap-5">
      <MascotBubble
        dialogue="100% Charged & Autonomic System Primed! Today's mission is Upper Body Hypertrophy."
        mood="pumped"
        moodTag="Flexy: Ready to Crush"
      />

      {/* Hero Mission Card */}
      <div className="hero-card p-6 flex flex-col gap-4 relative overflow-hidden shadow-md">
        <div className="flex items-center justify-between">
          <PillBadge variant="green" icon={<Target className="w-3.5 h-3.5" />}>
            Today's Primary Target
          </PillBadge>
          <PillBadge variant="gold" icon={<Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}>
            12 Day Streak
          </PillBadge>
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Upper Body Hypertrophy Phase 2
          </h2>
          <p className="text-xs font-bold text-slate-600 mt-1">
            Focus: Incline Barbell Bench, Chest Dips & Cable Lateral Raises (45 min)
          </p>
        </div>

        <div className="grid grid-cols-3 gap-1 sm:gap-2 pt-1 border-t border-slate-200 text-center min-w-0 max-w-full">
          <div className="bg-white/80 p-1 sm:p-2 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
            <span className="text-[8.5px] sm:text-[9px] font-extrabold text-slate-500 block uppercase truncate">Est. Volume</span>
            <span className="text-xs sm:text-sm font-black text-emerald-700 block truncate">4,250 kg</span>
          </div>
          <div className="bg-white/80 p-1 sm:p-2 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
            <span className="text-[8.5px] sm:text-[9px] font-extrabold text-slate-500 block uppercase truncate">Target XP</span>
            <span className="text-xs sm:text-sm font-black text-amber-600 block truncate">+450 XP</span>
          </div>
          <div className="bg-white/80 p-1 sm:p-2 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
            <span className="text-[8.5px] sm:text-[9px] font-extrabold text-slate-500 block uppercase truncate">Rest Window</span>
            <span className="text-xs sm:text-sm font-black text-sky-700 block truncate">90s / set</span>
          </div>
        </div>

        <Button3D variant="green" fullWidth onClick={handleStartMission} className="mt-2 text-sm">
          <Dumbbell className="w-5 h-5" /> Start Mission <ArrowRight className="w-4 h-4 ml-auto" />
        </Button3D>
      </div>
    </div>
  );
};
