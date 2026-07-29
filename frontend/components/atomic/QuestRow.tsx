"use client";

import React from "react";
import { QuestItem, useGamificationStore } from "@/store/useGamificationStore";
import { Button3D } from "./Button3D";
import { PillBadge } from "./PillBadge";
import { ProgressBar } from "./ProgressBar";
import { soundscape } from "@/lib/soundscapeEngine";
import confetti from "canvas-confetti";
import { CheckCircle2, Zap, Coins } from "lucide-react";

interface QuestRowProps {
  quest: QuestItem;
}

export const QuestRow: React.FC<QuestRowProps> = ({ quest }) => {
  const { claimedQuests, claimQuest } = useGamificationStore();
  const isClaimed = claimedQuests[quest.id];
  const isCompleted = quest.progress >= quest.target;

  const handleClaim = (e: React.MouseEvent) => {
    claimQuest(quest.id, quest.xpReward, quest.coinReward);
    soundscape.playVictoryFanfare();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    confetti({
      particleCount: 40,
      spread: 70,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
    });
  };

  return (
    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-2.5 shadow-xs max-w-full overflow-hidden">
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4 className="text-xs font-black text-slate-900 truncate">{quest.title}</h4>
            <PillBadge variant={quest.category === "daily" ? "blue" : "purple"} className="shrink-0">
              {quest.category}
            </PillBadge>
          </div>
          <p className="text-[11px] font-bold text-slate-500">
            {quest.progress} / {quest.target} completed
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <PillBadge variant="green" icon={<Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />}>
            +{quest.xpReward} XP
          </PillBadge>
          <PillBadge variant="gold" icon={<Coins className="w-3 h-3 text-amber-600 fill-amber-600" />}>
            +{quest.coinReward}
          </PillBadge>
        </div>
      </div>

      <ProgressBar progress={(quest.progress / quest.target) * 100} height={8} />

      <div className="flex justify-end pt-1">
        {isClaimed ? (
          <span className="flex items-center gap-1 text-xs font-black text-emerald-600">
            <CheckCircle2 className="w-4 h-4" /> Claimed
          </span>
        ) : isCompleted ? (
          <Button3D variant="gold" onClick={handleClaim} className="text-xs py-2 px-4">
            Claim Rewards
          </Button3D>
        ) : (
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">In Progress</span>
        )}
      </div>
    </div>
  );
};
