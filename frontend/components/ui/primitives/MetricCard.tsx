"use client";

import React from "react";

export interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  target?: number | string;
  progressPct?: number;
  subLabel?: string;
  accentColor?: "emerald" | "blue" | "purple" | "amber" | "rose" | "cyan" | "indigo" | "slate";
  icon?: React.ReactNode;
  ratioBadge?: string;
  className?: string;
  layout?: "vertical" | "horizontal" | "compact";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit = "g",
  target,
  progressPct,
  subLabel,
  accentColor = "emerald",
  icon,
  ratioBadge,
  className = "",
  layout = "vertical",
}) => {
  // Theme color styles
  const colorThemes = {
    emerald: {
      bg: "bg-emerald-50/70 border-emerald-200/80",
      text: "text-emerald-700",
      darkText: "text-emerald-950",
      bar: "bg-emerald-600",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
      subText: "text-emerald-700/80",
    },
    blue: {
      bg: "bg-blue-50/70 border-blue-200/80",
      text: "text-blue-700",
      darkText: "text-blue-950",
      bar: "bg-blue-600",
      badge: "bg-blue-100 text-blue-800 border-blue-300",
      subText: "text-blue-700/80",
    },
    purple: {
      bg: "bg-purple-50/70 border-purple-200/80",
      text: "text-purple-700",
      darkText: "text-purple-950",
      bar: "bg-purple-600",
      badge: "bg-purple-100 text-purple-800 border-purple-300",
      subText: "text-purple-700/80",
    },
    amber: {
      bg: "bg-amber-50/70 border-amber-200/80",
      text: "text-amber-700",
      darkText: "text-amber-950",
      bar: "bg-amber-500",
      badge: "bg-amber-100 text-amber-800 border-amber-300",
      subText: "text-amber-700/80",
    },
    rose: {
      bg: "bg-rose-50/70 border-rose-200/80",
      text: "text-rose-700",
      darkText: "text-rose-950",
      bar: "bg-rose-600",
      badge: "bg-rose-100 text-rose-800 border-rose-300",
      subText: "text-rose-700/80",
    },
    cyan: {
      bg: "bg-cyan-50/70 border-cyan-200/80",
      text: "text-cyan-700",
      darkText: "text-cyan-950",
      bar: "bg-cyan-600",
      badge: "bg-cyan-100 text-cyan-800 border-cyan-300",
      subText: "text-cyan-700/80",
    },
    indigo: {
      bg: "bg-indigo-50/70 border-indigo-200/80",
      text: "text-indigo-700",
      darkText: "text-indigo-950",
      bar: "bg-indigo-600",
      badge: "bg-indigo-100 text-indigo-800 border-indigo-300",
      subText: "text-indigo-700/80",
    },
    slate: {
      bg: "bg-slate-50 border-slate-200",
      text: "text-slate-700",
      darkText: "text-slate-900",
      bar: "bg-slate-700",
      badge: "bg-slate-100 text-slate-800 border-slate-300",
      subText: "text-slate-600",
    },
  };

  const theme = colorThemes[accentColor];

  // Auto calculate progress % if target exists and progressPct not provided
  let computedPct = progressPct;
  if (computedPct === undefined && typeof value === "number" && typeof target === "number" && target > 0) {
    computedPct = Math.min(100, Math.round((value / target) * 100));
  }

  // Adaptive font sizing depending on string length
  const valString = `${value}${unit}`;
  const fontScalingClass = valString.length > 8
    ? "text-lg sm:text-xl"
    : valString.length > 5
    ? "text-xl sm:text-2xl"
    : "text-2xl sm:text-3xl";

  return (
    <div
      className={`
        w-full min-w-0 max-w-full
        p-3 sm:p-4 rounded-2xl border-2
        flex flex-col justify-between space-y-2.5
        box-border transition-all duration-200 shadow-2xs hover:shadow-xs
        ${theme.bg}
        ${className}
      `.replace(/\s+/g, " ").trim()}
    >
      {/* Header: Label + Optional Badge / Icon */}
      <div className="flex items-center justify-between gap-2 min-w-0 w-full flex-wrap">
        <div className="flex items-center space-x-1.5 min-w-0 flex-1">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className={`text-[11px] sm:text-xs font-black uppercase tracking-wider ${theme.darkText} leading-snug break-words`}>
            {label}
          </span>
        </div>

        {ratioBadge && (
          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg border shrink-0 ${theme.badge}`}>
            {ratioBadge}
          </span>
        )}
      </div>

      {/* Main Metric Output */}
      <div className="flex items-baseline justify-between gap-2 flex-wrap min-w-0">
        <div className="flex items-baseline space-x-1 min-w-0 font-mono font-black">
          <span className={`${fontScalingClass} ${theme.text} leading-none tracking-tight break-all`}>
            {value}
          </span>
          {unit && (
            <span className="text-xs font-extrabold text-slate-500 font-sans">
              {unit}
            </span>
          )}
        </div>

        {target !== undefined && (
          <span className="text-[11px] font-mono font-bold text-slate-500 shrink-0">
            Goal: {target}{unit}
          </span>
        )}
      </div>

      {/* Optional Progress Bar & Percentage Footer */}
      {computedPct !== undefined && (
        <div className="space-y-1 w-full pt-0.5">
          <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
            <div
              className={`${theme.bar} h-full transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(100, Math.max(0, computedPct))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500">
            <span>{computedPct}% met</span>
            {subLabel && <span className={theme.subText}>{subLabel}</span>}
          </div>
        </div>
      )}
    </div>
  );
};
