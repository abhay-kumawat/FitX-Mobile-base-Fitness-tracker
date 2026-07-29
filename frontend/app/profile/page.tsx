"use client";

import React, { useState, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { MascotVector } from "@/components/atomic/MascotVector";
import { PillBadge } from "@/components/atomic/PillBadge";
import { Button3D } from "@/components/atomic/Button3D";
import { soundscape } from "@/lib/soundscapeEngine";
import { Cpu, Sliders, Download, ShieldCheck, Dumbbell, Sparkles, X } from "lucide-react";

export default function ProfilePage() {
  const { profile, toggleInjury, toggleEquipment } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [simulatedSleep, setSimulatedSleep] = useState(8);
  const [simulatedVolume, setSimulatedVolume] = useState(100);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const availableEquipment = ["Barbell", "Dumbbells", "Cable Machine", "Pull-Up Bar", "Kettlebell", "Resistance Bands"];
  const availableInjuries = ["Left Rotator Cuff", "Right Knee Patellar", "Lower Back Stiff", "Tennis Elbow"];

  const userEquipment = profile?.equipment || ["Barbell", "Dumbbells", "Cable Machine", "Pull-Up Bar"];
  const userInjuries = profile?.injuries || ["Left Rotator Cuff"];

  const handleExportJSON = () => {
    soundscape.playTapSound();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile || {}, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "fitx_user_profile_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col gap-6 pb-28 animate-smooth-reveal">
      {/* Profile Header & Digital Twin Avatar */}
      <div className="duo-card p-6 bg-white border border-slate-200 flex flex-col items-center text-center gap-3 relative overflow-hidden shadow-xs">
        <MascotVector mood="happy" size={110} />

        <div>
          <h2 className="text-xl font-black text-slate-900">{profile?.name || "Alex"}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <PillBadge variant="green">{profile?.fitnessLevel || "Intermediate"}</PillBadge>
            <PillBadge variant="gold">{profile?.primaryGoal || "Build Muscle"}</PillBadge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full pt-2 border-t border-slate-200 text-center font-mono">
          <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 block uppercase truncate">Weight</span>
            <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">{profile?.weightKg || 76.5} kg</span>
          </div>
          <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 block uppercase truncate">Height</span>
            <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">{profile?.heightCm || 180} cm</span>
          </div>
          <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 block uppercase truncate">HRV Score</span>
            <span className="text-xs sm:text-sm font-black text-emerald-600 block truncate">{profile?.hrvScore || 92} ms</span>
          </div>
        </div>
      </div>

      {/* Digital Twin 13-Layer Computational Avatar Hub */}
      <div className="duo-card p-5 bg-white border border-slate-200 flex flex-col gap-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600" /> Digital Twin 13-Layer Engine
          </h3>
          <PillBadge variant="purple">Active Model</PillBadge>
        </div>

        <p className="text-xs font-bold text-slate-600 leading-relaxed">
          Simulates metabolic burn, CNS fatigue, and tissue hypertrophy across 13 physiological layers.
        </p>

        <Button3D
          variant="blue"
          onClick={() => {
            soundscape.playTapSound();
            setShowSimulatorModal(true);
          }}
          className="text-xs py-2.5"
        >
          <Sliders className="w-4 h-4" /> Open "What-If" Scenario Simulator
        </Button3D>
      </div>

      {/* Biometrics & Equipment Manager */}
      <div className="duo-card p-5 bg-white border border-slate-200 flex flex-col gap-4 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-amber-500" /> Equipment & Injury Checklist
        </h3>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase">Available Gym Equipment</span>
          <div className="flex flex-wrap gap-1.5">
            {availableEquipment.map((eq) => {
              const active = userEquipment.includes(eq);
              return (
                <button
                  key={eq}
                  type="button"
                  onClick={() => {
                    soundscape.playTapSound();
                    if (toggleEquipment) toggleEquipment(eq);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    active
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {active ? "✓ " : "+ "}{eq}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase">Active Injury Shields</span>
          <div className="flex flex-wrap gap-1.5">
            {availableInjuries.map((inj) => {
              const active = userInjuries.includes(inj);
              return (
                <button
                  key={inj}
                  type="button"
                  onClick={() => {
                    soundscape.playTapSound();
                    if (toggleInjury) toggleInjury(inj);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    active
                      ? "bg-amber-50 border-amber-300 text-amber-900"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {active ? "🛡️ " : "+ "}{inj}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* System Settings & Gemini AI Status */}
      <div className="duo-card p-5 bg-white border border-slate-200 flex flex-col gap-3 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-600" /> System Settings & Gemini AI Status
        </h3>

        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black text-slate-800">Gemini 3.6 Flash Engine</span>
          </div>
          <PillBadge variant="green">Online & Operational</PillBadge>
        </div>

        <Button3D variant="secondary" onClick={handleExportJSON} className="text-xs py-2.5">
          <Download className="w-4 h-4" /> Backup Profile Data (JSON)
        </Button3D>
      </div>

      {/* What-If Scenario Simulator Modal */}
      {showSimulatorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 max-w-sm w-full flex flex-col gap-4 shadow-2xl relative animate-smooth-reveal">
            <button
              type="button"
              onClick={() => setShowSimulatorModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-sky-600" /> "What-If" Scenario Simulator
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Simulated Night Sleep:</span>
                  <span className="text-sky-600 font-black">{simulatedSleep} hrs</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="10"
                  value={simulatedSleep}
                  onChange={(e) => setSimulatedSleep(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Simulated Weekly Volume:</span>
                  <span className="text-emerald-600 font-black">{simulatedVolume}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={simulatedVolume}
                  onChange={(e) => setSimulatedVolume(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-extrabold text-slate-500 block uppercase">Projected Supercompensation</span>
              <span className="text-lg font-black text-emerald-600 mt-0.5 block">
                +{Math.round((simulatedSleep * simulatedVolume) / 10)}% Muscle Protein Synthesis
              </span>
            </div>

            <Button3D variant="blue" fullWidth onClick={() => setShowSimulatorModal(false)}>
              Apply Simulation Parameters
            </Button3D>
          </div>
        </div>
      )}
    </div>
  );
}
