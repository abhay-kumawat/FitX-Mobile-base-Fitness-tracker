"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Dumbbell, 
  RotateCcw,
  Sparkles,
  X,
  History
} from "lucide-react";
import { useAppState, dispatchAIAction, CalendarEvent } from "@/lib/state/appStateStore";
import TimeMachineOverlay from "@/components/timeline/TimeMachineOverlay";
import { PillBadge } from "@/components/atomic/PillBadge";
import { Button3D } from "@/components/atomic/Button3D";
import { soundscape } from "@/lib/soundscapeEngine";

export default function DynamicCalendarPage() {
  const appState = useAppState();
  const [selectedDate, setSelectedDate] = useState("2026-07-28");
  const [shiftModalEvent, setShiftModalEvent] = useState<CalendarEvent | null>(null);
  const [targetDate, setTargetDate] = useState("2026-07-29");
  const [newEventModal, setNewEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventType, setNewEventType] = useState<"workout" | "rest" | "cardio">("workout");
  const [showTimeMachine, setShowTimeMachine] = useState(false);

  const events = appState.calendar || [];

  const handleShiftEvent = () => {
    soundscape.playTapSound();
    if (shiftModalEvent) {
      dispatchAIAction("SHIFT_CALENDAR_DATE", {
        eventId: shiftModalEvent.id,
        newDate: targetDate,
      });
      setShiftModalEvent(null);
    }
  };

  const handleAddEvent = () => {
    soundscape.playTapSound();
    if (newEventTitle.trim()) {
      dispatchAIAction("SCHEDULE_EVENT", {
        date: selectedDate,
        title: newEventTitle,
        type: newEventType,
        durationMins: 45,
      });
      setNewEventTitle("");
      setNewEventModal(false);
    }
  };

  const weekDays = [
    { day: "Mon", date: "2026-07-27" },
    { day: "Tue", date: "2026-07-28" },
    { day: "Wed", date: "2026-07-29" },
    { day: "Thu", date: "2026-07-30" },
    { day: "Fri", date: "2026-07-31" },
    { day: "Sat", date: "2026-08-01" },
    { day: "Sun", date: "2026-08-02" },
  ];

  const filteredEvents = events.filter((e) => e.date === selectedDate);

  return (
    <div className="space-y-4 pb-24 animate-smooth-reveal">
      {/* Shift Event Date Modal Drawer */}
      {shiftModalEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-end justify-center">
          <div className="w-full max-w-md bg-white border-t-2 border-x-2 border-slate-300 rounded-t-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-black text-slate-900 flex items-center">
                <RotateCcw className="w-4 h-4 mr-1.5 text-emerald-600" /> Shift Schedule Event Date
              </h3>
              <button onClick={() => setShiftModalEvent(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <p className="text-slate-700 font-bold">
                Rescheduling <strong className="text-emerald-700">{shiftModalEvent.title}</strong>
              </p>
              <label className="text-slate-500 block font-bold mt-2">New Target Date:</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <Button3D variant="green" fullWidth onClick={handleShiftEvent}>
              Confirm Schedule Shift
            </Button3D>
          </div>
        </div>
      )}

      {/* Add New Schedule Event Modal */}
      {newEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-end justify-center">
          <div className="w-full max-w-md bg-white border-t-2 border-x-2 border-slate-300 rounded-t-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-black text-slate-900 flex items-center">
                <Plus className="w-4 h-4 mr-1.5 text-emerald-600" /> Add Schedule Event
              </h3>
              <button onClick={() => setNewEventModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <label className="text-slate-700 block font-bold">Event Title:</label>
              <input
                type="text"
                placeholder="e.g. Deload Squats & Mobility"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
              />

              <label className="text-slate-700 block font-bold pt-1">Event Type:</label>
              <div className="flex space-x-2">
                {(["workout", "rest", "cardio"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewEventType(t)}
                    className={`flex-1 py-1.5 rounded-xl font-bold uppercase transition-all ${
                      newEventType === t ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Button3D variant="green" fullWidth onClick={handleAddEvent}>
              Add Event to {selectedDate}
            </Button3D>
          </div>
        </div>
      )}

      <TimeMachineOverlay isOpen={showTimeMachine} onClose={() => setShowTimeMachine(false)} />

      {/* Hero Header: Timeline Engine Banner */}
      <div className="duo-card p-5 bg-white border border-slate-200 space-y-4 relative shadow-sm">
        <div className="flex items-center justify-between">
          <PillBadge variant="green" icon={<CalendarIcon className="w-3.5 h-3.5" />}>
            Timeline Engine v3.0
          </PillBadge>

          <Button3D
            variant="gold"
            onClick={() => {
              soundscape.playTapSound();
              setShowTimeMachine(true);
            }}
            className="text-xs py-1 px-3"
          >
            <History className="w-3.5 h-3.5 mr-1" /> Time Machine
          </Button3D>
        </div>

        <div>
          <h2 className="text-xl font-black text-slate-900 mb-1 tracking-tight">Fitness Life Journal & Schedule</h2>
          <p className="text-xs font-bold text-slate-600 font-mono">
            Every date holds workouts, nutrition, telemetry & AI insights.
          </p>
        </div>

        {/* Week View Picker Bar */}
        <div className="grid grid-cols-7 gap-1 pt-2 border-t border-slate-200 text-center font-mono">
          {weekDays.map((w) => {
            const isSelected = selectedDate === w.date;
            const hasEvent = events.some((e) => e.date === w.date);
            return (
              <button
                key={w.date}
                onClick={() => {
                  soundscape.playTapSound();
                  setSelectedDate(w.date);
                }}
                className={`py-1.5 px-0.5 rounded-xl border transition-all flex flex-col items-center justify-center space-y-0.5 active:scale-95 min-w-0 ${
                  isSelected
                    ? "bg-emerald-500 text-white border-emerald-600 font-extrabold shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="text-[8px] uppercase opacity-80 truncate w-full text-center font-extrabold">{w.day}</span>
                <span className="text-xs font-black">{w.date.split("-")[2]}</span>
                {hasEvent && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Agenda Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-[10px] font-mono text-emerald-700 font-black uppercase">Schedule Agenda</span>
          <h3 className="text-xs font-black text-slate-900">Events for {selectedDate}</h3>
        </div>
        <button
          onClick={() => {
            soundscape.playTapSound();
            setNewEventModal(true);
          }}
          className="px-3 py-1 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-extrabold hover:bg-emerald-100 transition-all flex items-center shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Event
        </button>
      </div>

      {/* Scheduled Events List for Selected Date */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="duo-card p-6 rounded-3xl bg-white border border-slate-200 text-center space-y-2 shadow-xs">
            <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 font-bold font-mono">No events scheduled for {selectedDate}</p>
            <Button3D variant="green" onClick={() => setNewEventModal(true)} className="text-xs py-2 px-4">
              Schedule Workout Session
            </Button3D>
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div key={evt.id} className="duo-card p-4 rounded-3xl bg-white border border-slate-200 space-y-3 hover:border-emerald-400 transition-all shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center">
                  <Dumbbell className="w-3 h-3 mr-1 text-emerald-600" /> {evt.type} • {evt.durationMins} Mins
                </span>
                <span className="text-xs font-mono font-black text-emerald-700">
                  Status: {evt.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-black text-slate-900">{evt.title}</h4>
                  <p className="text-[11px] text-slate-500 font-bold font-mono">Target Date: {evt.date}</p>
                </div>

                <div className="flex space-x-1.5">
                  <button
                    onClick={() => {
                      soundscape.playTapSound();
                      setShiftModalEvent(evt);
                      setTargetDate(evt.date);
                    }}
                    className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-emerald-700 text-xs font-bold flex items-center touch-target"
                    title="Shift event date (AI Dispatcher)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <Link href="/workout">
                    <Button3D variant="green" className="text-xs py-1.5 px-3">
                      Start Session
                    </Button3D>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Dynamic Re-Scheduler Banner */}
      <div className="duo-card p-4 rounded-3xl bg-amber-50 border border-amber-200 space-y-2 shadow-xs">
        <h3 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center">
          <Sparkles className="w-4 h-4 mr-1.5 text-amber-600" /> AI Dynamic Schedule Optimization
        </h3>
        <p className="text-xs text-slate-700 font-bold leading-snug">
          High recovery readiness detected for Wednesday! The AI Agent can auto-shift heavy volume sessions to peak CNS recovery days.
        </p>
      </div>
    </div>
  );
}
