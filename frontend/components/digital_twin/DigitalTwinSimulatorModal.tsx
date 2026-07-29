"use client";

import React, { useState } from "react";
import { Cpu, Sparkles, TrendingUp, X, Sliders, Zap, ShieldCheck } from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

interface DigitalTwinSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DigitalTwinSimulatorModal({
  isOpen,
  onClose,
}: DigitalTwinSimulatorModalProps) {
  const [days, setDays] = useState(4);
  const [sleep, setSleep] = useState(8.0);
  const [protein, setProtein] = useState(165);
  const [isLoading, setIsLoading] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleRunSimulation = async () => {
    setIsLoading(true);
    try {
      const res = await fetchFromAPI("/digital-twin/simulate-what-if", {
        method: "POST",
        body: JSON.stringify({
          training_days_per_week: days,
          target_sleep_hours: sleep,
          daily_protein_grams: protein,
        }),
      });
      if (res) {
        setSimResult(res);
      }
    } catch (err) {
      console.warn("What-If sim fetch error", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-cartoon-pop">
      <div className="w-full max-w-lg cartoon-card p-6 bg-gradient-to-br from-[#0D131F] via-[#121A2B] to-[#1D283E] border-2 border-fitx-cyan/50 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-2xl bg-fitx-cyan/20 text-fitx-cyan">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight flex items-center">
                Digital Twin What-If Simulator <Sparkles className="w-3.5 h-3.5 ml-1 text-fitx-cyan" />
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">Personal Response Curve Simulation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 touch-target"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Scenario Adjustment Sliders */}
        <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold">Training Days / Week:</span>
              <span className="text-fitx-cyan font-bold">{days} Days</span>
            </div>
            <input
              type="range"
              min="2"
              max="6"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full accent-fitx-cyan"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold">Target Nightly Sleep:</span>
              <span className="text-fitx-solar font-bold">{sleep} Hours</span>
            </div>
            <input
              type="range"
              min="5.0"
              max="10.0"
              step="0.5"
              value={sleep}
              onChange={(e) => setSleep(parseFloat(e.target.value))}
              className="w-full accent-fitx-solar"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold">Daily Protein Intake:</span>
              <span className="text-fitx-sage font-bold">{protein} Grams</span>
            </div>
            <input
              type="range"
              min="100"
              max="250"
              step="5"
              value={protein}
              onChange={(e) => setProtein(parseInt(e.target.value))}
              className="w-full accent-fitx-sage"
            />
          </div>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isLoading}
          className="w-full py-3.5 cartoon-btn-cyan text-xs uppercase tracking-wider font-extrabold flex items-center justify-center touch-target"
        >
          {isLoading ? "Running Digital Twin Monte Carlo Sim..." : "Run Scenario Simulation ✨"}
        </button>

        {/* Simulation Output Card */}
        {simResult && (
          <div className="space-y-3 animate-cartoon-pop pt-1">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-fitx-cyan/10 border border-fitx-cyan/30 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-fitx-cyan block">Readiness Delta</span>
                <span className="text-base font-mono font-extrabold text-white">
                  {simResult.predicted_readiness_delta_pct > 0 ? "+" : ""}{simResult.predicted_readiness_delta_pct}%
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-fitx-solar/10 border border-fitx-solar/30 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-fitx-solar block">Bench 1RM Projection</span>
                <span className="text-base font-mono font-extrabold text-white">
                  {simResult.projected_1rm_bench_kg} kg
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-xs font-bold text-fitx-sage flex items-center">
                <TrendingUp className="w-4 h-4 mr-1.5" /> Projected 12-Week Adaptations
              </div>
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>Muscle Retention:</span>
                <strong className="text-fitx-emerald">+{simResult.projected_12_week_muscle_gain_kg} kg</strong>
              </div>
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>Soreness Duration:</span>
                <strong className="text-fitx-solar">{simResult.soreness_duration_hours} Hours</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-fitx-cyan/15 to-fitx-sage/15 border border-fitx-cyan/40 space-y-1">
              <div className="text-xs font-bold text-white flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-fitx-sage" /> Digital Twin AI Verdict
              </div>
              <p className="text-xs text-slate-200 leading-snug">
                {simResult.ai_recommendation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
