"use client";

import React, { useState } from "react";
import { Sparkles, Check, X, ArrowRight, Activity, Zap, RefreshCw } from "lucide-react";
import { soundscape } from "@/lib/soundscapeEngine";

export interface AIRecommendation {
  type: "ADD" | "REMOVE" | "MODIFY";
  foodName: string;
  amount?: string;
  reason: string;
  confidence: number;
  expectedImpact: string;
  originalFoodName?: string;
}

interface NutritionAIReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations: AIRecommendation[];
  onApprove: (rec: AIRecommendation) => void;
  onRegenerate: () => void;
}

export const NutritionAIReviewModal: React.FC<NutritionAIReviewModalProps> = ({
  isOpen,
  onClose,
  recommendations,
  onApprove,
  onRegenerate,
}) => {
  const [loadingState, setLoadingState] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const handleApprove = async (idx: number, rec: AIRecommendation) => {
    soundscape.playSuccessSound();
    setLoadingState({ ...loadingState, [idx]: true });
    
    // Simulate backend sync delay
    setTimeout(() => {
      onApprove(rec);
      setLoadingState({ ...loadingState, [idx]: false });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-slide-up z-10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2.5 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-2xl text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-snug">AI Meal Plan Review</h2>
              <p className="text-xs font-medium text-slate-500">Review proposed changes before applying.</p>
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

        <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500 font-medium flex flex-col items-center">
              <Check className="w-8 h-8 text-emerald-400 mb-2" />
              Your plan is already optimal. No changes suggested.
            </div>
          ) : (
            recommendations.map((rec, idx) => {
              const isAdd = rec.type === "ADD";
              const isRemove = rec.type === "REMOVE";
              const isModify = rec.type === "MODIFY";
              
              let headerColor = "text-indigo-600";
              let badgeColor = "bg-indigo-100 text-indigo-700 border-indigo-200";
              
              if (isAdd) {
                headerColor = "text-emerald-600";
                badgeColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
              } else if (isRemove) {
                headerColor = "text-rose-600";
                badgeColor = "bg-rose-100 text-rose-700 border-rose-200";
              } else if (isModify) {
                headerColor = "text-amber-600";
                badgeColor = "bg-amber-100 text-amber-700 border-amber-200";
              }

              return (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${badgeColor.split(' ')[0]}`} />
                  
                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeColor}`}>
                          {rec.type}
                        </span>
                        <span className="text-xs font-bold text-slate-400 flex items-center">
                          <Activity className="w-3 h-3 mr-1" />
                          {rec.confidence}% Confidence
                        </span>
                      </div>
                      
                      <h3 className="text-sm font-black text-slate-900 mt-1">
                        {isModify ? (
                          <div className="flex items-center gap-2">
                            <span className="line-through text-slate-400">{rec.originalFoodName}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span>{rec.foodName} <span className="text-slate-500 font-medium text-xs">({rec.amount})</span></span>
                          </div>
                        ) : (
                          <span>{rec.foodName} {rec.amount && <span className="text-slate-500 font-medium text-xs">({rec.amount})</span>}</span>
                        )}
                      </h3>
                    </div>
                  </div>

                  <div className="pl-2 space-y-2">
                    <div className="bg-white border border-slate-100 p-2.5 rounded-xl shadow-sm">
                      <p className="text-[11px] font-bold text-slate-700 flex items-start">
                        <span className="text-slate-400 font-black mr-1 uppercase">Reason:</span> 
                        {rec.reason}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg flex items-center">
                        <Zap className="w-3 h-3 mr-1" /> Impact: {rec.expectedImpact}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pl-2 pt-2 border-t border-slate-100 flex gap-2">
                    <button
                      disabled={loadingState[idx]}
                      onClick={() => handleApprove(idx, rec)}
                      className={`flex-1 py-2 text-xs font-black text-white rounded-xl shadow-sm transition-transform active:scale-95 flex justify-center items-center ${isRemove ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                    >
                      {loadingState[idx] ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Approve"}
                    </button>
                    <button className="px-3 py-2 text-xs font-black text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <button 
            onClick={onRegenerate}
            className="text-[11px] font-bold text-slate-500 flex items-center hover:text-indigo-600 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Regenerate All
          </button>
          
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
