"use client";

import React from "react";
import { Calendar, Plus, Copy, MoreHorizontal } from "lucide-react";
import { soundscape } from "@/lib/soundscapeEngine";

export function WorkoutPlanner() {
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  const handleAction = () => {
    soundscape.playTapSound();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-slate-800">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-black tracking-tight">Weekly Plan</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAction} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={handleAction} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Timeline */}
      <div className="flex gap-2 overflow-x-auto pb-4 snap-x no-scrollbar">
        {weekDays.map((day, idx) => {
          const isToday = day === "Wed"; // Mocking today
          const hasWorkout = ["Mon", "Wed", "Fri"].includes(day);
          
          return (
            <div 
              key={day} 
              className={`snap-center shrink-0 w-32 flex flex-col gap-2 p-3 rounded-2xl border ${
                isToday 
                  ? "bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/20" 
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-xs font-black uppercase tracking-wider ${isToday ? "text-emerald-700" : "text-slate-400"}`}>
                  {day}
                </span>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              
              {hasWorkout ? (
                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-[11px] font-bold text-slate-800">Push Hypertrophy</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">5 Exercises • 45m</span>
                  {isToday && (
                    <button className="mt-2 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                      Start Now
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-slate-200 rounded-xl mt-2 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-colors cursor-pointer" onClick={handleAction}>
                  <Plus className="w-5 h-5 mb-1" />
                  <span className="text-[9px] font-black uppercase tracking-wider">Plan Rest</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
