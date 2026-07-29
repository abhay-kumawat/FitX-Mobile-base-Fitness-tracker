"use client";

import React from "react";

export interface SmartButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "emerald" | "amber" | "blue" | "purple" | "cyan" | "dark" | "subtle" | "danger" | "ghost" | "extruded";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  badge?: string | number;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const SmartButton: React.FC<SmartButtonProps> = ({
  variant = "emerald",
  size = "md",
  icon,
  iconPosition = "left",
  badge,
  isLoading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-xl min-h-[36px]",
    md: "px-4 py-2.5 text-xs sm:text-sm rounded-2xl min-h-[44px]",
    lg: "px-6 py-3.5 text-sm sm:text-base rounded-2xl min-h-[50px]",
  };

  const variantStyles = {
    emerald: "bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-sm active:scale-98",
    amber: "bg-amber-500 hover:bg-amber-600 text-amber-950 font-black shadow-sm active:scale-98",
    blue: "bg-blue-600 hover:bg-blue-700 text-white font-black shadow-sm active:scale-98",
    purple: "bg-purple-600 hover:bg-purple-700 text-white font-black shadow-sm active:scale-98",
    cyan: "bg-cyan-600 hover:bg-cyan-700 text-white font-black shadow-sm active:scale-98",
    dark: "bg-slate-900 hover:bg-slate-800 text-white font-black shadow-sm active:scale-98",
    subtle: "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold active:scale-98",
    danger: "bg-rose-600 hover:bg-rose-700 text-white font-black shadow-sm active:scale-98",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 font-bold active:scale-98",
    extruded: "bg-emerald-500 hover:bg-emerald-600 text-white font-black border-b-4 border-b-emerald-700 active:border-b-2 active:translate-y-0.5 shadow-sm",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center space-x-1.5
        box-border shrink-0 font-sans tracking-wide
        transition-all duration-150 ease-out select-none
        disabled:opacity-50 disabled:pointer-events-none
        ${fullWidth ? "w-full" : "w-auto"}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `.replace(/\s+/g, " ").trim()}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0 mr-1.5" />
      ) : icon && iconPosition === "left" ? (
        <span className="shrink-0">{icon}</span>
      ) : null}

      <span className="truncate max-w-full">{children}</span>

      {!isLoading && icon && iconPosition === "right" && (
        <span className="shrink-0">{icon}</span>
      )}

      {badge !== undefined && (
        <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-extrabold bg-black/20 text-white rounded-md shrink-0">
          {badge}
        </span>
      )}
    </button>
  );
};
