"use client";

import React, { useState } from "react";
import { Dumbbell, Target, ShieldCheck, ChevronRight, Check, Sparkles } from "lucide-react";
import { fitxAPI } from "@/lib/api";

interface FastTrackOnboardingProps {
  onComplete?: () => void;
}

export default function FastTrackOnboarding({ onComplete }: FastTrackOnboardingProps) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("build_muscle");
  const [experience, setExperience] = useState("intermediate");
  const [equipment, setEquipment] = useState("dumbbells");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fitxAPI.sendCoachChat("Initial onboarding completed", {
        primary_goal: goal,
        experience_level: experience,
        available_equipment: [equipment],
      });
      if (onComplete) {
        onComplete();
      }
    } catch (e) {
      console.warn("Onboarding API warning, proceeding with local state", e);
      if (onComplete) {
        onComplete();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 p-5 cartoon-card bg-gradient-to-br from-[#121824] via-[#0E1522] to-[#1C2538] border-2 border-fitx-cyan/40">
      {/* Progress Bar Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-fitx-cyan uppercase tracking-widest flex items-center">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-fitx-solar animate-cartoon-pop" /> Step {step} of 3
        </span>
        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-fitx-cyan to-fitx-solar transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Goal Selection */}
      {step === 1 && (
        <div className="space-y-4 animate-cartoon-pop">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center">
              <Target className="w-5 h-5 mr-2 text-fitx-cyan" /> What is your primary fitness goal?
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              FitX AI will personalize your workout volume and macro targets.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { id: "build_muscle", title: "Build Muscle & Strength", desc: "Hypertrophy focus with progressive overload" },
              { id: "fat_loss", title: "Fat Loss & Conditioning", desc: "Calorie deficit optimization with metabolic circuits" },
              { id: "athletic", title: "Athletic Mobility & Health", desc: "Joint safety, movement capacity & longevity" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setGoal(opt.id)}
                className={`w-full p-3.5 rounded-2xl text-left border-2 transition-all active:scale-95 touch-target flex items-center justify-between ${
                  goal === opt.id
                    ? "bg-fitx-cyan/15 border-fitx-cyan text-white shadow-lg"
                    : "bg-white/5 border-white/10 text-slate-300 hover:border-white/20"
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{opt.title}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{opt.desc}</div>
                </div>
                {goal === opt.id && <Check className="w-4 h-4 text-fitx-cyan" />}
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-3.5 cartoon-btn-cyan text-xs uppercase tracking-wider font-extrabold flex items-center justify-center touch-target"
          >
            Continue <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}

      {/* Step 2: Experience Level */}
      {step === 2 && (
        <div className="space-y-4 animate-cartoon-pop">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-fitx-sage" /> Training Experience
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Sets appropriate movement complexity and deload thresholds.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { id: "beginner", title: "Beginner (0 - 1 years)", desc: "Focus on form mastery & foundational motor patterns" },
              { id: "intermediate", title: "Intermediate (1 - 3 years)", desc: "Consistent lifter tracking 1RM & progressive overload" },
              { id: "advanced", title: "Advanced (3+ years)", desc: "High-volume splits & autoregulated intensity" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setExperience(opt.id)}
                className={`w-full p-3.5 rounded-2xl text-left border-2 transition-all active:scale-95 touch-target flex items-center justify-between ${
                  experience === opt.id
                    ? "bg-fitx-sage/15 border-fitx-sage text-white shadow-lg"
                    : "bg-white/5 border-white/10 text-slate-300 hover:border-white/20"
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{opt.title}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{opt.desc}</div>
                </div>
                {experience === opt.id && <Check className="w-4 h-4 text-fitx-sage" />}
              </button>
            ))}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-3.5 bg-white/10 text-xs font-bold text-slate-300 rounded-2xl touch-target"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3.5 cartoon-btn-sage text-xs uppercase tracking-wider font-extrabold flex items-center justify-center touch-target"
            >
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Equipment Access */}
      {step === 3 && (
        <div className="space-y-4 animate-cartoon-pop">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center">
              <Dumbbell className="w-5 h-5 mr-2 text-fitx-solar" /> Available Equipment
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Select your primary training setup for exercise substitutions.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { id: "full_gym", title: "Commercial Gym", desc: "Barbells, Dumbbells, Cable Machines & Power Racks" },
              { id: "dumbbells", title: "Dumbbells & Bench", desc: "Home gym setup with adjustable weights" },
              { id: "bodyweight", title: "Bodyweight Only", desc: "Calisthenics, pull-up bar & resistance bands" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setEquipment(opt.id)}
                className={`w-full p-3.5 rounded-2xl text-left border-2 transition-all active:scale-95 touch-target flex items-center justify-between ${
                  equipment === opt.id
                    ? "bg-fitx-solar/15 border-fitx-solar text-white shadow-lg"
                    : "bg-white/5 border-white/10 text-slate-300 hover:border-white/20"
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{opt.title}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{opt.desc}</div>
                </div>
                {equipment === opt.id && <Check className="w-4 h-4 text-fitx-solar" />}
              </button>
            ))}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-3.5 bg-white/10 text-xs font-bold text-slate-300 rounded-2xl touch-target"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3.5 cartoon-btn-cyan text-xs uppercase tracking-wider font-extrabold flex items-center justify-center touch-target"
            >
              {isSubmitting ? "Initialising AI OS..." : "Complete Setup ✨"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
