"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar, Plus, MoreHorizontal, Activity, RefreshCw, Moon, Sparkles, GripHorizontal, Dumbbell } from "lucide-react";
import { soundscape } from "@/lib/soundscapeEngine";
import { useWorkoutStore } from "@/store/useWorkoutStore";

export function WorkoutPlanner({ onAddExercise }: { onAddExercise?: () => void }) {
  const store = useWorkoutStore();
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const [draggedDate, setDraggedDate] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate dates relative to current week (Mon-Sun)
  const getWeekDates = () => {
    const today = new Date();
    const day = today.getDay(); // 0 is Sun, 1 is Mon...
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(today.getFullYear(), today.getMonth(), diff + idx);
      return d.toISOString().split("T")[0];
    });
  };

  const currentWeekDates = getWeekDates();
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    store.fetchCalendarWeek(currentWeekDates[0], currentWeekDates[6]);
  }, []);

  const handleDaySelect = async (dateStr: string) => {
    soundscape.playTapSound();
    await store.selectDate(dateStr);
  };

  const handleOpenAddModal = (dateStr: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    soundscape.playTapSound();
    store.selectDate(dateStr);
    store.toggleAddModal(true);
  };

  const handleOpenContextMenu = (dateStr: string, e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    soundscape.playTapSound();
    store.toggleContextMenu(true, dateStr);
  };

  const handleTouchStart = (dateStr: string) => {
    longPressTimerRef.current = setTimeout(() => {
      soundscape.playTapSound();
      store.toggleContextMenu(true, dateStr);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  // HTML5 Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, dateStr: string) => {
    setDraggedDate(dateStr);
    e.dataTransfer.setData("text/plain", dateStr);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    const sourceDate = e.dataTransfer.getData("text/plain") || draggedDate;
    if (sourceDate && sourceDate !== targetDate) {
      soundscape.playVictoryFanfare();
      await store.performDayActionStore(sourceDate, "swap", targetDate);
    }
    setDraggedDate(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-slate-900">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-black tracking-tight text-slate-900">Workout Calendar Schedule</h2>
            <span className="text-[10px] font-bold text-slate-400">
              Select a day card to edit its structure • Drag to swap days
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => store.fetchCalendarWeek(currentWeekDates[0], currentWeekDates[6])} 
            className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
            title="Refresh Schedule"
          >
            <RefreshCw className={`w-4 h-4 ${store.isCalendarLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button 
            onClick={(e) => handleOpenAddModal(store.selectedDate, e)} 
            className="px-3.5 py-2 bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Workout
          </button>
        </div>
      </div>

      {/* Week Timeline Slider / Grid */}
      <div className="grid grid-cols-7 gap-2 overflow-x-auto pb-2 pt-2 snap-x no-scrollbar">
        {weekDays.map((dayLabel, idx) => {
          const dateStr = currentWeekDates[idx];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === store.selectedDate;

          const assignment = store.calendarAssignments[dateStr];
          const hasAssignment = !!assignment;
          const isRest = assignment?.assignment_type === "rest";
          const exercises = assignment?.workout_data?.exercises || [];
          const exercisesCount = exercises.length;

          return (
            <div 
              key={dateStr}
              tabIndex={0}
              role="button"
              aria-selected={isSelected}
              draggable
              onDragStart={(e) => handleDragStart(e, dateStr)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, dateStr)}
              onClick={() => handleDaySelect(dateStr)}
              onContextMenu={(e) => handleOpenContextMenu(dateStr, e)}
              onTouchStart={() => handleTouchStart(dateStr)}
              onTouchEnd={handleTouchEnd}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleDaySelect(dateStr);
                }
              }}
              className={`snap-center shrink-0 min-w-[130px] sm:min-w-0 flex flex-col justify-between p-3 rounded-2xl border transition-all duration-200 outline-none select-none relative group cursor-pointer ${
                isSelected 
                  ? "bg-slate-900 text-white border-emerald-500 ring-4 ring-emerald-500/20 shadow-xl scale-[1.03] z-10" 
                  : isToday 
                    ? "bg-emerald-50/50 border-emerald-300 text-slate-900 hover:border-emerald-400 shadow-sm" 
                    : "bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {/* Drag Handle Indicator */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-40 transition-opacity">
                <GripHorizontal className="w-4 h-2" />
              </div>

              {/* Day Header */}
              <div className="flex justify-between items-start mt-1">
                <div className="flex flex-col">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${
                    isSelected ? "text-emerald-400" : isToday ? "text-emerald-700" : "text-slate-400"
                  }`}>
                    {dayLabel}
                  </span>
                  <span className={`text-[10px] font-bold ${
                    isSelected ? "text-slate-300" : "text-slate-500"
                  }`}>
                    {dateStr.slice(5).replace("-", "/")}
                  </span>
                </div>

                <button 
                  onClick={(e) => handleOpenContextMenu(dateStr, e)}
                  className={`p-1 rounded-lg transition-colors ${
                    isSelected 
                      ? "text-slate-400 hover:text-white hover:bg-slate-800" 
                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  }`}
                  title="Day Actions"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Assignment Card Body */}
              <div className="my-3 min-h-[64px] flex flex-col justify-center">
                {hasAssignment ? (
                  isRest ? (
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        isSelected ? "text-indigo-300" : "text-indigo-600"
                      }`}>
                        <Moon className="w-3 h-3" /> Rest Day
                      </span>
                      <span className={`text-[11px] font-bold leading-tight line-clamp-2 ${
                        isSelected ? "text-slate-200" : "text-slate-700"
                      }`}>
                        Rest & Recovery
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        isSelected ? "text-emerald-400" : "text-emerald-600"
                      }`}>
                        <Dumbbell className="w-3 h-3" /> Workout
                      </span>
                      <span className={`text-[11px] font-black leading-tight line-clamp-2 ${
                        isSelected ? "text-white" : "text-slate-900"
                      }`}>
                        {assignment.name || "Custom Workout"}
                      </span>
                      <span className={`text-[9px] font-bold uppercase ${
                        isSelected ? "text-slate-400" : "text-slate-500"
                      }`}>
                        {exercisesCount} Movements
                      </span>
                    </div>
                  )
                ) : (
                  <div className={`flex flex-col items-center justify-center py-2.5 rounded-xl border border-dashed text-center ${
                    isSelected 
                      ? "border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-emerald-400" 
                      : "border-slate-200 text-slate-400 hover:border-emerald-400 hover:text-emerald-600"
                  }`}>
                    <span className="text-[10px] font-black uppercase tracking-wider">Unassigned</span>
                  </div>
                )}
              </div>

              {/* Action Button at bottom */}
              <div className="pt-1">
                {hasAssignment && !isRest && isToday ? (
                  <button 
                    onClick={async (e) => {
                      e.stopPropagation();
                      soundscape.playTapSound();
                      await useWorkoutStore.getState().startWorkout(assignment.name);
                      if (onAddExercise) onAddExercise();
                    }}
                    className="w-full py-1.5 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-emerald-400 transition-colors shadow-sm active:scale-95"
                  >
                    Start Workout
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleOpenAddModal(dateStr, e)}
                    className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1 ${
                      isSelected 
                        ? "bg-slate-800 text-emerald-400 hover:bg-slate-700" 
                        : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    <Plus className="w-3 h-3" /> {hasAssignment ? "Change" : "Assign"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
