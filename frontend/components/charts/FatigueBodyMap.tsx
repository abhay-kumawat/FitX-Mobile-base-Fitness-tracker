"use client";

import React, { useState } from "react";
import { Activity, ShieldCheck, Flame, Zap, RefreshCw } from "lucide-react";

interface FatigueBodyMapProps {
  fatigueData?: Record<string, number>;
}

export default function FatigueBodyMap({
  fatigueData = {
    shoulders: 20,
    chest: 35,
    back: 65,
    legs: 82,
    core: 15,
    arms: 30,
  },
}: FatigueBodyMapProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>("legs");
  const [viewAngle, setViewAngle] = useState<"front" | "back">("front");

  const getHeatDetails = (val: number) => {
    if (val >= 75) {
      return {
        label: "Severe Fatigue",
        color: "#EF4444",
        bgClass: "bg-fitx-alertRed/15 text-fitx-alertRed border-fitx-alertRed/40",
        advice: "High structural fatigue. Priority rest & light foam rolling required.",
      };
    }
    if (val >= 45) {
      return {
        label: "Moderate Strain",
        color: "#F59E0B",
        bgClass: "bg-fitx-warningAmber/15 text-fitx-warningAmber border-fitx-warningAmber/40",
        advice: "Sub-maximal load recommended. Avoid 1RM attempts today.",
      };
    }
    return {
      label: "Rested & Primed",
      color: "#A3E635",
      bgClass: "bg-fitx-neonGreen/15 text-fitx-neonGreen border-fitx-neonGreen/40",
      advice: "Full CNS & muscle recovery. Cleared for progressive overload stimulus.",
    };
  };

  const muscleNodes = [
    { key: "shoulders", label: "Deltoids / Shoulders", frontPos: { cx: 50, cy: 32, r: 8 }, backPos: { cx: 50, cy: 32, r: 8 } },
    { key: "chest", label: "Pectorals / Chest", frontPos: { cx: 50, cy: 44, r: 10 }, backPos: { cx: 50, cy: 44, r: 0 } },
    { key: "back", label: "Latissimus & Upper Back", frontPos: { cx: 50, cy: 48, r: 0 }, backPos: { cx: 50, cy: 46, r: 12 } },
    { key: "core", label: "Abdominals & Core", frontPos: { cx: 50, cy: 60, r: 9 }, backPos: { cx: 50, cy: 60, r: 7 } },
    { key: "arms", label: "Biceps & Triceps", frontPos: { cx: 28, cy: 48, r: 7 }, backPos: { cx: 72, cy: 48, r: 7 } },
    { key: "legs", label: "Quadriceps & Calves", frontPos: { cx: 50, cy: 82, r: 13 }, backPos: { cx: 50, cy: 82, r: 13 } },
  ];

  const currentGroupData = fatigueData[selectedGroup] || 20;
  const currentDetails = getHeatDetails(currentGroupData);

  return (
    <div className="glass-card rounded-[24px] p-5 space-y-4 border-fitx-borderSubtle">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-fitx-gold">Telemetry Analytics</span>
          <h3 className="text-sm font-extrabold text-white flex items-center">
            <Activity className="w-4 h-4 mr-1.5 text-fitx-gold" /> Muscle Fatigue Silhouette Heatmap
          </h3>
        </div>

        {/* Front / Back View Toggle */}
        <button
          onClick={() => setViewAngle(viewAngle === "front" ? "back" : "front")}
          className="px-2.5 py-1 rounded-xl bg-fitx-cardAlt border border-fitx-borderSubtle text-[11px] font-bold text-fitx-gold flex items-center touch-target hover:border-fitx-gold"
        >
          <RefreshCw className="w-3 h-3 mr-1" /> {viewAngle.toUpperCase()} VIEW
        </button>
      </div>

      {/* SVG Human Body Silhouette Map */}
      <div className="relative w-full h-64 bg-gradient-to-b from-[#101010] to-[#161616] rounded-2xl border border-fitx-borderSubtle flex items-center justify-center p-2 overflow-hidden">
        <svg viewBox="0 0 100 110" className="h-full max-w-full drop-shadow-md">
          {/* Human Silhouette Outline */}
          {/* Head */}
          <circle cx="50" cy="14" r="7" fill="#222222" stroke="#333333" strokeWidth="1.5" />
          {/* Neck */}
          <rect x="47" y="21" width="6" height="5" rx="1" fill="#222222" />
          {/* Torso */}
          <path
            d="M32 26 L68 26 L64 68 L36 68 Z"
            fill="#1A1A1A"
            stroke="#333333"
            strokeWidth="1.5"
          />
          {/* Arms Left & Right */}
          <path d="M30 26 L20 52 L26 54 L34 32 Z" fill="#1E1E1E" stroke="#333333" strokeWidth="1" />
          <path d="M70 26 L80 52 L74 54 L66 32 Z" fill="#1E1E1E" stroke="#333333" strokeWidth="1" />
          {/* Legs Left & Right */}
          <path d="M36 68 L34 104 L44 104 L48 68 Z" fill="#1E1E1E" stroke="#333333" strokeWidth="1" />
          <path d="M64 68 L66 104 L56 104 L52 68 Z" fill="#1E1E1E" stroke="#333333" strokeWidth="1" />

          {/* Interactive Heatmap Muscle Overlay Nodes */}
          {muscleNodes.map((node) => {
            const pos = viewAngle === "front" ? node.frontPos : node.backPos;
            if (pos.r === 0) return null; // Not visible in this angle
            const score = fatigueData[node.key] || 0;
            const details = getHeatDetails(score);
            const isSelected = selectedGroup === node.key;

            return (
              <g
                key={node.key}
                onClick={() => setSelectedGroup(node.key)}
                className="cursor-pointer transition-all hover:scale-110"
              >
                <circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r={pos.r + (isSelected ? 3 : 0)}
                  fill={details.color}
                  opacity={isSelected ? "0.85" : "0.55"}
                  stroke={isSelected ? "#FFFFFF" : details.color}
                  strokeWidth={isSelected ? "2.5" : "1"}
                  className={isSelected ? "animate-pulse" : ""}
                />
                <text
                  x={pos.cx}
                  y={pos.cy + 1.5}
                  fontSize="4"
                  fontWeight="bold"
                  fill="#000000"
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  {score}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Heat Legend Overlay */}
        <div className="absolute bottom-2 right-2 glass-card p-2 rounded-xl border-fitx-borderSubtle text-[9px] font-mono space-y-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-fitx-neonGreen" />
            <span>&lt;45% Rested</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-fitx-warningAmber" />
            <span>45-74% Moderate</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-fitx-alertRed" />
            <span>&gt;75% Fatigue</span>
          </div>
        </div>
      </div>

      {/* Muscle Group Detail Card */}
      <div className="glass-card p-4 rounded-2xl border-fitx-gold/30 bg-fitx-cardAlt space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold text-white capitalize">
              {selectedGroup} Group
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${currentDetails.bgClass}`}>
              {currentDetails.label} ({currentGroupData}%)
            </span>
          </div>
        </div>

        <p className="text-xs text-fitx-textSecondary leading-relaxed">
          {currentDetails.advice}
        </p>

        <div className="pt-2 border-t border-fitx-borderSubtle/60 flex items-center justify-between text-[11px]">
          <span className="text-fitx-gold font-bold">Recommended Joint Safety Action:</span>
          <span className="text-white font-mono font-bold">
            {currentGroupData > 70 ? "Active Foam Roll & 48h Rest" : "Normal Hypertrophy Load"}
          </span>
        </div>
      </div>
    </div>
  );
}
