"use client";

import React from "react";
import { soundscape } from "@/lib/soundscapeEngine";
import { Minus, Plus } from "lucide-react";

interface NumberStepperProps {
  value?: number;
  onChange: (newValue: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  label?: string;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  value = 0,
  onChange,
  step = 2.5,
  min = 0,
  max = 500,
  unit = "kg",
  label,
}) => {
  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;

  const handleDecrement = () => {
    soundscape.playTapSound();
    const updated = Math.max(min, safeValue - step);
    onChange(Number(updated.toFixed(1)));
  };

  const handleIncrement = () => {
    soundscape.playTapSound();
    const updated = Math.min(max, safeValue + step);
    onChange(Number(updated.toFixed(1)));
  };

  return (
    <div className="flex flex-col items-center min-w-0 flex-1">
      {label && <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 mb-0.5 tracking-wider uppercase truncate max-w-full">{label}</span>}
      <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-100 border border-slate-300 rounded-xl p-0.5 shadow-inner min-w-0 w-full justify-between">
        <button
          type="button"
          onClick={handleDecrement}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-200 hover:bg-slate-300 active:scale-90 text-slate-800 flex items-center justify-center font-black transition-transform shrink-0"
        >
          <Minus className="w-3 h-3" />
        </button>

        <div className="min-w-[30px] sm:min-w-[38px] text-center px-0.5 truncate flex-1">
          <span className="text-xs font-black tracking-tight text-slate-900">{safeValue}</span>
          <span className="text-[8.5px] sm:text-[9px] font-bold text-slate-500 ml-0.5">{unit}</span>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-90 text-white flex items-center justify-center font-black transition-transform shadow-xs shrink-0"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

