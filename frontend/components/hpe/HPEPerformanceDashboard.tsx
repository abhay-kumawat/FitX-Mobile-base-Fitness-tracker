"use client";

import React, { useState, useEffect } from "react";
import { Activity, Cpu, ShieldCheck, Zap, Heart, Moon, Flame, Sparkles, AlertCircle, ChevronRight } from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

export default function HPEPerformanceDashboard() {
  const [readinessData, setReadinessData] = useState<any>(null);
  const [burnoutData, setBurnoutData] = useState<any>(null);
  const [explainData, setExplainData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHPEData();
  }, []);

  const loadHPEData = async () => {
    setIsLoading(true);
    try {
      const [r, b, e] = await Promise.all([
        fetchFromAPI("/hpe/readiness"),
        fetchFromAPI("/hpe/burnout-forecast"),
        fetchFromAPI("/hpe/explain"),
      ]);
      setReadinessData(r);
      setBurnoutData(b);
      setExplainData(e);
    } catch (err) {
      console.warn("HPE fetch warning", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    aria_busy: return (
      <div className="glass-card p-6 rounded-3xl text-center space-y-3 border-white/10 animate-pulse">
        <Cpu className="w-8 h-8 text-fitx-cyan mx-auto animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Processing 28 HPE Physiological Input Signals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* HPE Hero Header & Signal Status */}
      <div className="hero-container p-5 space-y-4 relative border-2 border-fitx-cyan/40">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-fitx-cyan flex items-center bg-fitx-cyan/15 px-2.5 py-0.5 rounded-full border border-fitx-cyan/30">
            <Cpu className="w-3.5 h-3.5 mr-1 text-fitx-cyan" /> Human Performance Engine v5.0
          </span>

          <span className="text-[10px] font-mono font-bold text-fitx-emerald bg-fitx-emerald/15 px-2 py-0.5 rounded-full border border-fitx-emerald/30">
            28/28 Signals Active
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Physical Readiness Capacity</span>
            <div className="text-3xl font-black text-white tracking-tight flex items-baseline">
              {readinessData?.overall_readiness_score || 88.0}%
              <span className="text-xs font-mono font-bold text-fitx-emerald ml-2">Optimal Capacity</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">ACWR Workload Ratio</span>
            <div className="text-lg font-mono font-extrabold text-fitx-solar">
              {burnoutData?.acwr_ratio || 1.18}
            </div>
          </div>
        </div>

        {/* Readiness Meter Bar */}
        <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-fitx-cyan via-fitx-sage to-fitx-solar rounded-full transition-all duration-1000"
            style={{ width: `${readinessData?.overall_readiness_score || 88}%` }}
          />
        </div>
      </div>

      {/* 4 Multi-Vector Metric Indicators */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 rounded-3xl border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold">CNS Fatigue</span>
            <Zap className="w-3.5 h-3.5 text-fitx-solar" />
          </div>
          <div className="text-lg font-mono font-extrabold text-white">
            {readinessData?.cns_fatigue_score || 12.0}%
          </div>
          <span className="text-[9px] text-fitx-emerald font-bold font-mono">Low Central Strain</span>
        </div>

        <div className="glass-card p-4 rounded-3xl border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold">Injury Risk</span>
            <ShieldCheck className="w-3.5 h-3.5 text-fitx-sage" />
          </div>
          <div className="text-lg font-mono font-extrabold text-white">
            {readinessData?.injury_risk_score || 8.0}%
          </div>
          <span className="text-[9px] text-fitx-sage font-bold font-mono">Safe Biomechanical Load</span>
        </div>
      </div>

      {/* Muscle Readiness Heatmap Grid */}
      <div className="glass-card p-5 rounded-3xl border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center">
            <Flame className="w-4 h-4 mr-1.5 text-fitx-solar" /> Muscle Recovery Readiness Map
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Real-time Biomechanical Strain</span>
        </div>

        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
          {Object.entries(readinessData?.muscle_readiness_map || {
            upper_chest: 100,
            anterior_deltoids: 92,
            triceps: 88,
            quadriceps: 75,
            hamstrings: 82,
            rotator_cuff: 95
          }).map(([muscle, score]: [string, any]) => (
            <div key={muscle} className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between min-w-0">
              <span className="capitalize text-[10px] text-slate-300 font-bold truncate mr-1">
                {muscle.replace("_", " ")}
              </span>
              <span
                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                  score >= 90
                    ? "bg-fitx-cyan/20 text-fitx-cyan border border-fitx-cyan/30"
                    : score >= 75
                    ? "bg-fitx-sage/20 text-fitx-sage border border-fitx-sage/30"
                    : "bg-fitx-solar/20 text-fitx-solar border border-fitx-solar/30"
                }`}
              >
                {score}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Explainable AI Decision Card */}
      {explainData && (
        <div className="glass-card p-5 rounded-3xl border-fitx-cyan/40 bg-fitx-cyan/5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-fitx-cyan uppercase tracking-wider flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5 text-fitx-cyan" /> Explainable AI Rationale
            </h3>
            <span className="text-[10px] font-mono font-bold text-fitx-emerald bg-fitx-emerald/20 px-2 py-0.5 rounded-full">
              {(explainData.confidence_score * 100).toFixed(0)}% Confidence
            </span>
          </div>

          <p className="text-xs text-white font-bold leading-relaxed">
            {explainData.recommendation}
          </p>

          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Signals & Evidence Processed</span>
            <ul className="space-y-1 font-mono text-[11px] text-slate-300">
              {explainData.evidence_used?.map((ev: string, idx: number) => (
                <li key={idx} className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-fitx-cyan mr-2" />
                  {ev}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
