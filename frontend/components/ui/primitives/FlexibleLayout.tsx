"use client";

import React from "react";

export interface FlexibleStackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  children: React.ReactNode;
  className?: string;
}

export const FlexibleStack: React.FC<FlexibleStackProps> = ({
  gap = "md",
  align = "stretch",
  justify = "start",
  children,
  className = "",
  ...props
}) => {
  const gapMap = {
    xs: "gap-1.5",
    sm: "gap-2.5",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  };

  const alignMap = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const justifyMap = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  };

  return (
    <div
      className={`
        flex flex-col w-full max-w-full min-w-0
        ${gapMap[gap]} ${alignMap[align]} ${justifyMap[justify]}
        ${className}
      `.replace(/\s+/g, " ").trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export interface FlexibleRowProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "baseline" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  wrap?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FlexibleRow: React.FC<FlexibleRowProps> = ({
  gap = "sm",
  align = "center",
  justify = "between",
  wrap = true,
  children,
  className = "",
  ...props
}) => {
  const gapMap = {
    xs: "gap-1.5",
    sm: "gap-2.5",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  };

  const alignMap = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    baseline: "items-baseline",
    stretch: "items-stretch",
  };

  const justifyMap = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  };

  return (
    <div
      className={`
        flex w-full max-w-full min-w-0
        ${wrap ? "flex-wrap" : "flex-nowrap"}
        ${gapMap[gap]} ${alignMap[align]} ${justifyMap[justify]}
        ${className}
      `.replace(/\s+/g, " ").trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export interface FlexibleGridProps extends React.HTMLAttributes<HTMLDivElement> {
  minItemWidth?: number; // e.g. 140 for 140px min columns
  gap?: "xs" | "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

export const FlexibleGrid: React.FC<FlexibleGridProps> = ({
  minItemWidth = 140,
  gap = "sm",
  children,
  className = "",
  ...props
}) => {
  const gapMap = {
    xs: "gap-1.5",
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(min(${minItemWidth}px, 100%), 1fr))`,
      }}
      className={`
        w-full max-w-full min-w-0
        ${gapMap[gap]}
        ${className}
      `.replace(/\s+/g, " ").trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export interface AutoWrapProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: "xs" | "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

export const AutoWrap: React.FC<AutoWrapProps> = ({
  gap = "xs",
  children,
  className = "",
  ...props
}) => {
  const gapMap = {
    xs: "gap-1.5",
    sm: "gap-2.5",
    md: "gap-4",
  };

  return (
    <div
      className={`
        flex flex-wrap items-center min-w-0 max-w-full
        ${gapMap[gap]}
        ${className}
      `.replace(/\s+/g, " ").trim()}
      {...props}
    >
      {children}
    </div>
  );
};
