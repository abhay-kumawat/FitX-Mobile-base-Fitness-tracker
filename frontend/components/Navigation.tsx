"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Dumbbell, 
  Zap, 
  Trophy, 
  User, 
  Search, 
  X, 
  Flame, 
  Crown,
  ChevronRight,
  Sparkles,
  Utensils,
  BookOpen,
  Calendar,
  Activity,
  Cpu,
  Layers
} from "lucide-react";
import ConfettiBurst from "./ConfettiBurst";
import { soundscape } from "@/lib/soundscapeEngine";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [streakConfetti, setStreakConfetti] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Train", href: "/workout", icon: Dumbbell },
    { label: "Recover", href: "/recovery", icon: Zap },
    { label: "Meals", href: "/meal-planner", icon: Utensils },
    { label: "Skill Tree", href: "/skill-tree", icon: Trophy },
    { label: "Me", href: "/profile", icon: User },
  ];

  const quickCommands = [
    { category: "Home Hub", name: "Home Mission & Companion Greetings", href: "/", icon: Home },
    { category: "Workout", name: "Active Workout HUD & Overload Engine", href: "/workout", icon: Dumbbell },
    { category: "Recovery", name: "HPE HRV Ring & 4-7-8 Breathing Pacer", href: "/recovery", icon: Zap },
    { category: "Nutrition", name: "Smart Meal Planner, Hydration & Supplement Engine", href: "/meal-planner", icon: Utensils },
    { category: "Gamification", name: "Skill Tree, Flexy Wardrobe & 3D Badges", href: "/skill-tree", icon: Trophy },
    { category: "Taxonomy", name: "AI Exercise Graph & Biomechanical Taxonomy", href: "/exercises", icon: BookOpen },
    { category: "AI Coach", name: "AI Coach Chat & Evidence KIE Graph", href: "/coach", icon: Sparkles },
    { category: "Digital Twin", name: "13-Layer Avatar & Scenario Simulator", href: "/profile", icon: Cpu },
    { category: "Telemetry", name: "Wearables & Heart Rate Telemetry", href: "/wearables", icon: Activity },
    { category: "Schedule", name: "Smart Calendar & Deload Scheduler", href: "/calendar", icon: Calendar },
    { category: "Habits", name: "Smart Habit Engine & Memory Timeline", href: "/journal", icon: Layers },
    { category: "Analytics", name: "Fatigue Prediction & Analytics Dashboard", href: "/analytics", icon: Activity },
  ];

  const filteredCommands = quickCommands.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setCmdOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectCommand = (href: string) => {
    soundscape.playTapSound();
    setCmdOpen(false);
    setSearchQuery("");
    router.push(href);
  };

  const handleStreakTap = () => {
    soundscape.playVictoryFanfare();
    setStreakConfetti(true);
  };

  return (
    <>
      <ConfettiBurst trigger={streakConfetti} onComplete={() => setStreakConfetti(false)} />

      {/* Global Quick Command Palette Drawer (Cmd/Ctrl + K) */}
      {cmdOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xl flex items-start justify-center pt-16 px-4 animate-smooth-reveal">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-3 w-full mr-4">
                <Search className="w-5 h-5 shrink-0 text-emerald-600" />
                <input
                  type="text"
                  placeholder="Ask Flexy or search any feature (e.g. Meals, HRV, Workouts)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                onClick={() => setCmdOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
              {filteredCommands.length === 0 ? (
                <div className="p-6 text-center text-xs font-bold text-slate-500">
                  No feature matching "{searchQuery}"
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const IconComp = cmd.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectCommand(cmd.href)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/70 text-left transition-all active:scale-98 group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                          <IconComp className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="text-slate-900 font-extrabold block text-xs">{cmd.name}</span>
                          <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase block mt-0.5">{cmd.category}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Crisp Light Header Bar */}
      <header className="sticky top-[34px] z-40 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl h-13 flex items-center justify-between mx-auto w-full max-w-full shadow-xs px-3.5 py-2 mb-4 shrink-0">
        <div className="flex items-center space-x-2 shrink-0">
          <Link href="/skill-tree" className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full hover:scale-105 transition-transform">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-black text-amber-600">Lvl 5</span>
            <div className="w-10 h-1.5 bg-slate-200 rounded-full overflow-hidden ml-1">
              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full w-[65%]" />
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={() => setCmdOpen(true)}
            className="p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors"
            title="Search features (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-emerald-600" />
          </button>

          <button
            onClick={handleStreakTap}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 hover:bg-amber-500/25 transition-all"
            title="12 Day Streak!"
          >
            <Flame className="w-3.5 h-3.5 fill-current animate-pulse text-amber-500" />
            <span className="text-[11px] font-black">12 Days</span>
          </button>
        </div>
      </header>

      {/* Floating Crisp Glass Dock Bottom Navigation */}
      <nav className="fixed bottom-3 left-2 right-2 z-50 bg-white/95 backdrop-blur-2xl border border-slate-200/90 h-[62px] px-1 flex justify-between items-center w-[calc(100%-1rem)] max-w-[380px] mx-auto rounded-full shadow-lg shadow-slate-900/10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => soundscape.playTapSound()}
              className={`flex flex-col items-center justify-center flex-1 h-full rounded-full transition-all duration-300 touch-target relative active:scale-95 min-w-0 group ${
                isActive ? "" : "hover:bg-slate-100/60"
              }`}
            >
              <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                isActive 
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105" 
                  : "text-slate-600 group-hover:text-slate-900"
              }`}>
                <Icon className={`w-3.5 h-3.5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
                <span className={`text-[8px] tracking-tight font-extrabold mt-0.5 truncate max-w-full px-0.5 leading-none ${isActive ? "text-white" : ""}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
