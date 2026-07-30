"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useDragControls, AnimatePresence } from "framer-motion";
import { Sparkles, X, Minimize2, CheckCircle2, ChevronRight, Activity, Calendar, LayoutDashboard } from "lucide-react";
import CoachChatWindow from "./CoachChatWindow";

import { fitxAPI } from "@/lib/api";
import { AIPlanReviewModal } from "./AIPlanReviewModal";
import { useWorkoutStore } from "@/store/useWorkoutStore";

export function DraggableFloatingAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"chat" | "workspace" | "quick">("chat");
  const [diffData, setDiffData] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const dragControls = useDragControls();

  const handleProposeDiff = async (type: string) => {
    try {
      const currentExercises = useWorkoutStore.getState().exercises;
      const res = await fitxAPI.proposeAIPlanDiff(type, currentExercises);
      if (res && res.diff_data) {
        setDiffData(res.diff_data);
        setShowReviewModal(true);
      }
    } catch (e) {
      console.warn("Failed to propose diff", e);
    }
  };

  const handleApproveDiff = async () => {
    if (!diffData) return;
    try {
      await fitxAPI.applyAIPlanDiff(1, diffData);
      
      // Update local Zustand exercises
      const store = useWorkoutStore.getState();
      let currentList = [...store.exercises];

      // Process removals
      const removedNames = (diffData.removed || []).map((r: any) => r.name);
      currentList = currentList.filter(ex => !removedNames.includes(ex.name));

      // Process additions
      (diffData.added || []).forEach((added: any, idx: number) => {
        currentList.push({
          id: `ai_add_${Date.now()}_${idx}`,
          name: added.name,
          muscleTag: "AI Safe Target",
          formGuard: "Form Guard: AI Guided Tempo",
          tips: [added.rationale],
          targetSets: 3,
          sets: [
            { setNumber: 1, weightKg: 20, reps: 10, completed: false, type: "work" },
            { setNumber: 2, weightKg: 25, reps: 10, completed: false, type: "work" },
            { setNumber: 3, weightKg: 25, reps: 8, completed: false, type: "work" }
          ]
        });
      });

      store.loadPlanIntoActive(store.workoutName, currentList);
    } catch (e) {
      console.warn("Failed to apply diff", e);
    }
  };

  // Track window dimensions for drag constraints
  const [constraints, setConstraints] = useState({ top: 0, left: 0, right: 0, bottom: 0 });
  
  useEffect(() => {
    setConstraints({
      top: 20,
      left: 20,
      right: window.innerWidth - 80,
      bottom: window.innerHeight - 80
    });
    
    const handleResize = () => {
      setConstraints({
        top: 20,
        left: 20,
        right: window.innerWidth - 80,
        bottom: window.innerHeight - 80
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Draggable Bubble */}
      <motion.div
        drag
        dragControls={dragControls}
        dragConstraints={constraints}
        dragElastic={0.1}
        dragMomentum={false}
        className="fixed z-50 flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none", right: 20, bottom: 100 }}
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <button 
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Sparkles className="w-6 h-6 text-white" />
          {/* Unread badge */}
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
      </motion.div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed inset-4 md:inset-auto md:bottom-24 md:right-6 md:w-[400px] md:h-[600px] z-50 flex flex-col bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Coach</h3>
                  <p className="text-[10px] text-emerald-400">Connected to your data</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-2 bg-slate-900 border-b border-slate-800">
              <button 
                onClick={() => setMode("chat")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${mode === "chat" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-slate-300"}`}
              >
                Chat
              </button>
              <button 
                onClick={() => setMode("workspace")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${mode === "workspace" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-slate-300"}`}
              >
                Workspace
              </button>
              <button 
                onClick={() => setMode("quick")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${mode === "quick" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-slate-300"}`}
              >
                Actions
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
              {mode === "chat" && (
                <div className="absolute inset-0">
                  <CoachChatWindow />
                </div>
              )}

              {mode === "workspace" && (
                <div className="absolute inset-0 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-950">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Proposed Changes</h4>
                    
                    <div className="flex flex-col gap-3">
                      <div className="p-3 bg-slate-800 rounded-lg flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-red-400 line-through">Barbell Bench</span>
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                          <span className="text-emerald-400 font-bold">Neutral DB Press</span>
                        </div>
                        <p className="text-xs text-slate-400">
                          <span className="text-emerald-500 font-bold">Reason:</span> Shoulder joint safety optimization.
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <button 
                            onClick={() => handleProposeDiff("shoulder_pain")}
                            className="flex-1 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-md hover:bg-emerald-600 transition-colors"
                          >
                            Review Diff
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {mode === "quick" && (
                <div className="absolute inset-0 p-4 grid grid-cols-2 gap-3 bg-slate-950 content-start">
                  {[
                    { icon: <Activity />, label: "Recovery Check", type: "general" },
                    { icon: <LayoutDashboard />, label: "Generate Workout", type: "general" },
                    { icon: <Calendar />, label: "Weekly Review", type: "general" },
                    { icon: <Sparkles />, label: "Replace Exercise", type: "shoulder_pain" }
                  ].map((action, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleProposeDiff(action.type)}
                      className="flex flex-col items-center gap-2 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-emerald-500/50 transition-all group"
                    >
                      <div className="text-slate-400 group-hover:text-emerald-400">{action.icon}</div>
                      <span className="text-xs font-bold text-slate-300">{action.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Plan Review Diff Modal */}
      <AIPlanReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        diffData={diffData}
        onApprove={handleApproveDiff}
        onReject={() => setShowReviewModal(false)}
      />
    </>
  );
}
