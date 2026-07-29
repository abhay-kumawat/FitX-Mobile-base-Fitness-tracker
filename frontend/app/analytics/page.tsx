"use client";

import React, { useState } from "react";
import { BarChart3, Trophy, Sparkles } from "lucide-react";
import ExerciseGraph from "@/components/constellation/ExerciseGraph";
import PICEHealthDashboard from "@/components/pice/PICEHealthDashboard";
import { PillBadge } from "@/components/atomic/PillBadge";
import { Button3D } from "@/components/atomic/Button3D";
import { soundscape } from "@/lib/soundscapeEngine";

export default function AnalyticsPage() {
  const [showPICEDashboard, setShowPICEDashboard] = useState(false);

  const weeklyData = [
    { day: "Mon", volume: 3200, adherence: 100 },
    { day: "Tue", volume: 4100, adherence: 100 },
    { day: "Wed", volume: 2800, adherence: 85 },
    { day: "Thu", volume: 4500, adherence: 100 },
    { day: "Fri", volume: 3900, adherence: 100 },
    { day: "Sat", volume: 4800, adherence: 100 },
    { day: "Sun", volume: 1500, adherence: 90 },
  ];

  const maxVolume = 5000;

  return (
    <div className="space-y-4 pb-24 animate-smooth-reveal">
      <PICEHealthDashboard isOpen={showPICEDashboard} onClose={() => setShowPICEDashboard(false)} />

      {/* Weekly Performance Header */}
      <div className="duo-card p-5 bg-white border border-slate-200 relative shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <PillBadge variant="green" icon={<Sparkles className="w-3.5 h-3.5" />}>
            Performance Intelligence
          </PillBadge>
          <Button3D
            variant="secondary"
            onClick={() => {
              soundscape.playTapSound();
              setShowPICEDashboard(true);
            }}
            className="text-xs py-1 px-3"
          >
            <BarChart3 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> PICE Telemetry
          </Button3D>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-[10px] text-slate-500 font-extrabold uppercase">Total Volume Lifted</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              24,800 kg
            </p>
            <span className="text-[10px] text-emerald-700 font-bold">↑ 14% vs Last Week</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-[10px] text-slate-500 font-extrabold uppercase">Adherence Score</p>
            <p className="text-xl font-black text-emerald-600 mt-0.5">
              98%
            </p>
            <span className="text-[10px] text-amber-700 font-bold">7 / 7 Days On Track</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
          <div className="font-black text-amber-900 flex items-center mb-0.5">
            <Trophy className="w-3.5 h-3.5 mr-1 text-amber-600" /> AI Performance Verdict
          </div>
          <p className="text-[11px] text-slate-700 font-bold leading-snug">
            Outstanding progressive overload execution! Your recovery readiness matched your high-volume squat session perfectly.
          </p>
        </div>
      </div>

      {/* Skill Tree / Constellation Node View */}
      <ExerciseGraph />

      {/* Volume Load & Adherence Bar Chart */}
      <div className="duo-card p-5 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-bold">Volume Telemetry</span>
            <h3 className="text-sm font-black text-slate-900 flex items-center">
              <BarChart3 className="w-4 h-4 mr-1.5 text-emerald-600" /> Weekly Volume Load (kg)
            </h3>
          </div>
          <PillBadge variant="green">
            Peak: 4,800 kg
          </PillBadge>
        </div>

        {/* Custom Light Mode Bar Chart */}
        <div className="h-44 w-full pt-4 pb-2 flex items-end justify-between px-1 sm:px-2 bg-slate-50 rounded-2xl border border-slate-200 min-w-0">
          {weeklyData.map((d, i) => {
            const heightPercent = (d.volume / maxVolume) * 100;
            return (
              <div key={i} className="flex flex-col items-center flex-1 space-y-2 group min-w-0">
                <span className="text-[8.5px] sm:text-[9px] font-mono text-emerald-700 font-black opacity-0 group-hover:opacity-100 transition-opacity truncate">
                  {d.volume}
                </span>

                <div className="w-5 sm:w-6 bg-slate-200 rounded-t-lg h-32 relative overflow-hidden flex items-end shrink-0">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-500 via-emerald-400 to-amber-400 rounded-t-lg transition-all duration-700 shadow-xs"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                <span className="text-[9.5px] sm:text-[10px] font-mono text-slate-600 font-bold truncate">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
