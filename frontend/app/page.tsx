"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleAuthModal } from "@/components/GoogleAuthModal";
import { useAuthStore } from "@/store/useAuthStore";
import { soundscape } from "@/lib/soundscapeEngine";
import { 
  Flame, 
  Dumbbell, 
  Zap, 
  Utensils, 
  Trophy, 
  BookOpen, 
  Sparkles, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Layers, 
  Lock, 
  Check, 
  ChevronRight,
  UserPlus,
  LogIn,
  LayoutDashboard
} from "lucide-react";

export default function WebsiteLandingPage() {
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  const handleOpenAuth = () => {
    soundscape.playTapSound();
    setAuthModalOpen(true);
  };

  const handleEnterApp = () => {
    soundscape.playTapSound();
    router.push("/dashboard");
  };

  const featureHubs = [
    {
      title: "Adaptive Overload Engine",
      desc: "Dynamically auto-adjusts sets, reps, load, and rest based on real-time HRV recovery & RPE telemetry.",
      icon: Dumbbell,
      badge: "Microservice 01",
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-600 border-emerald-200",
      href: "/workout"
    },
    {
      title: "HPE Recovery Sanctuary",
      desc: "Real-time telemetry-based HRV readiness ring (0–100) with interactive body fatigue heatmaps.",
      icon: Zap,
      badge: "Microservice 02",
      color: "from-sky-500/20 to-cyan-500/10 text-sky-600 border-sky-200",
      href: "/recovery"
    },
    {
      title: "Budget-Aware Meal Planner",
      desc: "Generates cost-optimized meal plans ($/day) with weekly grocery lists & scientific macro balancing.",
      icon: Utensils,
      badge: "Microservice 03",
      color: "from-amber-500/20 to-orange-500/10 text-amber-600 border-amber-200",
      href: "/meal-planner"
    },
    {
      title: "Skill Tree & Wardrobe",
      desc: "Interactive visual skill graph tracing movement progressions from beginner to elite levitation.",
      icon: Trophy,
      badge: "Gamification Engine",
      color: "from-purple-500/20 to-pink-500/10 text-purple-600 border-purple-200",
      href: "/skill-tree"
    },
    {
      title: "AI Exercise Constellation",
      desc: "Taxonomy & biomechanical injury safety checking for over 500+ exercise movements.",
      icon: BookOpen,
      badge: "Microservice 05",
      color: "from-emerald-500/20 to-lime-500/10 text-emerald-600 border-emerald-200",
      href: "/exercises"
    },
    {
      title: "Gemini AI Coach Chat",
      desc: "RAG-backed fitness knowledge graph with inline suggested action triggers.",
      icon: Sparkles,
      badge: "Google Gemini v1.5",
      color: "from-indigo-500/20 to-violet-500/10 text-indigo-600 border-indigo-200",
      href: "/coach"
    },
    {
      title: "13-Layer Digital Twin Avatar",
      desc: "Simulate future muscular growth, fat loss trajectory, and metabolic scenarios in 3D.",
      icon: Cpu,
      badge: "Digital Twin Engine",
      color: "from-cyan-500/20 to-blue-500/10 text-cyan-600 border-cyan-200",
      href: "/profile"
    },
    {
      title: "Wearables Telemetry Sync",
      desc: "Bi-directional integration with Apple Watch, Oura Ring, Garmin & WHOOP sensors.",
      icon: Activity,
      badge: "Telemetry Engine",
      color: "from-rose-500/20 to-red-500/10 text-rose-600 border-rose-200",
      href: "/wearables"
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-28 animate-smooth-reveal">
      <GoogleAuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Landing Header Bar with Sign Up & Sign In Buttons */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl duo-card bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/20">
            F
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-900 leading-tight">FitX AI Platform</h2>
            <span className="text-[10px] text-emerald-600 font-bold">Google Auth 2FA</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <button
              onClick={handleEnterApp}
              className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Enter App</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleOpenAuth}
                className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center space-x-1 border border-slate-200 transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-600" />
                <span>Sign In</span>
              </button>

              <button
                onClick={handleOpenAuth}
                className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <svg className="w-3 h-3 bg-white rounded-full p-0.2 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
                </svg>
                <span>Sign Up</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Website Hero Section */}
      <section className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>FitX AI Platform 2.0 • Google Authenticator Integrated</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Hyper-Personalized <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              AI Fitness & Recovery Engine
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
            18 microservices working together for adaptive workouts, real-time HRV telemetry, budget-aware meal plans, and Google Authenticator 2FA protection.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            onClick={handleOpenAuth}
            className="py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <UserPlus className="w-4 h-4" />
            <span>Sign Up / Sign In with Google</span>
          </button>

          <button
            onClick={handleEnterApp}
            className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs border border-slate-700 flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            <span>Launch App Dashboard</span>
          </button>
        </div>

        {/* Live Telemetry Stats */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/80 text-center">
          <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-lg sm:text-xl font-black text-emerald-400">98.4%</span>
            <span className="block text-[10px] text-slate-400 font-bold uppercase mt-0.5">Recovery Accuracy</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-lg sm:text-xl font-black text-cyan-400">18 Services</span>
            <span className="block text-[10px] text-slate-400 font-bold uppercase mt-0.5">Microservices</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-lg sm:text-xl font-black text-amber-400">45k+</span>
            <span className="block text-[10px] text-slate-400 font-bold uppercase mt-0.5">AI Plans Generated</span>
          </div>
        </div>
      </section>

      {/* 8 Microservices Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" /> Platform Microservices
            </h2>
            <p className="text-xs text-slate-500 font-medium">8 integrated fitness & nutrition engines</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {featureHubs.map((hub, idx) => {
            const IconComponent = hub.icon;
            return (
              <Link
                key={idx}
                href={hub.href}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br border flex items-center justify-center ${hub.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase border border-slate-200">
                    {hub.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center justify-between">
                    <span>{hub.title}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    {hub.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Pricing / Plan Grid */}
      <section className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6 shadow-xl min-w-0">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">Flexible Plans</span>
          <h2 className="text-xl font-black text-white">Choose Your AI Fitness Tier</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Includes full Google Authentication and access to all 18 backend microservices.
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full">
          {/* Free Tier */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between space-y-4 min-w-0">
            <div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-wide">Starter</span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-white">$0</span>
                <span className="text-xs text-slate-400 font-bold">/ forever</span>
              </div>
              <ul className="space-y-2 mt-4 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> <span className="break-words">Basic Workout Tracking</span></li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> <span className="break-words">Standard Meal Planner</span></li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> <span className="break-words">Google Single Sign-On</span></li>
              </ul>
            </div>
            <button
              onClick={handleOpenAuth}
              className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-extrabold text-xs transition-all active:scale-98"
            >
              Sign Up Free
            </button>
          </div>

          {/* Pro Tier (Popular) */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/80 to-slate-900 border-2 border-emerald-500 relative flex flex-col justify-between space-y-4 shadow-lg shadow-emerald-500/10 min-w-0">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 shadow-sm whitespace-nowrap">
              Most Popular
            </span>
            <div className="pt-1">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wide">Pro AI Coach</span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-white">$9.99</span>
                <span className="text-xs text-slate-400 font-bold">/ month</span>
              </div>
              <ul className="space-y-2 mt-4 text-xs text-slate-200 font-medium">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> <span className="break-words">Adaptive Overload Engine</span></li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> <span className="break-words">180px HRV Ring & Telemetry</span></li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> <span className="break-words">Gemini AI Coach Chat</span></li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> <span className="break-words">Google Authenticator 2FA</span></li>
              </ul>
            </div>
            <button
              onClick={handleOpenAuth}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-98"
            >
              Sign Up with Google
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between space-y-4 min-w-0">
            <div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-wide">Studio</span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-white">$29.99</span>
                <span className="text-xs text-slate-400 font-bold">/ month</span>
              </div>
              <ul className="space-y-2 mt-4 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> <span className="break-words">Multi-Client Dashboard</span></li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> <span className="break-words">Custom Biomechanical Rules</span></li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> <span className="break-words">Priority API Access</span></li>
              </ul>
            </div>
            <button
              onClick={handleOpenAuth}
              className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-extrabold text-xs transition-all active:scale-98"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center space-y-3 pt-4 border-t border-slate-200">
        <p className="text-xs font-extrabold text-slate-700">
          FitX AI Platform © 2026 • Engineered by Abhay Kumawat
        </p>
        <div className="flex justify-center items-center space-x-4 text-[11px] font-bold text-slate-500">
          <Link href="/" className="hover:text-emerald-600">Landing Page</Link>
          <span>•</span>
          <Link href="/dashboard" className="hover:text-emerald-600">App Dashboard</Link>
          <span>•</span>
          <Link href="/workout" className="hover:text-emerald-600">Workouts</Link>
          <span>•</span>
          <Link href="/recovery" className="hover:text-emerald-600">Recovery</Link>
        </div>
      </footer>
    </div>
  );
}
