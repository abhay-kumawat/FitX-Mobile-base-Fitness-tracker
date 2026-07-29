"use client";

import React from "react";
import { useGamificationStore } from "@/store/useGamificationStore";

interface MascotVectorProps {
  mood?: "happy" | "pumped" | "calm" | "celebratory";
  size?: number;
  className?: string;
  costumeOverride?: "none" | "sweatband" | "crown" | "cape";
}

export const MascotVector: React.FC<MascotVectorProps> = ({
  mood = "happy",
  size = 120,
  className = "",
  costumeOverride,
}) => {
  const storeCostume = useGamificationStore((state) => state.activeCostume);
  const activeCostume = costumeOverride ?? storeCostume;

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer Pulse Halo */}
      <div
        className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-mascot-halo"
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 animate-mascot-bounce drop-shadow-2xl"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#58CC02" />
            <stop offset="100%" stopColor="#3FA000" />
          </linearGradient>
          <linearGradient id="bellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#89E434" />
            <stop offset="100%" stopColor="#58CC02" />
          </linearGradient>
          <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
          <linearGradient id="capeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF4B4B" />
            <stop offset="100%" stopColor="#B30000" />
          </linearGradient>
        </defs>

        {/* Costume: Superhero Cape (Behind body) */}
        {activeCostume === "cape" && (
          <path
            d="M 50 80 Q 20 140 30 180 Q 100 190 170 180 Q 180 140 150 80 Z"
            fill="url(#capeGrad)"
            stroke="#800000"
            strokeWidth="4"
          />
        )}

        {/* Mascot Main Oval Body */}
        <ellipse cx="100" cy="110" rx="65" ry="60" fill="url(#bodyGrad)" stroke="#2E7500" strokeWidth="6" />
        <ellipse cx="100" cy="120" rx="45" ry="38" fill="url(#bellyGrad)" />

        {/* Mascot Eyes */}
        <circle cx="75" cy="95" r="14" fill="white" stroke="#2E7500" strokeWidth="3" />
        <circle cx="125" cy="95" r="14" fill="white" stroke="#2E7500" strokeWidth="3" />

        {/* Pupils & Eye Glint */}
        {mood === "pumped" ? (
          <>
            <path d="M 68 90 L 82 98 M 82 90 L 68 98" stroke="#111827" strokeWidth="4" strokeLinecap="round" />
            <path d="M 118 90 L 132 98 M 132 90 L 118 98" stroke="#111827" strokeWidth="4" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="77" cy="96" r="6" fill="#111827" />
            <circle cx="127" cy="96" r="6" fill="#111827" />
            <circle cx="79" cy="93" r="2.5" fill="white" />
            <circle cx="129" cy="93" r="2.5" fill="white" />
          </>
        )}

        {/* Mascot Mouth */}
        {mood === "celebratory" ? (
          <path d="M 75 125 Q 100 155 125 125 Z" fill="#FF4B4B" stroke="#2E7500" strokeWidth="3" />
        ) : mood === "pumped" ? (
          <path d="M 75 130 Q 100 115 125 130" stroke="#111827" strokeWidth="5" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M 78 126 Q 100 142 122 126" stroke="#111827" strokeWidth="5" strokeLinecap="round" fill="none" />
        )}

        {/* Rosy Cheeks */}
        <circle cx="60" cy="112" r="7" fill="#FF8888" opacity="0.6" />
        <circle cx="140" cy="112" r="7" fill="#FF8888" opacity="0.6" />

        {/* Headphones (Always Present Base Accent) */}
        <path d="M 40 100 C 40 40 160 40 160 100" stroke="#1CB0F6" strokeWidth="10" strokeLinecap="round" fill="none" />
        <rect x="30" y="85" width="16" height="30" rx="8" fill="#1899D6" stroke="#0F6690" strokeWidth="3" />
        <rect x="154" y="85" width="16" height="30" rx="8" fill="#1899D6" stroke="#0F6690" strokeWidth="3" />

        {/* Costume: Red Workout Sweatband */}
        {activeCostume === "sweatband" && (
          <g>
            <rect x="42" y="62" width="116" height="16" rx="8" fill="#FF4B4B" stroke="#B30000" strokeWidth="3" />
            <line x1="50" y1="70" x2="150" y2="70" stroke="white" strokeWidth="3" strokeDasharray="6 4" />
          </g>
        )}

        {/* Costume: Golden Crown */}
        {activeCostume === "crown" && (
          <g>
            <path
              d="M 65 65 L 75 35 L 90 55 L 100 25 L 110 55 L 125 35 L 135 65 Z"
              fill="url(#crownGrad)"
              stroke="#B38600"
              strokeWidth="4"
            />
            <circle cx="75" cy="35" r="4" fill="#FF4B4B" />
            <circle cx="100" cy="25" r="5" fill="#1CB0F6" />
            <circle cx="125" cy="35" r="4" fill="#FF4B4B" />
          </g>
        )}
      </svg>
    </div>
  );
};
