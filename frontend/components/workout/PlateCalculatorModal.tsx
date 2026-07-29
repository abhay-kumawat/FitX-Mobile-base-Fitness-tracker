"use client";

import React, { useState, useEffect } from "react";
import { Calculator, X, Dumbbell, Sparkles } from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

interface PlateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeightKg?: number;
}

export default function PlateCalculatorModal({
  isOpen,
  onClose,
  initialWeightKg = 100.0,
}: PlateCalculatorModalProps) {
  const [targetWeight, setTargetWeight] = useState<number>(initialWeightKg);
  const [barbellWeight, setBarbellWeight] = useState<number>(20.0);
  const [plateResult, setPlateResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      calculatePlates(targetWeight, barbellWeight);
    }
  }, [isOpen, targetWeight, barbellWeight]);

  const calculatePlates = async (weight: number, bar: number) => {
    try {
      const res = await fetchFromAPI(
        `/workout/plate-calculator?target_weight_kg=${weight}&barbell_weight_kg=${bar}`
      );
      if (res) {
        setPlateResult(res);
      }
    } catch (e) {
      console.warn("Plate calc fetch error", e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-cartoon-pop">
      <div className="w-full max-w-[350px] sm:max-w-sm cartoon-card p-4 sm:p-5 bg-gradient-to-br from-[#0B0F17] to-[#161F30] border-2 border-fitx-cyan/50 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-2xl bg-fitx-cyan/20 text-fitx-cyan">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-tight flex items-center">
                Plate Calculator <Sparkles className="w-3.5 h-3.5 ml-1 text-fitx-cyan" />
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">Per-Side Weight Math</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 touch-target"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Weight Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
            Target Barbell Load (KG)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="number"
              step="2.5"
              value={targetWeight}
              onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 rounded-2xl bg-black/40 border border-white/10 text-white font-mono text-base font-extrabold focus:border-fitx-cyan focus:outline-none"
            />
            <div className="flex space-x-1 justify-between">
              {[60, 100, 140].map((w) => (
                <button
                  key={w}
                  onClick={() => setTargetWeight(w)}
                  className={`flex-1 py-1 px-2 rounded-xl text-xs font-mono font-bold touch-target ${
                    targetWeight === w ? "bg-fitx-cyan text-black" : "bg-white/10 text-slate-300"
                  }`}
                >
                  {w}k
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Barbell Representation */}
        {plateResult && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="text-center font-mono">
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Weight Per Side</span>
              <span className="text-xl font-extrabold text-fitx-cyan">
                {plateResult.weight_per_side_kg} kg
              </span>
            </div>

            {/* Plates Grid Display */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {Object.keys(plateResult.plates_per_side || {}).length === 0 ? (
                <span className="text-xs text-slate-400 font-mono">Empty Olympic Barbell (20kg)</span>
              ) : (
                Object.entries(plateResult.plates_per_side).map(([plateStr, count]: [string, any]) => (
                  <div
                    key={plateStr}
                    className="p-2.5 rounded-2xl bg-gradient-to-r from-fitx-cyan/20 to-fitx-sage/20 border border-fitx-cyan/40 text-center space-y-0.5 min-w-[64px]"
                  >
                    <span className="text-xs font-mono font-black text-white block">{plateStr}</span>
                    <span className="text-[10px] text-fitx-cyan font-bold block font-mono">
                      x{count} / side
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
