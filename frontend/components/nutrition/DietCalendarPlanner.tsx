"use client";

import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";
import { useDietStore } from "@/store/useDietStore";
import { soundscape } from "@/lib/soundscapeEngine";

interface DietCalendarPlannerProps {
  currentDateStr: string;
  onSelectDate: (dateStr: string) => void;
}

export const DietCalendarPlanner: React.FC<DietCalendarPlannerProps> = ({
  currentDateStr,
  onSelectDate,
}) => {
  const { copyPlanToDate, getDailyTotals } = useDietStore();
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Week");
  const [copiedNotification, setCopiedNotification] = useState(false);

  const currentDate = new Date(currentDateStr);

  const formatDateStr = (d: Date) => d.toISOString().split("T")[0];

  const getWeekDays = () => {
    const start = new Date(currentDate);
    const dayOfWeek = start.getDay();
    const sunday = new Date(start);
    sunday.setDate(start.getDate() - dayOfWeek);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const handleCopyYesterday = () => {
    soundscape.playTapSound();
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);
    const yesterdayStr = formatDateStr(yesterday);

    copyPlanToDate(yesterdayStr, currentDateStr);

    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  const navigateDate = (daysDelta: number) => {
    soundscape.playTapSound();
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + daysDelta);
    onSelectDate(formatDateStr(newDate));
  };

  const weekDays = getWeekDays();

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 max-w-full overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 leading-snug">Diet & Meal Calendar Planner</h2>
            <p className="text-[11px] text-slate-500">Plan and replicate your meal schedule</p>
          </div>
        </div>

        {/* View Mode Buttons & Navigation */}
        <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0 flex-wrap gap-y-2">
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 font-mono text-xs">
            {(["Day", "Week", "Month"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs ${
                  viewMode === mode
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyYesterday}
            className="px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-black transition-all flex items-center space-x-1 shadow-2xs active:scale-95 whitespace-nowrap"
            title="Copy all meals & supplements from yesterday to today"
          >
            {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
            <span>{copiedNotification ? "Plan Copied!" : "Copy Yesterday"}</span>
          </button>
        </div>
      </div>

      {/* Week Grid Navigation */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-1.5 sm:p-2 gap-1">
        <button
          onClick={() => navigateDate(-7)}
          className="p-1.5 sm:p-2 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Days of the week */}
        <div className="grid grid-cols-7 gap-1 flex-1 text-center font-mono min-w-0">
          {weekDays.map((d) => {
            const dStr = formatDateStr(d);
            const isSelected = dStr === currentDateStr;
            const isToday = dStr === new Date().toISOString().split("T")[0];
            const totals = getDailyTotals(dStr);

            return (
              <button
                key={dStr}
                onClick={() => {
                  soundscape.playTapSound();
                  onSelectDate(dStr);
                }}
                className={`py-1.5 px-0.5 rounded-xl transition-all flex flex-col items-center justify-center min-w-0 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md scale-105"
                    : isToday
                    ? "bg-indigo-100 text-indigo-900 border border-indigo-300"
                    : "hover:bg-slate-200 text-slate-700"
                }`}
              >
                <span className="text-[9px] uppercase font-bold opacity-80 block truncate w-full text-center">
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-xs font-black">{d.getDate()}</span>
                {totals.totalMeals > 0 && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? "bg-white" : "bg-emerald-500"}`} />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => navigateDate(7)}
          className="p-1.5 sm:p-2 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
