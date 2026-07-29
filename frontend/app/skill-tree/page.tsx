"use client";

import React, { useState, useEffect } from "react";
import { useGamificationStore } from "@/store/useGamificationStore";
import { MascotVector } from "@/components/atomic/MascotVector";
import { PillBadge } from "@/components/atomic/PillBadge";
import { Button3D } from "@/components/atomic/Button3D";
import { QuestRow } from "@/components/atomic/QuestRow";
import { BadgeTile } from "@/components/atomic/BadgeTile";
import { ProgressBar } from "@/components/atomic/ProgressBar";
import { soundscape } from "@/lib/soundscapeEngine";
import { Trophy, Coins, Zap, Shield, Crown, Shirt } from "lucide-react";

export default function SkillTreePage() {
  const {
    level = 5,
    xp = 2450,
    coins = 380,
    streakShieldActive = true,
    activeCostume = "sweatband",
    setCostume,
    toggleStreakShield,
    quests = [],
    badges = [],
  } = useGamificationStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const xpInLevel = (xp || 0) % 1000;
  const levelProgress = (xpInLevel / 1000) * 100;

  const costumes: Array<{
    id: "none" | "sweatband" | "crown" | "cape";
    name: string;
    icon: string;
    cost: number;
  }> = [
    { id: "none", name: "Classic Flexy", icon: "🟢", cost: 0 },
    { id: "sweatband", name: "Red Sweatband", icon: "🎗️", cost: 100 },
    { id: "crown", name: "Golden Crown", icon: "👑", cost: 250 },
    { id: "cape", name: "Superhero Cape", icon: "🦸", cost: 400 },
  ];

  return (
    <div className="flex flex-col gap-6 pb-28 animate-smooth-reveal">
      {/* Level & Total XP Status Header */}
      <div className="duo-card p-5 bg-white border border-slate-200 flex flex-col gap-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-black text-slate-900">Level & XP Progression</h2>
          </div>
          <PillBadge variant="gold" icon={<Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}>
            {coins} Coins
          </PillBadge>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-black text-lg shadow-xs">
            L{level}
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Level {level} Master</span>
              <span className="text-emerald-600 font-black">{xp} Total XP</span>
            </div>
            <ProgressBar progress={levelProgress} height={8} />
          </div>
        </div>
      </div>

      {/* Flexy Wardrobe Shop */}
      <div className="duo-card p-5 bg-white border border-slate-200 flex flex-col gap-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Shirt className="w-4 h-4 text-emerald-600" /> Flexy Wardrobe Shop
          </h3>
          <PillBadge variant="green">Equipped: {activeCostume}</PillBadge>
        </div>

        <div className="flex items-center justify-center bg-slate-50 p-4 rounded-2xl border border-slate-200 relative">
          <MascotVector mood="celebratory" size={130} />
        </div>

        <div className="grid grid-cols-2 gap-2 min-w-0 max-w-full">
          {costumes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                soundscape.playTapSound();
                if (setCostume) setCostume(item.id);
              }}
              className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all min-w-0 ${
                activeCostume === item.id
                  ? "bg-emerald-50 border-emerald-500 text-slate-900 shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                <span className="text-lg shrink-0">{item.icon}</span>
                <span className="text-[11px] font-bold text-slate-900 truncate">{item.name}</span>
              </div>
              <span className="text-[10px] font-extrabold text-amber-600 shrink-0 ml-1">
                {item.cost === 0 ? "Free" : `${item.cost} c`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Daily & Weekly Quest Hub */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Quests & Challenges
          </h3>
          <span className="text-xs font-bold text-slate-500">{(quests || []).length} Active</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {(quests || []).map((quest) => (
            <QuestRow key={quest.id} quest={quest} />
          ))}
        </div>
      </div>

      {/* Enamel Milestone Badge Cabinet */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Crown className="w-4 h-4 text-purple-600" /> Enamel Milestone Badge Cabinet
          </h3>
          <PillBadge variant="purple">3D Pins</PillBadge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(badges || []).map((badge) => (
            <BadgeTile key={badge.id} badge={badge} />
          ))}
        </div>
      </div>

      {/* Streak Shield Protection System */}
      <div className="duo-card p-5 bg-white border border-slate-200 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">Streak Shield Protection</h4>
            <p className="text-[10px] font-bold text-slate-500 mt-0.5">
              {streakShieldActive ? "Protection Armed & Active" : "Shield Standby"}
            </p>
          </div>
        </div>

        <Button3D
          variant={streakShieldActive ? "gold" : "secondary"}
          onClick={() => {
            soundscape.playTapSound();
            if (toggleStreakShield) toggleStreakShield();
          }}
          className="text-xs py-2 px-3"
        >
          {streakShieldActive ? "Armed" : "Enable"}
        </Button3D>
      </div>
    </div>
  );
}
