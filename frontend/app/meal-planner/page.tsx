"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  PlusCircle,
  Bell,
  BellOff,
  Layers,
  Calendar,
  Flame,
  CheckCircle2,
  Droplet,
  Pill,
} from "lucide-react";

import { useDietStore, MealCategory } from "@/store/useDietStore";
import { MealTodoTracker } from "@/components/nutrition/MealTodoTracker";
import { FoodSearchModal } from "@/components/nutrition/FoodSearchModal";
import { HydrationTracker } from "@/components/nutrition/HydrationTracker";
import { SupplementTracker } from "@/components/nutrition/SupplementTracker";
import { DietCalendarPlanner } from "@/components/nutrition/DietCalendarPlanner";
import { NutritionSummaryCard } from "@/components/nutrition/NutritionSummaryCard";
import { MealComboBuilderModal } from "@/components/nutrition/MealComboBuilderModal";
import { soundscape } from "@/lib/soundscapeEngine";

export default function MealPlannerPage() {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [comboModalOpen, setComboModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MealCategory>("Breakfast");

  const { notifications, toggleNotification } = useDietStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  const requestNotificationPermission = async () => {
    soundscape.playTapSound();
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      setNotificationsEnabled(perm === "granted");
      if (perm === "granted") {
        new Notification("FitX Reminders Active! 🔔", {
          body: "You will now receive scheduled notifications for meals, water, and supplements.",
          icon: "/favicon.ico",
        });
      }
    }
  };

  const handleOpenSearch = (category: MealCategory = "Breakfast") => {
    soundscape.playTapSound();
    setActiveCategory(category);
    setSearchModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-28 animate-smooth-reveal max-w-5xl mx-auto px-2 sm:px-4">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Smart Nutrition Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Diet, Hydration & Supplement Todo Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Checkable todo meal schedules, scientific food metrics, hydration tracking & scheduled reminders
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenSearch("Breakfast")}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl text-xs flex items-center space-x-1.5 shadow-lg transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Food to Plan</span>
          </button>

          <button
            onClick={() => setComboModalOpen(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl text-xs flex items-center space-x-1.5 shadow-lg transition-all active:scale-95"
          >
            <Layers className="w-4 h-4" />
            <span>Recipe Builder</span>
          </button>

          <button
            onClick={requestNotificationPermission}
            className={`px-3 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-1.5 border transition-all ${
              notificationsEnabled
                ? "bg-slate-800 text-emerald-400 border-slate-700"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
            title="Enable browser notifications for reminders"
          >
            {notificationsEnabled ? (
              <Bell className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            ) : (
              <BellOff className="w-4 h-4 text-slate-400" />
            )}
            <span>{notificationsEnabled ? "Alerts On" : "Enable Reminders"}</span>
          </button>
        </div>
      </div>

      {/* Calendar Planner Bar */}
      <DietCalendarPlanner
        currentDateStr={selectedDateStr}
        onSelectDate={(dStr) => setSelectedDateStr(dStr)}
      />

      {/* Macro & Micronutrient Summary Card */}
      <NutritionSummaryCard dateStr={selectedDateStr} />

      {/* Meal Checkable Todo Tracker List */}
      <MealTodoTracker
        dateStr={selectedDateStr}
        onOpenSearch={handleOpenSearch}
      />

      {/* Hydration Tracker + Supplement Engine (Full Width Stack) */}
      <div className="flex flex-col gap-6 w-full max-w-full">
        <HydrationTracker dateStr={selectedDateStr} />
        <SupplementTracker dateStr={selectedDateStr} />
      </div>

      {/* Scheduled Alarm Notification Settings Footer Card */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center">
            <Bell className="w-4 h-4 mr-1.5 text-indigo-600" /> Dedicated Time Reminders & Alarms
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Browser Push Alerts Enabled</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 min-w-0 ${
                notif.enabled
                  ? "bg-indigo-50/70 border-indigo-200 text-indigo-950"
                  : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
              }`}
            >
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black block leading-snug text-slate-900">{notif.title}</span>
                <span className="text-[11px] font-mono font-extrabold text-indigo-700 block mt-0.5">{notif.timeStr}</span>
              </div>
              <button
                onClick={() => {
                  soundscape.playTapSound();
                  toggleNotification(notif.id);
                }}
                className={`w-8 h-5 rounded-full transition-colors flex items-center p-0.5 shrink-0 ${
                  notif.enabled ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Food Search Modal */}
      <FoodSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        dateStr={selectedDateStr}
        defaultCategory={activeCategory}
      />

      {/* Meal Combo Builder Modal */}
      <MealComboBuilderModal
        isOpen={comboModalOpen}
        onClose={() => setComboModalOpen(false)}
        dateStr={selectedDateStr}
      />
    </div>
  );
}
