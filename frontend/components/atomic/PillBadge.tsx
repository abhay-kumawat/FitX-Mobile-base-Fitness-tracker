"use client";

import React from "react";

interface PillBadgeProps {
  children: React.ReactNode;
  variant?: "green" | "gold" | "blue" | "purple" | "red" | "dark";
  icon?: React.ReactNode;
  className?: string;
}

export const PillBadge: React.FC<PillBadgeProps> = ({
  children,
  variant = "green",
  icon,
  className = "",
}) => {
  const getColors = () => {
    switch (variant) {
      case "gold":
        return "bg-amber-50 text-amber-800 border-amber-300 shadow-xs";
      case "blue":
        return "bg-sky-50 text-sky-800 border-sky-300 shadow-xs";
      case "purple":
        return "bg-purple-50 text-purple-800 border-purple-300 shadow-xs";
      case "red":
        return "bg-red-50 text-red-800 border-red-300 shadow-xs";
      case "dark":
        return "bg-slate-800 text-slate-100 border-slate-700 shadow-xs";
      case "green":
      default:
        return "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${getColors()} ${className}`}
    >
      {icon && <span className="text-sm">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
