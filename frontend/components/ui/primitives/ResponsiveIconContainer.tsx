"use client";

import React from "react";

export interface ResponsiveIconContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "rounded-xl" | "rounded-2xl" | "rounded-full" | "rounded-lg";
  variant?: "emerald" | "amber" | "blue" | "purple" | "rose" | "cyan" | "slate" | "dark" | "transparent";
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveIconContainer: React.FC<ResponsiveIconContainerProps> = ({
  size = "md",
  shape = "rounded-2xl",
  variant = "emerald",
  children,
  className = "",
  ...props
}) => {
  const sizeStyles = {
    xs: "w-6 h-6 text-xs p-1",
    sm: "w-8 h-8 text-sm p-1.5",
    md: "w-10 h-10 text-base p-2",
    lg: "w-12 h-12 text-lg p-2.5",
    xl: "w-14 h-14 text-xl p-3",
  };

  const variantStyles = {
    emerald: "bg-emerald-100/90 text-emerald-700 border border-emerald-300/70",
    amber: "bg-amber-100/90 text-amber-800 border border-amber-300/70",
    blue: "bg-blue-100/90 text-blue-700 border border-blue-300/70",
    purple: "bg-purple-100/90 text-purple-700 border border-purple-300/70",
    rose: "bg-rose-100/90 text-rose-700 border border-rose-300/70",
    cyan: "bg-cyan-100/90 text-cyan-800 border border-cyan-300/70",
    slate: "bg-slate-100 text-slate-700 border border-slate-200",
    dark: "bg-slate-900 text-white border border-slate-800",
    transparent: "bg-transparent text-slate-700 border-0",
  };

  return (
    <div
      className={`
        shrink-0 aspect-square
        inline-flex items-center justify-center
        box-border align-middle
        ${sizeStyles[size]}
        ${shape}
        ${variantStyles[variant]}
        ${className}
      `.replace(/\s+/g, " ").trim()}
      {...props}
    >
      {children}
    </div>
  );
};
