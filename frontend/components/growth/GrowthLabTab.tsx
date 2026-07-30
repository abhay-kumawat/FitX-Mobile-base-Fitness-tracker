"use client";

import React, { useState, useEffect } from "react";
import { Search, Calendar as CalendarIcon, Filter, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { PillBadge } from "@/components/atomic/PillBadge";

interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  details: any;
}

export function GrowthLabTab() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking the /api/growth/timeline fetch
    setTimeout(() => {
      setEvents([
        {
          id: "1",
          date: selectedDate,
          time: "07:30",
          type: "psychological",
          title: "Morning Readiness",
          description: "Logged mood as 8/10. Energy 7/10.",
          icon: "Brain",
          details: {}
        },
        {
          id: "2",
          date: selectedDate,
          time: "08:15",
          type: "workout",
          title: "Upper Body Hypertrophy",
          description: "Completed 18 sets, 12,450kg volume.",
          icon: "Dumbbell",
          details: { duration: "52 mins" }
        },
        {
          id: "3",
          date: selectedDate,
          time: "12:30",
          type: "meal",
          title: "Post-Workout Lunch",
          description: "850 kcal, 65g Protein.",
          icon: "Flame",
          details: {}
        },
        {
          id: "4",
          date: selectedDate,
          time: "14:00",
          type: "ai_recommendation",
          title: "AI Recovery Suggestion",
          description: "Consider increasing water intake based on your heavy session.",
          icon: "Bot",
          details: { confidence: 0.92 }
        }
      ]);
      setLoading(false);
    }, 600);
  }, [selectedDate]);

  return (
    <div className="flex flex-col gap-6 animate-smooth-reveal">
      {/* Analytics Scorecards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Workout Consistency</span>
          <span className="text-2xl font-black text-emerald-600">92%</span>
          <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold mt-1">
            <TrendingUp className="w-3 h-3" /> +4% this month
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Overtraining Risk</span>
          <span className="text-2xl font-black text-amber-500">22%</span>
          <div className="flex items-center gap-1 text-[10px] text-amber-700 font-bold mt-1">
            <AlertTriangle className="w-3 h-3" /> Monitor sleep
          </div>
        </div>
      </div>

      {/* Timeline Controls */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none text-sm font-bold text-slate-900 focus:ring-0 p-0"
          />
        </div>
        <button className="p-2 bg-white rounded-full border border-slate-200 text-slate-500 shadow-sm">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Timeline View */}
      <div className="flex flex-col gap-4 relative">
        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200 rounded-full" />
        
        <h3 className="text-sm font-black text-slate-900 px-1 mb-2">Replay My Day</h3>

        {loading ? (
          <div className="ml-12 text-xs font-bold text-slate-400">Loading timeline...</div>
        ) : (
          events.map((event, idx) => (
            <div key={event.id} className="flex gap-4 relative z-10">
              <div className="w-10 h-10 shrink-0 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shadow-sm">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400">{event.time}</span>
                  {event.type === 'ai_recommendation' && (
                    <PillBadge variant="purple">AI Insight</PillBadge>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
