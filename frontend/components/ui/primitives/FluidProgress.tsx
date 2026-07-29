"use client";

import React from "react";

export interface FluidProgressProps {
  value: number; // 0 to 100
  height?: "xs" | "sm" | "md" | "lg";
  color?: "emerald" | "blue" | "purple" | "amber" | "rose" | "cyan" | "indigo" | "gradient";
  showLabel?: boolean;
  labelPosition?: "inline" | "top" | "bottom";
  subText?: string;
  className?: string;
}

export const FluidProgress: React.FC<FluidProgressProps> = ({
  value,
  height = "sm",
  color = "emerald",
  showLabel = false,
  labelPosition = "top",
  subText,
  className = "",
}) => {
  const clampedVal = Math.min(100, Math.max(0, Math.round(value)));

  const heightStyles = {
    xs: "h-1.5",
    sm: "h-2.5",
    md: "h-3.5",
    lg: "h-5",
  };

  const colorStyles = {
    emerald: "bg-emerald-600",
    blue: "bg-blue-600",
    purple: "bg-purple-600",
    amber: "bg-amber-500",
    rose: "bg-rose-600",
    cyan: "bg-cyan-500",
    indigo: "bg-indigo-600",
    gradient: "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500",
  };

  return (
    <div className={`w-full min-w-0 space-y-1 ${className}`}>
      {showLabel && labelPosition === "top" && (
        <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-600">
          <span>{subText || "Progress"}</span>
          <span className="text-emerald-700">{clampedVal}%</span>
        </div>
      )}

      <div className={`w-full bg-slate-200/80 rounded-full overflow-hidden ${heightStyles[height]}`}>
        <div
          className={`${colorStyles[color]} h-full transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${clampedVal}%` }}
          role="progressbar"
          aria-valuenow={clampedVal}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {showLabel && labelPosition === "bottom" && (
        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500">
          <span>{subText || ""}</span>
          <span>{clampedVal}%</span>
        </div>
      )}
    </div>
  );
};
