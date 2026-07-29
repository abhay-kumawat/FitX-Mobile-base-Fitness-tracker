"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Bell,
  Repeat,
  Sparkles,
  Flame,
  CalendarPlus,
  MoreVertical,
} from "lucide-react";
import { useDietStore } from "@/store/useDietStore";
import { soundscape } from "@/lib/soundscapeEngine";

interface DietCalendarPlannerProps {
  currentDateStr: string;
  onSelectDate: (dateStr: string) => void;
  onOpenPlanSheet: () => void;
}

export const DietCalendarPlanner: React.FC<DietCalendarPlannerProps> = ({
  currentDateStr,
  onSelectDate,
  onOpenPlanSheet,
}) => {
  const {
    timelineIndicators,
    fetchTimelineIndicators,
    getDailyTotals,
    completedStreakDays,
  } = useDietStore();

  const [dateRangeOffset, setDateRangeOffset] = useState(0); // Weeks offset
  const todayStr = new Date().toISOString().split("T")[0];

  const currentDate = new Date(currentDateStr);
  const formatDateStr = (d: Date) => d.toISOString().split("T")[0];

  // Generate 7-day interactive strip window based on dateRangeOffset
  const getWeekDays = () => {
    const base = new Date(currentDate);
    base.setDate(base.getDate() + dateRangeOffset * 7);
    const dayOfWeek = base.getDay();
    const sunday = new Date(base);
    sunday.setDate(base.getDate() - dayOfWeek);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const startStr = formatDateStr(weekDays[0]);
  const endStr = formatDateStr(weekDays[6]);

  useEffect(() => {
    fetchTimelineIndicators(startStr, endStr);
  }, [startStr, endStr, fetchTimelineIndicators]);

  const navigateWeek = (weeksDelta: number) => {
    soundscape.playTapSound();
    setDateRangeOffset((prev) => prev + weeksDelta);
  };

  const currentTotals = getDailyTotals(currentDateStr);
  const currentCompliance =
    currentTotals.totalMeals > 0
      ? Math.round((currentTotals.completedMeals / currentTotals.totalMeals) * 100)
      : 0;

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 max-w-full overflow-hidden transition-all">
      {/* Header & Main Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-600 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                Event Scheduling Timeline
              </h2>
              <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-[10px] font-black flex items-center">
                <Flame className="w-3 h-3 mr-0.5 text-amber-600 fill-amber-600" />
                {completedStreakDays} Day Streak
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Google Calendar & Alarm-style nutrition event planner
            </p>
          </div>
        </div>

        {/* Action Controls: Prominent "Plan" Button */}
        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => {
              soundscape.playTapSound();
              onOpenPlanSheet();
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 text-white font-black rounded-2xl text-xs flex items-center space-x-2 shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-95 border border-indigo-400/30"
          >
            <CalendarPlus className="w-4 h-4 text-emerald-400" />
            <span>Plan</span>
          </button>
        </div>
      </div>

      {/* Today's Progress Highlight Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-600 font-black text-xs font-mono">
            {currentCompliance}%
          </div>
          <div className="min-w-0">
            <span className="text-xs font-black text-slate-900 block truncate">
              {currentDateStr === todayStr ? "Today's Schedule Progress" : `Plan for ${currentDateStr}`}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {currentTotals.completedMeals} of {currentTotals.totalMeals} meals logged • {currentTotals.calories} kcal
            </span>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="w-24 sm:w-32 bg-slate-200 rounded-full h-2 overflow-hidden shrink-0">
          <div
            className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${currentCompliance}%` }}
          />
        </div>
      </div>

      {/* Interactive Horizontal Date Timeline Strip */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-1.5 gap-1 min-w-0">
        <button
          onClick={() => navigateWeek(-1)}
          className="p-1.5 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors shrink-0"
          title="Previous week"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 flex-1 text-center font-mono min-w-0">
          {weekDays.map((d) => {
            const dStr = formatDateStr(d);
            const isSelected = dStr === currentDateStr;
            const isToday = dStr === todayStr;

            const ind = timelineIndicators[dStr] || {
              total_meals: 0,
              completed_meals: 0,
              missed_meals: 0,
              has_reminders: false,
              has_recurring: false,
            };

            return (
              <button
                key={dStr}
                onClick={() => {
                  soundscape.playTapSound();
                  onSelectDate(dStr);
                }}
                className={`py-2 px-1 rounded-2xl transition-all flex flex-col items-center justify-between min-w-0 overflow-hidden relative group ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-lg scale-[1.03] border border-indigo-500/50"
                    : isToday
                    ? "bg-indigo-100 text-indigo-950 border-2 border-indigo-400"
                    : "hover:bg-slate-200 text-slate-700 bg-white border border-slate-200"
                }`}
              >
                {/* Today Pill */}
                {isToday && (
                  <span className={`text-[8px] font-black uppercase px-1 rounded-full ${isSelected ? "bg-emerald-400 text-slate-950" : "bg-indigo-600 text-white"}`}>
                    Today
                  </span>
                )}

                <span className="text-[9px] uppercase font-extrabold opacity-75 block truncate w-full text-center leading-none mt-0.5">
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-xs sm:text-sm font-black mt-0.5">{d.getDate()}</span>

                {/* Event Indicators Row */}
                <div className="flex items-center space-x-0.5 mt-1 h-3 shrink-0">
                  {/* Completed Check indicator */}
                  {ind.completed_meals > 0 && (
                    <CheckCircle2
                      className={`w-3 h-3 ${isSelected ? "text-emerald-400" : "text-emerald-600"}`}
                    />
                  )}

                  {/* Missed Warning indicator */}
                  {ind.missed_meals > 0 && (
                    <AlertCircle
                      className={`w-3 h-3 ${isSelected ? "text-rose-400" : "text-rose-500"}`}
                    />
                  )}

                  {/* Recurrence icon */}
                  {ind.has_recurring && (
                    <Repeat
                      className={`w-2.5 h-2.5 ${isSelected ? "text-indigo-300" : "text-indigo-500"}`}
                    />
                  )}

                  {/* Reminders dot */}
                  {ind.has_reminders && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-amber-400" : "bg-amber-500"
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => navigateWeek(1)}
          className="p-1.5 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors shrink-0"
          title="Next week"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
