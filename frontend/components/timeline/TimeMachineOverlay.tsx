"use client";

import React, { useState } from "react";
import { History, Sparkles, TrendingUp, ShieldCheck, X, Zap, ArrowRight } from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

interface TimeMachineOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TimeMachineOverlay({ isOpen, onClose }: TimeMachineOverlayProps) {
  const [windowAStart, setWindowAStart] = useState("2026-05-01");
  const [windowAEnd, setWindowAEnd] = useState("2026-05-31");
  const [windowBStart, setWindowBStart] = useState("2026-06-01");
  const [windowBEnd, setWindowBEnd] = useState("2026-06-30");

  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await fetchFromAPI("/timeline/time-machine", {
        method: "POST",
        body: JSON.stringify({
          window_a_start: windowAStart,
          window_a_end: windowAEnd,
          window_b_start: windowBStart,
          window_b_end: windowBEnd,
        }),
      });
      if (res) {
        setAnalysisResult(res);
      }
    } catch (e) {
      console.warn("Time Machine query warning", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-cartoon-pop">
      <div className="w-full max-w-lg cartoon-card p-6 bg-gradient-to-br from-[#121824] via-[#0E1522] to-[#1C2538] border-2 border-fitx-solar/50 relative space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-2xl bg-fitx-solar/20 text-fitx-solar border border-fitx-solar/40">
              <History className="w-5 h-5 animate-cartoon-wiggle" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center">
                Fitness Time Machine <Sparkles className="w-3.5 h-3.5 ml-1 text-fitx-solar" />
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Comparative Historical AI Behavioral Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 touch-target"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date Window Selection Controls */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-fitx-cyan tracking-wider">Window A (Baseline)</span>
            <input
              type="date"
              value={windowAStart}
              onChange={(e) => setWindowAStart(e.target.value)}
              className="w-full p-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white font-mono"
            />
            <input
              type="date"
              value={windowAEnd}
              onChange={(e) => setWindowAEnd(e.target.value)}
              className="w-full p-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-fitx-solar tracking-wider">Window B (Comparison)</span>
            <input
              type="date"
              value={windowBStart}
              onChange={(e) => setWindowBStart(e.target.value)}
              className="w-full p-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white font-mono"
            />
            <input
              type="date"
              value={windowBEnd}
              onChange={(e) => setWindowBEnd(e.target.value)}
              className="w-full p-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white font-mono"
            />
          </div>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={isLoading}
          className="w-full py-3.5 cartoon-btn-cyan text-xs uppercase tracking-wider font-extrabold flex items-center justify-center touch-target"
        >
          {isLoading ? "Reconstructing Time Machine Containers..." : "Reconstruct & Analyze Snapshot ✨"}
        </button>

        {/* Comparative Analysis Results Card */}
        {analysisResult && (
          <div className="space-y-4 animate-cartoon-pop pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-fitx-cyan/10 border border-fitx-cyan/30 space-y-1">
                <div className="text-[10px] uppercase font-bold text-fitx-cyan">Window A Volume</div>
                <div className="text-sm font-mono font-extrabold text-white">
                  {analysisResult.window_a_summary?.avg_weekly_volume_kg} kg/wk
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Sleep: {analysisResult.window_a_summary?.avg_sleep_hours}h | Adherence: {analysisResult.window_a_summary?.adherence_rate_pct}%
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-fitx-solar/10 border border-fitx-solar/30 space-y-1">
                <div className="text-[10px] uppercase font-bold text-fitx-solar">Window B Volume</div>
                <div className="text-sm font-mono font-extrabold text-white">
                  {analysisResult.window_b_summary?.avg_weekly_volume_kg} kg/wk
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Sleep: {analysisResult.window_b_summary?.avg_sleep_hours}h | Adherence: {analysisResult.window_b_summary?.adherence_rate_pct}%
                </div>
              </div>
            </div>

            {/* AI Comparative Insights */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-xs font-bold text-fitx-cyan flex items-center">
                <TrendingUp className="w-4 h-4 mr-1.5" /> Key Historical Behavioral Insights
              </div>
              <ul className="space-y-1.5">
                {analysisResult.comparative_insights?.map((insight: string, idx: number) => (
                  <li key={idx} className="text-xs text-slate-300 font-medium flex items-start">
                    <span className="text-fitx-solar font-bold mr-1.5">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actionable AI Recommendation */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-fitx-cyan/15 to-fitx-sage/15 border border-fitx-cyan/40 space-y-1.5">
              <div className="text-xs font-bold text-white flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-fitx-sage" /> Time Machine AI Recommendation
              </div>
              <p className="text-xs text-slate-200 leading-snug">
                {analysisResult.ai_recommendation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
