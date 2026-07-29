"use client";

import React from "react";

export interface AdaptiveBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "emerald" | "amber" | "blue" | "purple" | "rose" | "cyan" | "slate" | "gold" | "dark";
  size?: "xs" | "sm" | "md";
  icon?: React.ReactNode;
  children: React.ReactNode;
  allowWrap?: boolean;
  className?: string;
}

export const AdaptiveBadge: React.FC<AdaptiveBadgeProps> = ({
  variant = "emerald",
  size = "sm",
  icon,
  children,
  allowWrap = false,
  className = "",
  ...props
}) => {
  // Theme color maps
  const variantStyles = {
    emerald: "bg-emerald-100/90 text-emerald-800 border-emerald-300/80",
    amber: "bg-amber-100/90 text-amber-900 border-amber-300/80",
    blue: "bg-blue-100/90 text-blue-800 border-blue-300/80",
    purple: "bg-purple-100/90 text-purple-800 border-purple-300/80",
    rose: "bg-rose-100/90 text-rose-800 border-rose-300/80",
    cyan: "bg-cyan-100/90 text-cyan-900 border-cyan-300/80",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    gold: "bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 border-amber-400 font-extrabold shadow-2xs",
    dark: "bg-slate-900 text-white border-slate-800",
  };

  // Size padding & font maps
  const sizeStyles = {
    xs: "px-1.5 py-0.5 text-[9.5px]",
    sm: "px-2.5 py-1 text-[11px]",
    md: "px-3 py-1.5 text-xs",
  };

  return (
    <span
      className={`
        inline-flex items-center space-x-1.5
        font-extrabold border rounded-xl
        max-w-full min-w-0
        box-border align-middle
        leading-tight
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${allowWrap ? "flex-wrap break-words" : "whitespace-normal break-words"}
        ${className}
      `.replace(/\s+/g, " ").trim()}
      {...props}
    >
      {icon && <span className="shrink-0 text-current">{icon}</span>}
      <span className="min-w-0 flex-1 break-words">{children}</span>
    </span>
  );
};
