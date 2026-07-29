"use client";

import React, { useState } from "react";
import {
  Watch,
  Heart,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  X,
  Plus
} from "lucide-react";
import { PillBadge } from "@/components/atomic/PillBadge";
import { Button3D } from "@/components/atomic/Button3D";
import { soundscape } from "@/lib/soundscapeEngine";

export default function WearablesPage() {
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);
  const [vitalsData, setVitalsData] = useState({
    weight: 75.0,
    bodyFat: 17.5,
    bpSystolic: 118,
    bpDiastolic: 76,
    rhr: 62
  });

  const handleSync = (provider: string) => {
    soundscape.playTapSound();
    setSyncStatus(`Normalizing & syncing payload with ${provider}...`);
    setTimeout(() => {
      soundscape.playSetCompleteSound();
      setSyncStatus(`Successfully ingested ${provider} biometric payload! (HRV: +12ms)`);
    }, 1000);
  };

  const hrZones = [
    { zone: "Zone 1 (Recovery)", range: "< 120 bpm", duration: "8.5 mins", pct: 15, color: "bg-blue-500" },
    { zone: "Zone 2 (Aerobic Base)", range: "120 - 140 bpm", duration: "18.0 mins", pct: 38, color: "bg-emerald-500" },
    { zone: "Zone 3 (Tempo Effort)", range: "140 - 160 bpm", duration: "14.2 mins", pct: 30, color: "bg-amber-500" },
    { zone: "Zone 4 (Threshold)", range: "160 - 175 bpm", duration: "6.5 mins", pct: 12, color: "bg-orange-500" },
    { zone: "Zone 5 (Max Effort)", range: "> 175 bpm", duration: "2.0 mins", pct: 5, color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-4 pb-24 animate-smooth-reveal">
      {/* Vitals Ingestion Sheet Drawer */}
      {vitalsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-end justify-center">
          <div className="w-full max-w-md bg-white border-t-2 border-x-2 border-slate-300 rounded-t-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-black text-slate-900 flex items-center">
                <PlusCircle className="w-4 h-4 mr-1.5 text-emerald-600" /> Vitals & Telemetry Ingestion
              </h3>
              <button onClick={() => setVitalsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-600 font-bold block mb-1">Body Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitalsData.weight}
                    onChange={(e) => setVitalsData({ ...vitalsData, weight: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 font-bold block mb-1">Body Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitalsData.bodyFat}
                    onChange={(e) => setVitalsData({ ...vitalsData, bodyFat: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-600 font-bold block mb-1">Blood Pressure (mmHg)</label>
                  <div className="flex space-x-1">
                    <input
                      type="number"
                      value={vitalsData.bpSystolic}
                      onChange={(e) => setVitalsData({ ...vitalsData, bpSystolic: Number(e.target.value) })}
                      className="w-1/2 p-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900"
                    />
                    <span className="text-slate-500 flex items-center">/</span>
                    <input
                      type="number"
                      value={vitalsData.bpDiastolic}
                      onChange={(e) => setVitalsData({ ...vitalsData, bpDiastolic: Number(e.target.value) })}
                      className="w-1/2 p-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 font-bold block mb-1">Resting HR (BPM)</label>
                  <input
                    type="number"
                    value={vitalsData.rhr}
                    onChange={(e) => setVitalsData({ ...vitalsData, rhr: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <Button3D variant="green" fullWidth onClick={() => setVitalsModalOpen(false)}>
              Log Biometric Vitals
            </Button3D>
          </div>
        </div>
      )}

      {/* Connected Wearables Status Banner */}
      <div className="duo-card p-5 bg-white border border-slate-200 space-y-4 relative shadow-sm">
        <div className="flex items-center justify-between">
          <PillBadge variant="green" icon={<Watch className="w-3.5 h-3.5" />}>
            Health Ingestion Pipeline
          </PillBadge>
          <button
            onClick={() => {
              soundscape.playTapSound();
              setVitalsModalOpen(true);
            }}
            className="px-3 py-1 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-extrabold hover:bg-emerald-100 transition-all active:scale-95 flex items-center shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Log Vitals
          </button>
        </div>

        <div>
          <h2 className="text-xl font-black text-slate-900 mb-1">Wearables & Biometrics</h2>
          <p className="text-xs font-bold text-slate-600">
            Standardized payload normalizer for Apple Health, Google Fit, Garmin, and Fitbit.
          </p>
        </div>

        {syncStatus && (
          <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-black animate-pulse">
            {syncStatus}
          </div>
        )}

        {/* Wearable Providers Quick Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
          {["Apple Health", "Google Fit", "Garmin", "Fitbit"].map((provider) => (
            <button
              key={provider}
              onClick={() => handleSync(provider)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500 text-[10px] font-extrabold text-slate-800 flex flex-col items-center justify-center space-y-1 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate w-full text-center">{provider}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Acute-to-Chronic Workload Ratio (ACWR) Safety Gauge */}
      <div className="duo-card p-4 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" /> Acute-to-Chronic Workload (ACWR)
          </h3>
          <PillBadge variant="green">
            1.12 • Optimal Zone
          </PillBadge>
        </div>

        <div className="space-y-1.5 font-mono">
          <div className="flex justify-between text-[10px] text-slate-600 font-extrabold">
            <span>0.8 Under-training</span>
            <span className="text-emerald-700 font-black">1.12 Sweet Spot</span>
            <span className="text-rose-600 font-black">&gt;1.5 Over-training Risk</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200 relative">
            <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-amber-500 h-full rounded-full" style={{ width: "65%" }} />
          </div>
        </div>
      </div>

      {/* VO2 Max & Heart Rate Vitals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="duo-card p-4 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <span className="text-[10px] font-mono text-sky-700 font-extrabold uppercase block">Aerobic Capacity</span>
          <h3 className="text-xs font-black text-slate-900">Estimated VO2 Max</h3>
          <div className="flex items-baseline space-x-1.5 font-mono">
            <span className="text-2xl font-black text-emerald-600">48.5</span>
            <span className="text-[10px] text-slate-500 font-bold">ml/kg/min</span>
          </div>
          <p className="text-[10px] text-emerald-700 font-bold">Top 15% for age bracket</p>
        </div>

        <div className="duo-card p-4 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <span className="text-[10px] font-mono text-amber-700 font-extrabold uppercase block">Resting Heart Rate</span>
          <h3 className="text-xs font-black text-slate-900">Resting HR</h3>
          <div className="flex items-baseline space-x-1.5 font-mono">
            <span className="text-2xl font-black text-amber-600">{vitalsData.rhr}</span>
            <span className="text-[10px] text-slate-500 font-bold">BPM</span>
          </div>
          <p className="text-[10px] text-slate-600 font-bold">{vitalsData.bpSystolic} / {vitalsData.bpDiastolic} mmHg BP</p>
        </div>
      </div>

      {/* Heart Rate Zone Distribution */}
      <div className="duo-card p-4 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center">
            <Heart className="w-4 h-4 mr-1.5 text-rose-500" /> HR Zone Distribution
          </h3>
          <span className="text-[10px] text-emerald-700 font-mono font-black">Dominant: Zone 2</span>
        </div>

        <div className="space-y-2.5">
          {hrZones.map((z, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-900 font-black">{z.zone}</span>
                <span className="text-slate-500 font-bold">{z.duration}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div className={`${z.color} h-full rounded-full`} style={{ width: `${z.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Body Composition Trajectory Forecaster */}
      <div className="duo-card p-4 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center">
            <TrendingUp className="w-4 h-4 mr-1.5 text-emerald-600" /> 12-Week Body Fat Forecaster
          </h3>
          <PillBadge variant="green">Adherence: 95%</PillBadge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[9px] text-slate-500 font-bold block">Week 4</span>
            <span className="text-xs font-black text-slate-900">73.8 kg</span>
            <span className="text-[10px] text-sky-700 font-bold block">17.2% BF</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[9px] text-slate-500 font-bold block">Week 8</span>
            <span className="text-xs font-black text-slate-900">72.5 kg</span>
            <span className="text-[10px] text-sky-700 font-bold block">16.2% BF</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="text-[9px] text-emerald-800 font-black block">Week 12 Target</span>
            <span className="text-xs font-black text-slate-900">71.2 kg</span>
            <span className="text-[10px] text-emerald-700 font-black block">15.3% BF</span>
          </div>
        </div>
      </div>
    </div>
  );
}
