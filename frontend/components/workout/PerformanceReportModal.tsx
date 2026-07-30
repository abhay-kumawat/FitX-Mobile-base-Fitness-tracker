"use client";

import React, { useState } from "react";
import { X, Activity, Flame, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { Button3D } from "@/components/atomic/Button3D";
import { soundscape } from "@/lib/soundscapeEngine";

interface PerformanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (data: {
    pain_level: number;
    energy_level: number;
    form_confidence: number;
    difficulty_level: number;
    motivation_level: number;
    notes: string;
  }) => void;
}

export function PerformanceReportModal({ isOpen, onClose, onSubmitReport }: PerformanceReportModalProps) {
  const [painLevel, setPainLevel] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(4);
  const [formConfidence, setFormConfidence] = useState(5);
  const [difficultyLevel, setDifficultyLevel] = useState(4);
  const [motivationLevel, setMotivationLevel] = useState(4);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    soundscape.playSuccessSound();
    onSubmitReport({
      pain_level: painLevel,
      energy_level: energyLevel,
      form_confidence: formConfidence,
      difficulty_level: difficultyLevel,
      motivation_level: motivationLevel,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-smooth-reveal">
      <div className="bg-slate-900 border border-slate-700 p-5 rounded-3xl max-w-md w-full space-y-4 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black">Workout Performance Report</h3>
              <p className="text-[10px] text-slate-400 font-bold">Logged to Analytics & AI Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pain Rating (0 - 10) */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="flex items-center gap-1.5 text-rose-400">
              <ShieldAlert className="w-4 h-4" /> Joint Pain Level
            </span>
            <span className="font-mono text-emerald-400">{painLevel}/10 ({painLevel === 0 ? "No Pain" : painLevel <= 3 ? "Mild" : "Severe"})</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={painLevel}
            onChange={(e) => setPainLevel(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 accent-rose-500 rounded-lg cursor-pointer"
          />
        </div>

        {/* Energy & Fatigue (1 - 5) */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Flame className="w-4 h-4" /> Energy & Stamina
            </span>
            <span className="font-mono text-amber-400">{energyLevel}/5 Stars</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setEnergyLevel(lvl)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                  energyLevel === lvl ? "bg-amber-500 text-slate-950 font-black shadow-md" : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Form Confidence (1 - 5) */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Form Guard Confidence
            </span>
            <span className="font-mono text-emerald-400">{formConfidence}/5</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFormConfidence(lvl)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                  formConfidence === lvl ? "bg-emerald-500 text-slate-950 shadow-md" : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty (1 - 5) */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="flex items-center gap-1.5 text-sky-400">
              <Sparkles className="w-4 h-4" /> Workout Perceived Difficulty
            </span>
            <span className="font-mono text-sky-400">{difficultyLevel}/5</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDifficultyLevel(lvl)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                  difficultyLevel === lvl ? "bg-sky-500 text-slate-950 shadow-md" : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Notes */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300">Custom Workout Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record any shoulder discomfort, equipment constraints, or personal notes..."
            rows={2}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <Button3D variant="green" fullWidth onClick={handleSubmit} className="py-3">
          Submit Report & Complete Workout
        </Button3D>
      </div>
    </div>
  );
}
