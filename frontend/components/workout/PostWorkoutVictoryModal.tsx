"use client";

import React, { useEffect } from "react";
import { useWorkoutStore } from "@/store/useWorkoutStore";
import { useGamificationStore } from "@/store/useGamificationStore";
import { MascotVector } from "@/components/atomic/MascotVector";
import { Button3D } from "@/components/atomic/Button3D";
import { PillBadge } from "@/components/atomic/PillBadge";
import { soundscape } from "@/lib/soundscapeEngine";
import confetti from "canvas-confetti";
import { Trophy, Zap, Coins, Clock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export const PostWorkoutVictoryModal: React.FC = () => {
  const { showVictoryModal, closeVictoryModal } = useWorkoutStore();
  const { addXP } = useGamificationStore();
  const router = useRouter();

  useEffect(() => {
    if (showVictoryModal) {
      soundscape.playVictoryFanfare();
      addXP(450);
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#58CC02", "#FFC800", "#1CB0F6", "#CE82FF"],
      });
    }
  }, [showVictoryModal, addXP]);

  if (!showVictoryModal) return null;

  const handleClaim = () => {
    closeVictoryModal();
    router.push("/skill-tree");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-smooth-reveal">
      <div className="flex flex-col items-center gap-5 max-w-sm w-full duo-card p-6 bg-slate-900 border-2 border-emerald-500/40 relative overflow-hidden shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
          <Trophy className="w-9 h-9" />
        </div>

        <div className="flex flex-col items-center">
          <PillBadge variant="green" icon={<Sparkles className="w-3.5 h-3.5" />}>
            Mission Accomplished!
          </PillBadge>
          <h2 className="text-2xl font-black text-white mt-2 tracking-tight">
            Upper Body Superiority
          </h2>
          <p className="text-xs font-semibold text-slate-300 mt-1">
            You completed 11 sets with 100% Form Guard adherence!
          </p>
        </div>

        <MascotVector mood="celebratory" size={110} />

        <div className="grid grid-cols-2 gap-3 w-full my-1">
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">XP Claimed</span>
            <div className="flex items-center gap-1 text-emerald-400 font-black text-lg mt-0.5">
              <Zap className="w-4 h-4 fill-emerald-400" /> +450 XP
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Coins Earned</span>
            <div className="flex items-center gap-1 text-amber-400 font-black text-lg mt-0.5">
              <Coins className="w-4 h-4 fill-amber-400" /> +120
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-bold w-full justify-center">
          <Clock className="w-4 h-4 text-sky-400" /> Recovery ETA: 24h to Full Supercompensation
        </div>

        <Button3D variant="gold" fullWidth onClick={handleClaim} className="mt-1">
          Claim Rewards & Visit Skill Tree
        </Button3D>
      </div>
    </div>
  );
};
