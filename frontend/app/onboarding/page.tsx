"use client";

import React, { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useGamificationStore } from "@/store/useGamificationStore";
import { MascotVector } from "@/components/atomic/MascotVector";
import { Button3D } from "@/components/atomic/Button3D";
import { PillBadge } from "@/components/atomic/PillBadge";
import { soundscape } from "@/lib/soundscapeEngine";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle2, ShieldAlert, Dumbbell } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, updateProfile, toggleInjury, toggleEquipment } = useUserStore();
  const { setCostume, addXP } = useGamificationStore();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const availableGoals = ["Build Muscle", "Burn Fat", "Build Habit", "Athletic Power"] as const;
  const availableLevels = ["Beginner", "Intermediate", "Advanced", "Athlete"] as const;
  const equipmentOptions = ["Barbell", "Dumbbells", "Cable Machine", "Pull-Up Bar"];
  const injuryOptions = ["Left Rotator Cuff", "Right Knee Patellar", "Lower Back Stiff"];

  const handleNext = () => {
    soundscape.playTapSound();
    if (step < 4) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    } else {
      soundscape.playVictoryFanfare();
      addXP(500);
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24 animate-smooth-reveal min-h-[80vh] justify-center">
      {/* Step Indicator */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Step {step} of 4
        </span>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                step >= i ? "w-6 bg-emerald-500" : "w-2 bg-slate-800"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Welcome Mascot Intro */}
      {step === 1 && (
        <div className="duo-card p-6 bg-slate-900 border border-slate-800 flex flex-col items-center text-center gap-4">
          <MascotVector mood="happy" size={130} />
          <PillBadge variant="green" icon={<Sparkles className="w-3.5 h-3.5" />}>
            Welcome to FitX AI
          </PillBadge>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Meet Flexy, Your AI Fitness Companion!
          </h1>
          <p className="text-xs font-semibold text-slate-300 leading-relaxed max-w-xs">
            I'm Flexy! I'll personalize your daily workouts, protect your joints with Form Guard, and calculate your HRV recovery in real-time.
          </p>
        </div>
      )}

      {/* Step 2: Fitness Level & Goal Selector */}
      {step === 2 && (
        <div className="duo-card p-6 bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-lg font-black text-white">Select Your Primary Goal & Level</h2>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Primary Goal</span>
            <div className="grid grid-cols-2 gap-2">
              {availableGoals.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    soundscape.playTapSound();
                    updateProfile({ primaryGoal: g });
                  }}
                  className={`p-3 rounded-2xl border text-xs font-extrabold transition-all ${
                    profile.primaryGoal === g
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md"
                      : "bg-slate-950/60 border-slate-800 text-slate-400"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Fitness Level</span>
            <div className="grid grid-cols-2 gap-2">
              {availableLevels.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    soundscape.playTapSound();
                    updateProfile({ fitnessLevel: lvl });
                  }}
                  className={`p-3 rounded-2xl border text-xs font-extrabold transition-all ${
                    profile.fitnessLevel === lvl
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-md"
                      : "bg-slate-950/60 border-slate-800 text-slate-400"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Injury & Equipment Checklist */}
      {step === 3 && (
        <div className="duo-card p-6 bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-lg font-black text-white">Equipment & Injury Protection</h2>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-emerald-400" /> Equipment You Own
            </span>
            <div className="flex flex-wrap gap-1.5">
              {equipmentOptions.map((eq) => {
                const active = profile.equipment.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => {
                      soundscape.playTapSound();
                      toggleEquipment(eq);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      active
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-slate-950/60 border-slate-800 text-slate-400"
                    }`}
                  >
                    {active ? "✓ " : "+ "}{eq}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Joint Protection
            </span>
            <div className="flex flex-wrap gap-1.5">
              {injuryOptions.map((inj) => {
                const active = profile.injuries.includes(inj);
                return (
                  <button
                    key={inj}
                    type="button"
                    onClick={() => {
                      soundscape.playTapSound();
                      toggleInjury(inj);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      active
                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-slate-950/60 border-slate-800 text-slate-400"
                    }`}
                  >
                    {active ? "🛡️ " : "+ "}{inj}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Starter Perk Claim & Mascot Customization */}
      {step === 4 && (
        <div className="duo-card p-6 bg-slate-900 border border-slate-800 flex flex-col items-center text-center gap-4">
          <MascotVector mood="celebratory" size={120} />
          <PillBadge variant="gold">Starter Perk Claimed!</PillBadge>

          <h2 className="text-xl font-black text-white">Claim Starter Red Sweatband</h2>
          <p className="text-xs font-semibold text-slate-300">
            You unlocked +500 Starter XP and Flexy's Red Sweatband costume item!
          </p>

          <Button3D
            variant="gold"
            onClick={() => {
              soundscape.playTapSound();
              setCostume("sweatband");
            }}
            className="text-xs py-2 px-4"
          >
            Equip Red Sweatband
          </Button3D>
        </div>
      )}

      <Button3D variant="green" fullWidth onClick={handleNext} className="py-4">
        {step === 4 ? "Enter FitX Hub" : "Continue"} <ArrowRight className="w-5 h-5 ml-auto" />
      </Button3D>
    </div>
  );
}
