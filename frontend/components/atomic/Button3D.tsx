"use client";

import React from "react";
import { soundscape } from "@/lib/soundscapeEngine";

interface Button3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "green" | "gold" | "blue" | "secondary";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button3D: React.FC<Button3DProps> = ({
  variant = "green",
  fullWidth = false,
  children,
  onClick,
  className = "",
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case "gold":
        return "duo-btn-gold";
      case "blue":
        return "duo-btn-blue";
      case "secondary":
        return "btn-secondary-glass";
      case "green":
      default:
        return "duo-btn-green";
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundscape.playTapSound();
    if (onClick) onClick(e);
  };

  return (
    <button
      onClick={handleClick}
      className={`touch-target px-6 py-3 font-extrabold flex items-center justify-center gap-2 text-center uppercase tracking-wide select-none active:scale-[0.98] transition-transform ${
        fullWidth ? "w-full" : ""
      } ${getVariantClass()} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
