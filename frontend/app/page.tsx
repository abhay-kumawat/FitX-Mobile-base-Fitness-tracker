"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthFlowContainer } from "@/components/auth/AuthFlowContainer";
import { useAuthContext } from "@/context/AuthContext";
import { soundscape } from "@/lib/soundscapeEngine";
import { 
  Flame, 
  Dumbbell, 
  Target, 
  ArrowRight, 
  CheckCircle2, 
  User,
  ShieldCheck,
  Crown
} from "lucide-react";

export default function WebsiteLandingPage() {
  const router = useRouter();
  const { isAuthenticated, userProfile, logout } = useAuthContext();

  const handleStartMission = () => {
    soundscape.playTapSound();
    if (!isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/workout");
    }
  };

  return (
    <div className="w-full max-w-full flex flex-col gap-6 pb-28 text-slate-900 font-sans p-1 sm:p-2 animate-smooth-reveal min-w-0 overflow-x-hidden">
      {/* Top Header: Logo & User Status */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-1">
          <span className="text-2xl font-black text-slate-900 tracking-tight">Fit</span>
          <span className="text-2xl font-black text-emerald-500 tracking-tight">x</span>
        </div>
        
        {isAuthenticated && userProfile && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">
              Hi, {userProfile.fullName.split(" ")[0]}
            </span>
            <button
              onClick={() => {
                soundscape.playTapSound();
                logout();
              }}
              className="text-[10px] font-extrabold text-rose-600 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 shrink-0 hover:bg-rose-100 transition-colors"
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      {/* Headline & Badges */}
      <div className="space-y-3 px-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 leading-tight">
          Stronger Today, <br />
          <span className="text-emerald-500">Better Tomorrow.</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Track your workouts, follow nutrition plans and achieve your fitness goals.
        </p>

        {/* Target & Streak Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black shrink-0">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>Today's Primary Target</span>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black shrink-0">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{userProfile?.streak || 1} Day Streak</span>
          </div>
        </div>
      </div>

      {/* Redesigned FitX Authentication Flow */}
      <div className="w-full min-w-0">
        <AuthFlowContainer initialScreen="welcome" />
      </div>

      {/* Athlete Hero Graphic & Overlay Mission Card */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 bg-slate-900 shadow-xl min-h-[340px] flex flex-col justify-end p-3.5 sm:p-5 group w-full min-w-0">
        {/* Athlete Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero_athlete.png"
            alt="Fitness Athlete"
            className="w-full h-full object-cover object-center opacity-85 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        </div>

        {/* Floating Mission Overlay Box */}
        <div className="relative z-10 p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl space-y-2.5 w-full min-w-0">
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-950 leading-snug">
              Upper Body Hypertrophy Phase 2
            </h3>
            <p className="text-[10px] text-slate-600 font-medium leading-snug mt-0.5">
              Focus: Incline Barbell Bench, Chest Dips & Cable Lateral Raises (45 min)
            </p>
          </div>

          {/* 3 Metric Stat Pills */}
          <div className="grid grid-cols-3 gap-1.5 text-center pt-1 min-w-0">
            <div className="p-1.5 rounded-xl bg-slate-100/90 border border-slate-200/80 min-w-0">
              <span className="text-[8px] font-black text-slate-400 uppercase block truncate">EST. VOLUME</span>
              <span className="text-[11px] font-black text-emerald-600 mt-0.5 block truncate">4,250 kg</span>
            </div>

            <div className="p-1.5 rounded-xl bg-slate-100/90 border border-slate-200/80 min-w-0">
              <span className="text-[8px] font-black text-slate-400 uppercase block truncate">TARGET XP</span>
              <span className="text-[11px] font-black text-amber-600 mt-0.5 block truncate">+450 XP</span>
            </div>

            <div className="p-1.5 rounded-xl bg-slate-100/90 border border-slate-200/80 min-w-0">
              <span className="text-[8px] font-black text-slate-400 uppercase block truncate">REST WINDOW</span>
              <span className="text-[11px] font-black text-sky-600 mt-0.5 block truncate">90s / set</span>
            </div>
          </div>

          {/* Start Mission Button */}
          <button
            type="button"
            onClick={handleStartMission}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition-all shrink-0"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>START MISSION</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-semibold gap-1.5">
        <div>
          © 2026 <span className="font-black text-slate-900">Fit</span> <span className="font-black text-emerald-500">x</span>
        </div>
        <div>
          Train Smart. Stay Consistent. <span className="text-emerald-600 font-bold">Get Results.</span>
        </div>
      </footer>
    </div>
  );
}
