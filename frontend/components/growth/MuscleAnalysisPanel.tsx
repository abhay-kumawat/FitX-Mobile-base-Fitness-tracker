"use client";

import React from "react";
import { Activity, Dumbbell, Zap, HeartPulse, TrendingUp, TrendingDown, BrainCircuit } from "lucide-react";

interface MuscleAnalysisPanelProps {
  muscleName: string;
  data: Record<string, any>;
}

export const MuscleAnalysisPanel: React.FC<MuscleAnalysisPanelProps> = ({ muscleName, data }) => {
  if (!data) return null;

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-md">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">{muscleName}</h3>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Deep Analytics</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-slate-900">{data.development_score}<span className="text-sm text-slate-400">/100</span></div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dev Score</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-center text-slate-500 mb-1">
            <Dumbbell className="w-3.5 h-3.5 mr-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Weekly Volume</span>
          </div>
          <div className="text-sm font-black text-slate-900">{data.weekly_volume_kg} <span className="text-xs text-slate-400">kg</span></div>
          <div className={`text-[10px] font-bold flex items-center mt-0.5 ${data.trend_pct > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {data.trend_pct > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
            {Math.abs(data.trend_pct)}% vs avg
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-center text-slate-500 mb-1">
            <Zap className="w-3.5 h-3.5 mr-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Effective Sets</span>
          </div>
          <div className="text-sm font-black text-slate-900">{data.effective_sets_7d} <span className="text-xs text-slate-400">sets / 7d</span></div>
          <div className="text-[10px] font-bold text-slate-400 mt-0.5">Avg Intensity: RPE {data.average_intensity_rpe}</div>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 col-span-2 flex items-center justify-between">
          <div>
            <div className="flex items-center text-slate-500 mb-1">
              <HeartPulse className="w-3.5 h-3.5 mr-1 text-rose-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Recovery Status</span>
            </div>
            <div className="text-sm font-black text-slate-900">{data.estimated_recovery_pct}% <span className="text-xs text-slate-400 font-medium">Restored</span></div>
          </div>
          
          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${data.estimated_recovery_pct > 80 ? 'bg-emerald-500' : data.estimated_recovery_pct > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${data.estimated_recovery_pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <BrainCircuit className="w-16 h-16 text-indigo-600" />
        </div>
        <div className="flex items-center space-x-1.5 mb-2 relative z-10">
          <BrainCircuit className="w-4 h-4 text-indigo-600" />
          <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600">AI Recommendation</span>
        </div>
        <p className="text-xs font-semibold text-indigo-900 leading-relaxed relative z-10">
          {data.ai_recommendation || "Maintain current training stimulus and focus on progressive overload."}
        </p>
      </div>
    </div>
  );
};
