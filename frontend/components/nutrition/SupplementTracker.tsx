"use client";

import React, { useState } from "react";
import { Pill, Check, Plus, Clock, Trash2, Sparkles, ShieldCheck } from "lucide-react";
import { useDietStore, SupplementTiming } from "@/store/useDietStore";
import { soundscape } from "@/lib/soundscapeEngine";

interface SupplementTrackerProps {
  dateStr: string;
}

export const SupplementTracker: React.FC<SupplementTrackerProps> = ({ dateStr }) => {
  const { supplementsByDate, toggleSupplementStatus, addSupplement, removeSupplement } = useDietStore();

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("1 scoop (5g)");
  const [timing, setTiming] = useState<SupplementTiming>("Pre-Workout");
  const [scheduledTime, setScheduledTime] = useState("16:00");
  const [isAdding, setIsAdding] = useState(false);

  const supps = supplementsByDate[dateStr] || [];
  const completedCount = supps.filter((s) => s.status === "completed").length;

  const handleToggle = (id: string) => {
    soundscape.playTapSound();
    toggleSupplementStatus(dateStr, id);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundscape.playTapSound();
    addSupplement(dateStr, {
      name,
      dosage,
      timing,
      scheduledTime,
      dateStr,
      badgeEmoji: timing === "Pre-Workout" ? "🔥" : timing === "Morning" ? "🌅" : "💊",
    });

    setName("");
    setIsAdding(false);
  };

  const timingBadges: Record<SupplementTiming, { emoji: string; bg: string }> = {
    Morning: { emoji: "🌅", bg: "bg-amber-100 text-amber-800 border-amber-300" },
    "With Meals": { emoji: "🥗", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    "Pre-Workout": { emoji: "🔥", bg: "bg-rose-100 text-rose-800 border-rose-300" },
    "Post-Workout": { emoji: "🥛", bg: "bg-purple-100 text-purple-800 border-purple-300" },
    Bedtime: { emoji: "🌙", bg: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  };

  return (
    <div className="duo-card p-4 sm:p-5 bg-white border-2 border-slate-200/90 rounded-3xl shadow-sm space-y-4 max-w-full overflow-hidden relative">
      {/* Background Glow Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2 flex-wrap sm:flex-nowrap relative z-10">
        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
            <Pill className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base font-black text-slate-900 leading-snug tracking-tight flex items-center gap-1.5">
              <span>Medicine, Gym Supplement & Drug Engine</span>
            </h2>
            <p className="text-[11px] font-bold text-slate-500 leading-tight">Track daily doses, timing slots, and medication check-offs</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-black transition-all flex items-center space-x-1.5 shadow-md shadow-purple-500/20 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>{isAdding ? "Cancel" : "Add Supp"}</span>
        </button>
      </div>

      {/* Add Supplement Form Drawer */}
      {isAdding && (
        <form onSubmit={handleAdd} className="p-3.5 bg-purple-50/80 border border-purple-200/90 rounded-2xl space-y-2.5 font-mono relative z-10 animate-smooth-reveal">
          <div className="flex items-center space-x-1.5 text-xs font-black text-purple-900">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Add Medication or Gym Supplement</span>
          </div>

          <input
            type="text"
            required
            placeholder="Supplement / Medication Name (e.g. Creatine, Omega-3)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-sans"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Dosage (5g / 1 pill)"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-sans"
            />
            <select
              value={timing}
              onChange={(e) => setTiming(e.target.value as SupplementTiming)}
              className="p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-sans"
            >
              <option value="Morning">🌅 Morning</option>
              <option value="With Meals">🥗 With Meals</option>
              <option value="Pre-Workout">🔥 Pre-Workout</option>
              <option value="Post-Workout">🥛 Post-Workout</option>
              <option value="Bedtime">🌙 Bedtime</option>
            </select>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-xs font-black hover:bg-purple-700 transition-all shadow-md active:scale-98"
          >
            ✨ Save Supplement / Drug Schedule
          </button>
        </form>
      )}

      {/* Checkable List */}
      <div className="space-y-2.5 relative z-10">
        {supps.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">No supplements or medications scheduled for today.</p>
        ) : (
          supps.map((supp) => {
            const isDone = supp.status === "completed";
            const badge = timingBadges[supp.timing] || { emoji: "💊", bg: "bg-slate-100 text-slate-800 border-slate-200" };

            return (
              <div
                key={supp.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 max-w-full overflow-hidden ${
                  isDone
                    ? "bg-purple-50/70 border-purple-200/90 opacity-90 shadow-none"
                    : "bg-white border-slate-200/90 hover:border-purple-300 shadow-2xs"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {/* Interactive Checkmark Button */}
                  <button
                    type="button"
                    onClick={() => handleToggle(supp.id)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                      isDone
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30 scale-105"
                        : "border-2 border-slate-300 hover:border-purple-500 text-transparent"
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className={`text-xs sm:text-sm font-black leading-snug whitespace-normal break-words inline-block ${isDone ? "line-through text-slate-400" : "text-slate-900"}`}>
                        {supp.name}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-black bg-purple-100/80 text-purple-800 rounded-lg border border-purple-300 shrink-0 font-mono">
                        {supp.dosage}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-500 flex-wrap gap-y-1">
                      <span className={`px-2 py-0.2 rounded-md border text-[10px] font-bold ${badge.bg}`}>
                        {badge.emoji} {supp.timing}
                      </span>
                      {supp.scheduledTime && (
                        <span className="flex items-center text-slate-400 shrink-0">
                          <Clock className="w-3 h-3 mr-0.5 inline text-slate-400" /> {supp.scheduledTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundscape.playTapSound();
                    removeSupplement(dateStr, supp.id);
                  }}
                  className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 shrink-0"
                  title="Delete supplement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
