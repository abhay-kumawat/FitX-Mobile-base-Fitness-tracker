"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Plus, Copy, MoreHorizontal, Activity, RefreshCw } from "lucide-react";
import { soundscape } from "@/lib/soundscapeEngine";
import { fitxAPI } from "@/lib/api";
import { useWorkoutStore } from "@/store/useWorkoutStore";

export function WorkoutPlanner({ onAddExercise }: { onAddExercise?: () => void }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Real dates relative to today
  const getWeekDates = () => {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 1 is Monday...
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(today.setDate(diff + idx));
      return d.toISOString().split("T")[0];
    });
  };

  const currentWeekDates = getWeekDates();
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fitxAPI.getEvents(currentWeekDates[0], currentWeekDates[6]);
      setEvents(res || []);
    } catch (e) {
      console.error(e);
      // Fallback data if API fails to prevent blank UI
      setEvents([
        { planned_date: currentWeekDates[0], status: "scheduled", plan_id: 1 },
        { planned_date: currentWeekDates[2], status: "scheduled", plan_id: 2 },
      ]);
    }
    setLoading(false);
  };

  const handleAction = () => {
    soundscape.playTapSound();
    if (onAddExercise) onAddExercise();
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
          <button onClick={fetchEvents} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleAction} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-md shadow-emerald-500/20">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Timeline */}
      <div className="flex gap-2 overflow-x-auto pb-4 snap-x no-scrollbar">
        {weekDays.map((day, idx) => {
          const dateStr = currentWeekDates[idx];
          const isToday = dateStr === todayStr;
          const dayEvents = events.filter(e => e.planned_date === dateStr);
          const hasWorkout = dayEvents.length > 0;
          
          return (
            <div 
              key={dateStr} 
              className={`snap-center shrink-0 w-36 flex flex-col gap-2 p-3 rounded-2xl border transition-all ${
                isToday 
                  ? "bg-gradient-to-b from-emerald-50 to-white border-emerald-200 ring-2 ring-emerald-500/20 shadow-sm" 
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className={`text-xs font-black uppercase tracking-wider ${isToday ? "text-emerald-700" : "text-slate-400"}`}>
                    {day}
                  </span>
                  <span className={`text-[10px] font-bold ${isToday ? "text-emerald-600/70" : "text-slate-400/70"}`}>
                    {dateStr.slice(5).replace("-", "/")}
                  </span>
                </div>
                {hasWorkout && (
                  <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {hasWorkout ? (
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="flex items-start gap-1">
                    <Activity className="w-3 h-3 text-emerald-500 mt-0.5" />
                    <span className="text-[11px] font-bold text-slate-800 leading-tight">Push Hypertrophy</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">5 Exercises • 45m</span>
                  {isToday && (
                    <button 
                      onClick={async () => {
                        soundscape.playTapSound();
                        await useWorkoutStore.getState().startWorkout("Push Hypertrophy Protocol");
                        if (onAddExercise) onAddExercise();
                      }}
                      className="mt-2 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md shadow-emerald-500/25 hover:bg-emerald-600 transition-colors active:scale-95"
                    >
                      Start Now
                    </button>
                  )}
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center justify-center h-[88px] border-2 border-dashed border-slate-200 rounded-xl mt-2 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-colors cursor-pointer group hover:bg-emerald-50/30" 
                  onClick={async () => {
                    soundscape.playTapSound();
                    try {
                      await fitxAPI.createPlan({
                        name: "Rest & Active Recovery",
                        goal: "Recovery",
                        planned_date: dateStr,
                        workout_data: { exercises: [] }
                      });
                      fetchEvents();
                    } catch (e) { console.warn(e); }
                  }}
                >
                  <Plus className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
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
