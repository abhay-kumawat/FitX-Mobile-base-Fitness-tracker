"use client";

import React from "react";

interface ProgressBarProps {
  progress: number; // 0 - 100
  height?: number;
  colorClass?: string;
  showText?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 12,
  colorClass = "bg-gradient-to-r from-emerald-500 to-lime-400",
  showText = false,
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full flex flex-col gap-1">
      <div
        className="w-full bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/50 shadow-inner"
        style={{ height: height + 4 }}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${colorClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showText && (
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 px-1">
          <span>Progress</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
    </div>
  );
};
