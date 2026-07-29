"use client";

import React from "react";

export interface LayoutBoundaryProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "mobile";
  padding?: "none" | "compact" | "normal" | "spacious";
  safeArea?: boolean;
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const LayoutBoundary: React.FC<LayoutBoundaryProps> = ({
  maxWidth = "xl",
  padding = "normal",
  safeArea = true,
  children,
  className = "",
  as: Component = "div",
  ...props
}) => {
  const maxWidthMap = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    mobile: "max-w-[440px]",
    full: "max-w-full",
  };

  const paddingMap = {
    none: "p-0",
    compact: "px-2.5 py-3 sm:px-4 sm:py-4",
    normal: "px-3.5 py-4 sm:px-6 sm:py-6",
    spacious: "px-5 py-6 sm:px-8 sm:py-8",
  };

  return (
    <Component
      className={`
        w-full mx-auto min-w-0
        box-border relative
        ${maxWidthMap[maxWidth]}
        ${paddingMap[padding]}
        ${safeArea ? "pb-24 sm:pb-8" : ""}
        ${className}
      `.replace(/\s+/g, " ").trim()}
      {...props}
    >
      {children}
    </Component>
  );
};
