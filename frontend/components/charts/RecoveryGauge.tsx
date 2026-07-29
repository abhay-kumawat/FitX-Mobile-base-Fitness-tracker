"use client";

import React from "react";
import { Activity } from "lucide-react";

interface RecoveryGaugeProps {
  score?: number;
  status?: string;
  recommendation?: string;
}

export default function RecoveryGauge({
  score = 88,
  status = "Optimal Readiness",
  recommendation = "Optimal CNS recovery. Primed for high-intensity hypertrophic stimulus today!"
}: RecoveryGaugeProps) {
  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "#10B981"; // Emerald
    if (s >= 60) return "#F59E0B"; // Amber
    if (s >= 40) return "#F97316"; // Orange
    return "#E11D48"; // Rose
  };

  const strokeColor = getColor(score);

  return (
    <div className="premium-card p-6 flex items-center space-x-6">
      {/* Soft Glow Ring Container */}
      <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
        {/* Ambient Underglow */}
        <div 
          className="absolute inset-0 blur-xl opacity-20 rounded-full" 
          style={{ backgroundColor: strokeColor }} 
        />
        
        <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke={strokeColor}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ 
              transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
              filter: `drop-shadow(0 0 8px ${strokeColor}40)`
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span className="text-3xl font-bold font-mono tracking-tight text-white">
            {score}
          </span>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center mb-1">
          <Activity className="w-4 h-4 mr-2" style={{ color: strokeColor }} />
          <h3 className="text-base font-bold text-white tracking-wide">
            {status}
          </h3>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed font-medium">
          {recommendation}
        </p>
      </div>
    </div>
  );
}

