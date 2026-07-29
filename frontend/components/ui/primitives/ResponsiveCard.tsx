"use client";

import React from "react";

export interface ResponsiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hero" | "subtle" | "outlined" | "gradient" | "glass";
  padding?: "none" | "compact" | "normal" | "spacious";
  radius?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  elevation?: "none" | "sm" | "md" | "lg" | "interactive";
  borderWidth?: "none" | "normal" | "thick" | "extruded";
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  variant = "default",
  padding = "normal",
  radius = "3xl",
  elevation = "sm",
  borderWidth = "normal",
  children,
  className = "",
  as: Component = "div",
  ...props
}) => {
  // Padding rhythm mappings (mobile -> desktop fluid scaling)
  const paddingClasses = {
    none: "p-0",
    compact: "p-2.5 sm:p-3.5",
    normal: "p-4 sm:p-5 md:p-6",
    spacious: "p-5 sm:p-7 md:p-8",
  };

  // Border radius mappings
  const radiusClasses = {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    xl: "rounded-3xl",
    "2xl": "rounded-[28px]",
    "3xl": "rounded-[32px]",
    full: "rounded-full",
  };

  // Border style & extrusion mappings
  const borderClasses = {
    none: "border-0",
    normal: "border-2 border-slate-200/90",
    thick: "border-3 border-slate-300",
    extruded: "border-2 border-slate-200 border-b-4 border-b-slate-300",
  };

  // Variant surface color & background mappings
  const variantClasses = {
    default: "bg-white text-slate-900",
    hero: "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800 border-b-slate-950",
    subtle: "bg-slate-50/90 text-slate-900 border-slate-200/80",
    outlined: "bg-transparent text-slate-900 border-slate-300",
    gradient: "bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 text-slate-900 border-emerald-200/60",
    glass: "bg-white/95 backdrop-blur-xl text-slate-900 border-slate-200/80 shadow-glass",
  };

  // Elevation shadow mappings
  const elevationClasses = {
    none: "shadow-none",
    sm: "shadow-xs hover:shadow-sm transition-shadow duration-200",
    md: "shadow-sm hover:shadow-md transition-shadow duration-200",
    lg: "shadow-md hover:shadow-lg transition-shadow duration-200",
    interactive: "shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 ease-out cursor-pointer",
  };

  return (
    <Component
      className={`
        relative w-full max-w-full min-w-0
        box-border flex flex-col justify-between
        overflow-hidden break-words
        ${paddingClasses[padding]}
        ${radiusClasses[radius]}
        ${borderClasses[borderWidth]}
        ${variantClasses[variant]}
        ${elevationClasses[elevation]}
        ${className}
      `.replace(/\s+/g, " ").trim()}
      {...props}
    >
      {children}
    </Component>
  );
};
