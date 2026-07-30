"use client";

import React, { useState } from "react";
import { 
  X, Edit3, RefreshCw, Trash2, Copy, MoveRight, ArrowLeftRight, 
  Moon, Sparkles, History, FileText, CheckCircle, Zap
} from "lucide-react";
import { soundscape } from "@/lib/soundscapeEngine";
import { useWorkoutStore } from "@/store/useWorkoutStore";

export function DayActionContextMenu() {
  const store = useWorkoutStore();
  const isOpen = store.showContextMenu;
  const targetDate = store.activeContextMenuDate || store.selectedDate;

  const [activeTab, setActiveTab] = useState<"menu" | "move" | "swap" | "notes" | "history">("menu");
  const [targetDateInput, setTargetDateInput] = useState<string>("");
  const [notesInput, setNotesInput] = useState<string>("");
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  if (!isOpen) return null;

  const dateFormatted = new Date(targetDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });

  const assignment = store.calendarAssignments[targetDate];

  const handleClose = () => {
    soundscape.playTapSound();
    setActiveTab("menu");
    store.toggleContextMenu(false, null);
  };

  const handleAction = async (actionType: string, target?: string, payload?: any) => {
    soundscape.playTapSound();
    await store.performDayActionStore(targetDate, actionType, target, payload);
    handleClose();
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const { fitxAPI } = await import("@/lib/api");
      const res = await fitxAPI.getDayHistory(targetDate);
      setHistoryLogs(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Day Operations</span>
            <h2 className="text-base font-black text-slate-900">{dateFormatted}</h2>
            {assignment && (
              <span className="text-[11px] font-bold text-slate-500 capitalize">
                Current: {assignment.name} ({assignment.assignment_type})
              </span>
            )}
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Menu */}
        {activeTab === "menu" && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                store.selectDate(targetDate);
                handleClose();
              }}
              className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors text-left"
            >
              <Edit3 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-black">Edit Structure</span>
                <span className="text-[9px] text-emerald-700 font-bold">Focus & Edit Day</span>
              </div>
            </button>

            <button
              onClick={() => handleAction("ai_optimize")}
              className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 transition-colors text-left"
            >
              <Zap className="w-4 h-4 text-purple-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-black">AI Optimize</span>
                <span className="text-[9px] text-purple-700 font-bold">Adjust Volume</span>
              </div>
            </button>

            <button
              onClick={() => handleAction("ai_generate")}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors text-left col-span-2"
            >
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-black">AI Re-Generate Workout</span>
                <span className="text-[9px] text-slate-400 font-bold">Generate target plan for {dateFormatted}</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("move")}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 transition-colors text-left"
            >
              <MoveRight className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-black">Move Workout</span>
                <span className="text-[9px] text-slate-500 font-bold">Shift to date</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("swap")}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 transition-colors text-left"
            >
              <ArrowLeftRight className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-black">Swap Days</span>
                <span className="text-[9px] text-slate-500 font-bold">Exchange dates</span>
              </div>
            </button>

            <button
              onClick={() => handleAction("rest")}
              className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 hover:bg-indigo-100 transition-colors text-left"
            >
              <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-black">Convert to Rest</span>
                <span className="text-[9px] text-indigo-600 font-bold">Clear to rest</span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab("history");
                loadHistory();
              }}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 transition-colors text-left"
            >
              <History className="w-4 h-4 text-teal-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-black">Revision History</span>
                <span className="text-[9px] text-slate-500 font-bold">Audit log</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("notes")}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 transition-colors text-left"
            >
              <FileText className="w-4 h-4 text-slate-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-black">Day Notes</span>
                <span className="text-[9px] text-slate-500 font-bold">Add remarks</span>
              </div>
            </button>

            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete the workout on ${dateFormatted}?`)) {
                  store.performDayActionStore(targetDate, "delete");
                  handleClose();
                }
              }}
              className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 hover:bg-rose-100 transition-colors text-left"
            >
              <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-black">Delete Assignment</span>
                <span className="text-[9px] text-rose-600 font-bold">Clear date</span>
              </div>
            </button>
          </div>
        )}

        {/* Move / Swap Subview */}
        {(activeTab === "move" || activeTab === "swap") && (
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setActiveTab("menu")}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 self-start mb-1"
            >
              ← Back to operations
            </button>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              {activeTab === "move" ? "Move Workout to Another Date" : "Swap Workout with Another Date"}
            </h3>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-slate-600">Select target day:</span>
              <input
                type="date"
                value={targetDateInput}
                onChange={(e) => setTargetDateInput(e.target.value)}
                className="p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                disabled={!targetDateInput}
                onClick={() => handleAction(activeTab, targetDateInput)}
                className="mt-2 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-40 hover:bg-emerald-600 transition-colors"
              >
                Confirm {activeTab === "move" ? "Move" : "Swap"}
              </button>
            </div>
          </div>
        )}

        {/* Notes Subview */}
        {activeTab === "notes" && (
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setActiveTab("menu")}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 self-start mb-1"
            >
              ← Back to operations
            </button>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Day Notes & Reminders</h3>
            <textarea
              rows={4}
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="e.g. Focus on chest arch, slight knee pain on left leg..."
              className="p-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
            <button
              onClick={() => handleAction("update_notes", undefined, { notes: notesInput })}
              className="py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-600 transition-colors"
            >
              Save Notes
            </button>
          </div>
        )}

        {/* History Subview */}
        {activeTab === "history" && (
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setActiveTab("menu")}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 self-start mb-1"
            >
              ← Back to operations
            </button>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Revision History</h3>
            {loadingHistory ? (
              <span className="text-xs text-slate-400 py-4 text-center">Loading audit log...</span>
            ) : historyLogs.length === 0 ? (
              <span className="text-xs text-slate-400 py-4 text-center">No previous revisions recorded</span>
            ) : (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {historyLogs.map((log: any) => (
                  <div key={log.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase text-emerald-700">{log.action}</span>
                      <span className="text-[9px] font-bold text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                    <span className="text-[10px] text-slate-600 font-medium">Changed workout structure</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
