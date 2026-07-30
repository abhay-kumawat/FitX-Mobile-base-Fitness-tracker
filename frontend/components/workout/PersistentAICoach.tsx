"use client";

import React, { useState, useEffect } from "react";
import { MascotVector } from "@/components/atomic/MascotVector";
import { Sparkles, Check, X, ArrowRight, AlertTriangle } from "lucide-react";
import { soundscape } from "@/lib/soundscapeEngine";

interface Recommendation {
  id: string;
  message: string;
  action: string;
  value?: any;
}

export function PersistentAICoach() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: "r1",
      message: "You skipped shoulders twice last week. Consider adding Lateral Raises to today's session.",
      action: "add_exercise",
      value: "Lateral Raises"
    },
    {
      id: "r2",
      message: "Sleep was poor yesterday (4.5h). Recommend dropping working weight by 10% to avoid CNS fatigue.",
      action: "reduce_weight",
      value: 10
    }
  ]);
  
  const [isExpanded, setIsExpanded] = useState(true);

  const handleApply = (id: string) => {
    soundscape.playSuccessSound();
    setRecommendations(prev => prev.filter(r => r.id !== id));
  };

  const handleDismiss = (id: string) => {
    soundscape.playTapSound();
    setRecommendations(prev => prev.filter(r => r.id !== id));
  };

  if (!isExpanded) {
    return (
      <button 
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-24 right-4 p-3 bg-slate-900 rounded-full shadow-lg border border-slate-700 z-50 flex items-center justify-center animate-pulse-soft"
      >
        <MascotVector mood="pumped" size={32} />

        {recommendations.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">
            {recommendations.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="bg-slate-900 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MascotVector mood="pumped" size={28} />

          <span className="text-sm font-black text-white flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> AI Coach
          </span>
        </div>
        <button onClick={() => setIsExpanded(false)} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-3 max-h-96 overflow-y-auto bg-slate-50">
        {recommendations.length === 0 ? (
          <div className="text-center py-4 text-xs font-bold text-slate-400 flex flex-col items-center gap-2">
            <Check className="w-6 h-6 text-emerald-400" />
            No active alerts. You're doing great!
          </div>
        ) : (
          recommendations.map(rec => (
            <div key={rec.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  {rec.message}
                </p>
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => handleApply(rec.id)}
                  className="flex-1 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-black uppercase tracking-wide hover:bg-emerald-100 transition-colors"
                >
                  Apply Change
                </button>
                <button
                  onClick={() => handleDismiss(rec.id)}
                  className="px-3 py-1.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-wide hover:bg-slate-100 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
