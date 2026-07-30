"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Activity, Zap, Heart, Brain, Flame, Shield, Footprints } from "lucide-react";
import { ProgressBar } from "@/components/atomic/ProgressBar";

interface GrowthTreeStats {
  level: number;
  strength_level: number;
  endurance_level: number;
  mobility_level: number;
  nutrition_level: number;
  recovery_level: number;
  consistency_level: number;
  mental_resilience_level: number;
  discipline_level: number;
  cardiovascular_health_level: number;
}

export function GrowthTreeTab() {
  const [stats, setStats] = useState<GrowthTreeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from /api/growth/tree
    // Mocking response for now based on the backend schema
    setTimeout(() => {
      setStats({
        level: 24,
        strength_level: 42,
        endurance_level: 30,
        mobility_level: 18,
        nutrition_level: 65,
        recovery_level: 55,
        consistency_level: 80,
        mental_resilience_level: 70,
        discipline_level: 75,
        cardiovascular_health_level: 40,
      });
      setLoading(false);
    }, 800);
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500 animate-pulse">Analyzing physiological data...</p>
      </div>
    );
  }

  const branches = [
    { name: "Strength", level: stats.strength_level, icon: <Trophy className="w-5 h-5 text-amber-500" />, color: "bg-amber-500" },
    { name: "Endurance", level: stats.endurance_level, icon: <Activity className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-500" },
    { name: "Mobility", level: stats.mobility_level, icon: <Footprints className="w-5 h-5 text-blue-500" />, color: "bg-blue-500" },
    { name: "Cardio", level: stats.cardiovascular_health_level, icon: <Heart className="w-5 h-5 text-rose-500" />, color: "bg-rose-500" },
    { name: "Nutrition", level: stats.nutrition_level, icon: <Flame className="w-5 h-5 text-orange-500" />, color: "bg-orange-500" },
    { name: "Recovery", level: stats.recovery_level, icon: <Shield className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-500" },
    { name: "Consistency", level: stats.consistency_level, icon: <Zap className="w-5 h-5 text-yellow-500" />, color: "bg-yellow-500" },
    { name: "Discipline", level: stats.discipline_level, icon: <Brain className="w-5 h-5 text-purple-500" />, color: "bg-purple-500" },
  ];

  return (
    <div className="flex flex-col gap-6 animate-smooth-reveal">
      <div className="duo-card p-6 bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col items-center text-center">
        <h2 className="text-sm font-bold text-emerald-300 tracking-widest uppercase mb-1">Athlete Level</h2>
        <div className="text-6xl font-black mb-2">{stats.level}</div>
        <p className="text-xs text-slate-300 max-w-[280px]">Levels are derived dynamically from your training volume, consistency, and biological recovery.</p>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-black text-slate-900 px-1">Physiological Branches</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {branches.map((b, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl bg-slate-50 border border-slate-100`}>
                    {b.icon}
                  </div>
                  <span className="font-bold text-slate-800">{b.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">Lvl {b.level}</span>
              </div>
              <ProgressBar progress={b.level} height={6} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
