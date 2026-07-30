"use client";

import React, { useState, useEffect } from "react";
import { useGamificationStore } from "@/store/useGamificationStore";
import { HeroMissionSection } from "@/components/organisms/HeroMissionSection";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { QuestRow } from "@/components/atomic/QuestRow";
import { PillBadge } from "@/components/atomic/PillBadge";
import { ProgressBar } from "@/components/atomic/ProgressBar";
import Link from "next/link";
import { 
  Flame, 
  Search, 
  Trophy, 
  Activity, 
  Clock, 
  Utensils, 
  BookOpen, 
  Sparkles, 
  Cpu, 
  Calendar, 
  Layers, 
  ArrowRight,
  Zap,
  Dumbbell,
  Globe
} from "lucide-react";

export default function HomeHubPage() {
  const { level = 5, xp = 2450, streakDays = 12, quests = [] } = useGamificationStore();
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
  const activeQuests = (quests || []).slice(0, 3);

  const featureLaunchers = [
    { name: "Platform Landing Page", desc: "Showcase Hero, Google Auth 2FA & Pricing", href: "/landing", icon: Globe, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { name: "Overload Workouts", desc: "Form Guard & Set Tracker", href: "/workout", icon: Dumbbell, color: "text-teal-600 bg-teal-50 border-teal-200" },
    { name: "HPE Recovery Sanctuary", desc: "180px HRV Ring & 4-7-8 Pacer", href: "/recovery", icon: Zap, color: "text-sky-600 bg-sky-50 border-sky-200" },
    { name: "Smart Meal & Todo Tracker", desc: "Todo Checklist, Scientific Macros & Hydration Engine", href: "/meal-planner", icon: Utensils, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { name: "Skill Tree & Wardrobe", desc: "Flexy Costume Shop & Badges", href: "/skill-tree", icon: Trophy, color: "text-purple-600 bg-purple-50 border-purple-200" },
    { name: "AI Exercise Graph", desc: "Taxonomy & Biomechanical Safety", href: "/exercises", icon: BookOpen, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { name: "AI Coach Chat (RAG)", desc: "Evidence Level I-V Knowledge Graph", href: "/coach", icon: Sparkles, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    { name: "Digital Twin Avatar", desc: "13-Layer Engine & Scenario Simulator", href: "/profile", icon: Cpu, color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  ];

  return (
    <div className="flex flex-col gap-6 pb-28 animate-smooth-reveal">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl duo-card bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black text-sm shadow-xs">
            L{level}
          </div>
          <div className="flex flex-col w-28 sm:w-36">
            <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-500">
              <span>LEVEL {level}</span>
              <span>{xpInLevel}/1000 XP</span>
            </div>
            <ProgressBar progress={levelProgress} height={6} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PillBadge variant="gold" icon={<Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />}>
            {streakDays}d Streak
          </PillBadge>

          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors"
            title="Search (Cmd+K)"
          >
            <Search className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* Hero Mission Section */}
      <HeroMissionSection />

      {/* UI/UX Theme Switcher */}
      <ThemeSwitcher />

      {/* Feature Hub Quick Launchers Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-emerald-600" /> Platform Feature Hubs
          </h3>
          <span className="text-xs font-bold text-slate-500">8 Integrated Services</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 min-w-0">
          {featureLaunchers.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500/50 flex flex-col gap-2 shadow-xs transition-all hover:scale-[1.02] active:scale-98 group min-w-0"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${item.color}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] sm:text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 flex items-center justify-between gap-1 min-w-0">
                    <span className="truncate">{item.name}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                  </h4>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-tight line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Daily Quests Container */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" /> Daily Quests
          </h3>
          <PillBadge variant="gold">
            Earn Coins
          </PillBadge>
        </div>

        <div className="flex flex-col gap-2.5">
          {activeQuests.map((quest) => (
            <QuestRow key={quest.id} quest={quest} />
          ))}
        </div>
      </div>

      {/* Vital Metrics Gauges */}
      <div className="grid grid-cols-2 gap-3">
        <div className="duo-card p-4 bg-white border border-slate-200 flex flex-col gap-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase">Energy Burned</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl font-black text-slate-900">420 kcal</span>
          <ProgressBar progress={70} height={4} />
        </div>

        <div className="duo-card p-4 bg-white border border-slate-200 flex flex-col gap-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase">Active Play Time</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <span className="text-xl font-black text-slate-900">45 min</span>
          <ProgressBar progress={85} height={4} />
        </div>
      </div>

      {/* Streak Milestone Celebration Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-100/60 to-orange-50 border border-amber-200 flex items-center gap-3 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl shrink-0">
          🔥
        </div>
        <div>
          <h4 className="text-xs font-black text-amber-900">12-Day Streak Shield Protection Active</h4>
          <p className="text-[11px] font-bold text-slate-600 mt-0.5">
            Your streak is safe! Missed days will automatically draw from your Streak Shield reserve.
          </p>
        </div>
      </div>
    </div>
  );
}
