"use client";

import React from "react";
import {
  CalendarPlus,
  Repeat,
  FileSpreadsheet,
  Copy,
  CalendarDays,
  Sparkles,
  CheckSquare,
  X,
} from "lucide-react";
import { soundscape } from "@/lib/soundscapeEngine";

interface PlanActionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionId: string) => void;
  currentDateStr: string;
}

export const PlanActionBottomSheet: React.FC<PlanActionBottomSheetProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  currentDateStr,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: "SCHEDULE_MEAL",
      title: "Schedule Meal Event",
      subtitle: "Create a recurring or timed meal event with reminders",
      icon: CalendarPlus,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    },
    {
      id: "REPEAT_MEAL",
      title: "Configure Meal Recurrence",
      subtitle: "Set daily, weekday, or custom repeating schedules",
      icon: Repeat,
      color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
    },
    {
      id: "APPLY_TEMPLATE",
      title: "Apply Meal Template",
      subtitle: "Load pre-built macro meal combos or recipes",
      icon: FileSpreadsheet,
      color: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    },
    {
      id: "COPY_YESTERDAY",
      title: "Copy Yesterday's Plan",
      subtitle: "Duplicate all meals & supplements from yesterday",
      icon: Copy,
      color: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    },
    {
      id: "COPY_LAST_WEEK",
      title: "Copy Last Week's Schedule",
      subtitle: "Replicate 7-day schedule from previous week",
      icon: CalendarDays,
      color: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    },
    {
      id: "GENERATE_AI",
      title: "Generate AI Meal Plan",
      subtitle: "AI Coach optimized plan tailored to your macros & budget",
      icon: Sparkles,
      color: "bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-rose-600 border-rose-500/30",
      badge: "AI Powered",
    },
    {
      id: "BULK_EDIT",
      title: "Bulk Edit Meals",
      subtitle: "Batch update meal statuses or reschedule for the day",
      icon: CheckSquare,
      color: "bg-slate-500/10 text-slate-700 border-slate-300",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      {/* Backdrop overlay listener */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Container */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-slide-up z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-600">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-snug">Nutrition Planning Engine</h2>
              <p className="text-xs text-slate-500 font-medium">Select a planning workflow for {currentDateStr}</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundscape.playTapSound();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Items List */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  soundscape.playTapSound();
                  onSelectAction(act.id);
                }}
                className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-left flex items-center justify-between group active:scale-[0.99]"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${act.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-black text-slate-900 group-hover:text-indigo-900 transition-colors">
                        {act.title}
                      </span>
                      {act.badge && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-[9px] rounded-full uppercase tracking-wider">
                          {act.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{act.subtitle}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
