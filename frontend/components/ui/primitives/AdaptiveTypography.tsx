"use client";

import React from "react";

export interface AdaptiveHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  weight?: "normal" | "bold" | "black";
  className?: string;
  as?: React.ElementType;
}

export const AdaptiveHeading: React.FC<AdaptiveHeadingProps> = ({
  level = 2,
  children,
  weight = "black",
  className = "",
  as,
  ...props
}) => {
  const Tag = as || (`h${level}` as React.ElementType);

  const levelStyles = {
    1: "text-2xl sm:text-3xl md:text-4xl leading-tight tracking-tight",
    2: "text-lg sm:text-xl md:text-2xl leading-snug tracking-tight",
    3: "text-base sm:text-lg md:text-xl leading-snug",
    4: "text-sm sm:text-base leading-normal",
  };

  const weightStyles = {
    normal: "font-medium",
    bold: "font-bold",
    black: "font-black",
  };

  return (
    <Tag
      className={`
        text-slate-900 min-w-0 max-w-full break-words
        ${levelStyles[level]}
        ${weightStyles[weight]}
        ${className}
      `.replace(/\s+/g, " ").trim()}
      {...props}
    >
      {children}
    </Tag>
  );
};

export interface AdaptiveTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "xs" | "sm" | "base" | "lg";
  variant?: "primary" | "secondary" | "muted" | "accent" | "white";
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const AdaptiveText: React.FC<AdaptiveTextProps> = ({
  size = "sm",
  variant = "secondary",
  children,
  className = "",
  as: Component = "p",
  ...props
}) => {
  const sizeStyles = {
    xs: "text-[11px] sm:text-xs leading-normal",
    sm: "text-xs sm:text-sm leading-relaxed",
    base: "text-sm sm:text-base leading-relaxed",
    lg: "text-base sm:text-lg leading-relaxed",
  };

  const variantStyles = {
    primary: "text-slate-900 font-semibold",
    secondary: "text-slate-600 font-medium",
    muted: "text-slate-400 font-normal",
    accent: "text-emerald-700 font-bold",
    white: "text-white font-medium",
  };

  return (
    <Component
      className={`
        min-w-0 max-w-full break-words
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `.replace(/\s+/g, " ").trim()}
      {...props}
    >
      {children}
    </Component>
  );
};

export interface AdaptiveNumberProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number | string;
  unit?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "default" | "emerald" | "blue" | "purple" | "amber" | "rose" | "cyan" | "white";
  className?: string;
}

export const AdaptiveNumber: React.FC<AdaptiveNumberProps> = ({
  value,
  unit,
  size = "md",
  color = "default",
  className = "",
  ...props
}) => {
  const strVal = String(value);

  // Dynamic scaling based on string character length
  let fontClass = "text-xl sm:text-2xl";
  if (size === "sm") {
    fontClass = strVal.length > 6 ? "text-xs sm:text-sm" : "text-sm sm:text-base";
  } else if (size === "md") {
    fontClass = strVal.length > 7 ? "text-sm sm:text-lg" : strVal.length > 4 ? "text-lg sm:text-xl" : "text-xl sm:text-2xl";
  } else if (size === "lg") {
    fontClass = strVal.length > 7 ? "text-lg sm:text-xl" : strVal.length > 4 ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl";
  } else if (size === "xl") {
    fontClass = strVal.length > 7 ? "text-xl sm:text-2xl" : strVal.length > 4 ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl";
  }

  const colorStyles = {
    default: "text-slate-900",
    emerald: "text-emerald-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
    cyan: "text-cyan-600",
    white: "text-white",
  };

  return (
    <span
      className={`
        inline-flex items-baseline space-x-0.5
        font-mono font-black tracking-tight min-w-0 max-w-full break-all
        ${colorStyles[color]}
        ${className}
      `.replace(/\s+/g, " ").trim()}
      {...props}
    >
      <span className={`${fontClass} leading-none`}>{value}</span>
      {unit && <span className="text-xs font-sans font-bold text-slate-400 shrink-0 ml-0.5">{unit}</span>}
    </span>
  );
};
