"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Moon, 
  Flame, 
  Clock, 
  Sliders,
  Radio,
  Zap
} from "lucide-react";
import { soundscapeEngine, SoundscapeType } from "@/lib/workout/soundscapeEngine";

interface ZenHeaderProps {
  isZenMode: boolean;
  onToggleZenMode: () => void;
  energyLevel: number; // 30, 70, 100
  onChangeEnergyLevel: (val: number) => void;
  isTimeCrunched: boolean;
  onToggleTimeCrunch: () => void;
  nightMode: boolean;
  onToggleNightMode: () => void;
  totalSets: number;
  completedSetsCount: number;
  routineTitle: string;
}

export const ZenHeader: React.FC<ZenHeaderProps> = ({
  isZenMode,
  onToggleZenMode,
  energyLevel,
  onChangeEnergyLevel,
  isTimeCrunched,
  onToggleTimeCrunch,
  nightMode,
  onToggleNightMode,
  totalSets,
  completedSetsCount,
  routineTitle,
}) => {
  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeType>("off");
  const [volume, setVolume] = useState(0.4);
  const [showTunerModal, setShowTunerModal] = useState(false);

  const handleSoundscapeChange = (type: SoundscapeType) => {
    setActiveSoundscape(type);
    soundscapeEngine.setSoundscape(type);
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    soundscapeEngine.setVolume(v);
  };

  const progressPercent = totalSets > 0 ? Math.min(100, Math.round((completedSetsCount / totalSets) * 100)) : 0;

  return (
    <div className="space-y-3">
      {/* Top Utility Ribbon */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          {/* Zen Mode Toggle */}
          <button
            onClick={onToggleZenMode}
            className={`px-3 py-1 rounded-2xl text-[11px] font-extrabold flex items-center space-x-1.5 transition-all touch-target border ${
              isZenMode
                ? "bg-fitx-cyan text-[#07090F] border-fitx-cyan shadow-md shadow-fitx-cyan/30"
                : "bg-white/5 border-white/10 text-fitx-cyan hover:border-fitx-cyan"
            }`}
          >
            {isZenMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isZenMode ? "Exit Zen Mode" : "Zen Mode HUD"}</span>
          </button>

          {/* Low Blue-Light Night Mode */}
          <button
            onClick={onToggleNightMode}
            className={`p-1.5 rounded-2xl border transition-all touch-target ${
              nightMode
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
            }`}
            title="Night Low-Blue Light Filter"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Energy Tuner Modal Trigger */}
        <button
          onClick={() => setShowTunerModal(true)}
          className="px-2.5 py-1 rounded-2xl bg-white/5 border border-white/10 text-[11px] font-extrabold text-fitx-solar flex items-center space-x-1 hover:border-fitx-solar transition-all touch-target"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Energy: {energyLevel}%</span>
        </button>
      </div>

      {/* Hero Ambient Header Box (Hidden in Zen Mode) */}
      {!isZenMode && (
        <div className="hero-container p-4 relative space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-fitx-cyan flex items-center bg-fitx-cyan/15 px-2.5 py-0.5 rounded-full border border-fitx-cyan/30">
              <Sparkles className="w-3 h-3 mr-1 text-fitx-cyan animate-pulse" /> Active Zen Flow Session
            </span>

            {/* Time Crunch Engine Button */}
            <button
              onClick={onToggleTimeCrunch}
              className={`px-2.5 py-1 rounded-2xl text-[10px] font-mono font-bold flex items-center space-x-1 transition-all touch-target border ${
                isTimeCrunched
                  ? "bg-fitx-solar text-[#07090F] border-fitx-solar shadow-md shadow-fitx-solar/30"
                  : "bg-white/5 border-white/10 text-slate-300 hover:border-fitx-solar"
              }`}
            >
              <Clock className="w-3 h-3 text-fitx-solar" />
              <span>{isTimeCrunched ? "15-Min Express" : "Compress to 15m"}</span>
            </button>
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">
              {routineTitle} {isTimeCrunched && "(Express Saver)"}
            </h2>
            <p className="text-xs text-fitx-textSecondary mt-0.5">
              Adaptation Mode: <span className="text-fitx-cyan font-semibold">Joint Safety & High Hypertrophy</span>
            </p>
          </div>

          {/* Soundscape Selector Ribbon */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[10px] font-bold text-slate-400 mr-1 shrink-0 flex items-center">
                <Radio className="w-3 h-3 mr-1 text-fitx-cyan" /> Audio:
              </span>
              {(["off", "binaural", "lofi", "rain", "synth"] as SoundscapeType[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleSoundscapeChange(st)}
                  className={`px-2 py-0.5 rounded-xl text-[10px] font-extrabold capitalize transition-all border ${
                    activeSoundscape === st
                      ? "bg-fitx-cyan text-[#07090F] border-fitx-cyan"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {st === "off" ? "Mute" : st}
                </button>
              ))}
            </div>

            {activeSoundscape !== "off" && (
              <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                <Volume2 className="w-3 h-3 text-fitx-cyan" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-12 h-1 accent-fitx-cyan bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Progress Bar & Set Summary */}
          <div className="flex items-center space-x-3 pt-1">
            <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-fitx-cyan via-fitx-emerald to-fitx-solar transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-extrabold text-fitx-emerald shrink-0">
              {completedSetsCount}/{totalSets} Sets ({progressPercent}%)
            </span>
          </div>
        </div>
      )}

      {/* Energy Level Workout Tuner Modal */}
      {showTunerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-5 rounded-3xl max-w-sm w-full border-fitx-cyan/30 space-y-4 bg-[#0E131D]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center">
                <Sliders className="w-4 h-4 mr-2 text-fitx-solar" /> Energy-Level Workout Tuner
              </h3>
              <button
                onClick={() => setShowTunerModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-fitx-textSecondary">
              Set your current energy level to dynamically adjust set volume, rest pacing, and movement difficulty:
            </p>

            <div className="space-y-2 pt-1">
              {[
                { val: 30, title: "Low Energy (30%)", desc: "Reduces 1 set per exercise & extends rest for easy recovery flow." },
                { val: 70, title: "Optimal Energy (70%)", desc: "Standard hypertrophy volume & balanced dynamic rest." },
                { val: 100, title: "Peak Energy (100%)", desc: "Maximum set volume + aggressive progressive overload." }
              ].map((opt) => (
                <div
                  key={opt.val}
                  onClick={() => {
                    onChangeEnergyLevel(opt.val);
                    setShowTunerModal(false);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    energyLevel === opt.val
                      ? "bg-fitx-solar/15 border-fitx-solar text-white font-bold"
                      : "bg-white/5 border-white/10 text-slate-300 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-extrabold text-fitx-solar">
                    <span>{opt.title}</span>
                    {energyLevel === opt.val && <Zap className="w-3.5 h-3.5 text-fitx-solar" />}
                  </div>
                  <p className="text-[11px] text-fitx-textSecondary mt-1 leading-snug">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
