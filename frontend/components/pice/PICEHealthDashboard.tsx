"use client";

import React, { useState, useEffect } from "react";
import { Activity, Sparkles, TrendingUp, Users, CheckCircle2, ShieldCheck, X, BarChart3, AlertCircle } from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

interface PICEHealthDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PICEHealthDashboard({
  isOpen,
  onClose,
}: PICEHealthDashboardProps) {
  const [healthData, setHealthData] = useState<any>(null);
  const [scorecards, setScorecards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPICEData();
    }
  }, [isOpen]);

  const loadPICEData = async () => {
    setIsLoading(true);
    try {
      const [h, s] = await Promise.all([
        fetchFromAPI("/pice/health-dashboard"),
        fetchFromAPI("/pice/feature-scorecard"),
      ]);
      setHealthData(h);
      setScorecards(s || []);
    } catch (e) {
      console.warn("PICE fetch error", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-cartoon-pop">
      <div className="w-full max-w-[360px] sm:max-w-xl cartoon-card p-4 sm:p-6 bg-gradient-to-br from-[#09111E] via-[#0E1A2E] to-[#182742] border-2 border-fitx-cyan/50 space-y-4 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-2xl bg-fitx-cyan/20 text-fitx-cyan">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center">
                Product Health (PICE) <Sparkles className="w-3.5 h-3.5 ml-1 text-fitx-cyan" />
              </h3>
              <p className="text-[9px] text-slate-400 font-mono">Real-Time Product & AI Health Telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 touch-target"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Health Key Metrics Grid */}
        {healthData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-0.5 min-w-0">
              <span className="text-[8px] font-mono font-bold uppercase text-slate-400 block truncate">DAU / WAU</span>
              <span className="text-xs font-mono font-extrabold text-white block truncate">14.2k / 125k</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-fitx-emerald/10 border border-fitx-emerald/30 space-y-0.5 min-w-0">
              <span className="text-[8px] font-mono font-bold uppercase text-fitx-emerald block truncate">Day-30 Retention</span>
              <span className="text-xs font-mono font-extrabold text-white block truncate">{healthData.day_30_retention_pct}%</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-fitx-solar/10 border border-fitx-solar/30 space-y-0.5 min-w-0">
              <span className="text-[8px] font-mono font-bold uppercase text-fitx-solar block truncate">Finish Rate</span>
              <span className="text-xs font-mono font-extrabold text-white block truncate">{healthData.workout_completion_rate_pct}%</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-fitx-cyan/10 border border-fitx-cyan/30 space-y-0.5 min-w-0">
              <span className="text-[8px] font-mono font-bold uppercase text-fitx-cyan block truncate">AI Accept %</span>
              <span className="text-xs font-mono font-extrabold text-white block truncate">{healthData.ai_recommendation_acceptance_rate_pct}%</span>
            </div>
          </div>
        )}

        {/* Feature Quality Scorecards */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-mono font-extrabold uppercase text-slate-300 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1 text-fitx-cyan" /> Top Feature Quality Scorecards
          </h4>

          <div className="space-y-2">
            {scorecards.map((sc, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between font-mono text-xs"
              >
                <div>
                  <h5 className="font-extrabold text-white">{sc.feature_name}</h5>
                  <p className="text-[10px] text-slate-400">
                    MAU: {sc.monthly_active_users.toLocaleString()} • Avg Time: {sc.avg_completion_time_sec}s
                  </p>
                </div>

                <div className="text-right space-y-0.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-fitx-emerald/15 text-fitx-emerald border border-fitx-emerald/30 block">
                    {sc.task_success_rate_pct}% Success
                  </span>
                  <span className="text-[9px] text-slate-400 block">
                    Value: {sc.user_value_rating}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
