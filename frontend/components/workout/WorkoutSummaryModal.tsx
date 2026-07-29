"use client";

import React, { useState } from "react";
import { 
  Trophy, 
  Sparkles, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Share2, 
  RotateCcw, 
  Smile, 
  Meh, 
  Frown,
  HeartPulse,
  Download
} from "lucide-react";

interface WorkoutSummaryModalProps {
  routineTitle: string;
  totalVolumeKg: number;
  totalSetsCompleted: number;
  elapsedSeconds: number;
  onClose: () => void;
  onRestart: () => void;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  routineTitle,
  totalVolumeKg,
  totalSetsCompleted,
  elapsedSeconds,
  onClose,
  onRestart,
}) => {
  const [mood, setMood] = useState<"Great" | "Good" | "Tired">("Great");
  const [copiedShare, setCopiedShare] = useState(false);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s}s`;
  };

  const handleCopyShare = () => {
    const shareText = `🔥 Completed ${routineTitle} on FitX!\n💪 Total Volume: ${totalVolumeKg.toLocaleString()} kg\n⏱️ Active Duration: ${formatTime(elapsedSeconds)}\n✅ Sets Completed: ${totalSetsCompleted}\n#FitX #ZenWorkout`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-3 overflow-y-auto">
      <div className="glass-card p-4 sm:p-6 rounded-3xl max-w-[360px] sm:max-w-md w-full border-fitx-emerald/40 bg-[#0E131D] space-y-4 animate-scaleUp shadow-2xl my-auto">
        {/* Celebration Header & Fireworks Icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-fitx-emerald/20 border-2 border-fitx-emerald/40 flex items-center justify-center mx-auto text-fitx-emerald shadow-[0_0_30px_rgba(40,203,117,0.4)] animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-extrabold uppercase tracking-widest text-fitx-emerald bg-fitx-emerald/15 px-3 py-1 rounded-full border border-fitx-emerald/30 inline-flex items-center">
            <Sparkles className="w-3 h-3 mr-1 text-fitx-emerald" /> Workout Completed!
          </span>

          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {routineTitle}
          </h2>
          <p className="text-xs text-fitx-textSecondary">
            Amazing effort! Your session state is auto-saved to your personal log.
          </p>
        </div>

        {/* Workout Performance Metrics Matrix */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
          <div className="p-2 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Volume</span>
            <span className="text-sm font-extrabold font-mono text-fitx-cyan">{totalVolumeKg.toLocaleString()} kg</span>
          </div>
          <div className="p-2 space-y-0.5 border-x border-white/10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Time</span>
            <span className="text-sm font-extrabold font-mono text-fitx-solar">{formatTime(elapsedSeconds)}</span>
          </div>
          <div className="p-2 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sets Logged</span>
            <span className="text-sm font-extrabold font-mono text-fitx-emerald">{totalSetsCompleted} Sets</span>
          </div>
        </div>

        {/* Instant Muscle Recovery ETA Countdown */}
        <div className="p-3.5 rounded-2xl bg-fitx-cyan/10 border border-fitx-cyan/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-fitx-cyan flex items-center">
              <HeartPulse className="w-4 h-4 mr-1.5 text-fitx-cyan" /> Muscle Recovery ETA
            </span>
            <span className="font-mono text-[11px] text-slate-300 font-bold">48 Hours Estimated</span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-300">
              <span>Chest & Front Delts:</span>
              <strong className="text-fitx-cyan">Full Recovery in 48h</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Triceps Lateral Head:</span>
              <strong className="text-fitx-emerald">Full Recovery in 36h</strong>
            </div>
          </div>
        </div>

        {/* Effort & Feeling Summary Matrix Check-in */}
        <div className="space-y-2">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block text-center">
            How do your muscles feel right now?
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Great", icon: Smile, color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
              { label: "Good", icon: Meh, color: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
              { label: "Tired", icon: Frown, color: "text-rose-400 border-rose-500/40 bg-rose-500/10" }
            ].map((item) => {
              const Icon = item.icon;
              const isSel = mood === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => setMood(item.label as any)}
                  className={`p-2.5 rounded-2xl border text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all touch-target ${
                    isSel ? item.color + " shadow-md" : "bg-white/5 border-white/10 text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions: Social Export & Close */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <button
            onClick={handleCopyShare}
            className="w-full py-3 rounded-2xl bg-fitx-cyan text-[#07090F] font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-fitx-cyan/20 touch-target active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedShare ? "Summary Copied to Clipboard! ✨" : "One-Tap Social Card Export"}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-200 font-extrabold text-xs hover:text-white touch-target active:scale-95 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
