"use client";

import React, { useState, useEffect } from "react";
import { Activity, RefreshCw, Layers } from "lucide-react";
import { soundscape } from "@/lib/soundscapeEngine";

interface GrowthBodyMapProps {
  metrics: Record<string, any>;
  onSelectMuscle: (muscle: string) => void;
  selectedMuscle: string | null;
}

export const GrowthBodyMap: React.FC<GrowthBodyMapProps> = ({
  metrics,
  onSelectMuscle,
  selectedMuscle,
}) => {
  const [viewAngle, setViewAngle] = useState<"front" | "back">("front");

  const getHeatColor = (score: number) => {
    // Development score: 0-100
    if (score >= 85) return "#10B981"; // Emerald
    if (score >= 60) return "#3B82F6"; // Blue
    if (score >= 40) return "#F59E0B"; // Amber
    return "#EF4444"; // Red
  };

  const muscleNodes = [
    { key: "Shoulders", label: "Deltoids", frontPos: { cx: 50, cy: 32, r: 8 }, backPos: { cx: 50, cy: 32, r: 8 } },
    { key: "Chest", label: "Pectorals", frontPos: { cx: 50, cy: 44, r: 10 }, backPos: { cx: 50, cy: 44, r: 0 } },
    { key: "Lats", label: "Latissimus Dorsi", frontPos: { cx: 50, cy: 48, r: 0 }, backPos: { cx: 50, cy: 46, r: 12 } },
    { key: "Abs", label: "Core", frontPos: { cx: 50, cy: 60, r: 9 }, backPos: { cx: 50, cy: 60, r: 0 } },
    { key: "Lower Back", label: "Lower Back", frontPos: { cx: 50, cy: 60, r: 0 }, backPos: { cx: 50, cy: 62, r: 8 } },
    { key: "Biceps", label: "Biceps", frontPos: { cx: 28, cy: 48, r: 7 }, backPos: { cx: 72, cy: 48, r: 0 } },
    { key: "Triceps", label: "Triceps", frontPos: { cx: 28, cy: 48, r: 0 }, backPos: { cx: 72, cy: 48, r: 7 } },
    { key: "Quads", label: "Quadriceps", frontPos: { cx: 50, cy: 82, r: 13 }, backPos: { cx: 50, cy: 82, r: 0 } },
    { key: "Hamstrings", label: "Hamstrings", frontPos: { cx: 50, cy: 82, r: 0 }, backPos: { cx: 50, cy: 82, r: 11 } },
    { key: "Glutes", label: "Glutes", frontPos: { cx: 50, cy: 70, r: 0 }, backPos: { cx: 50, cy: 70, r: 10 } },
    { key: "Calves", label: "Calves", frontPos: { cx: 50, cy: 95, r: 0 }, backPos: { cx: 50, cy: 95, r: 7 } },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-slate-900">
            Interactive Body Map
          </h3>
        </div>

        <button
          onClick={() => {
            soundscape.playTapSound();
            setViewAngle(viewAngle === "front" ? "back" : "front");
          }}
          className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-600 flex items-center hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> {viewAngle.toUpperCase()}
        </button>
      </div>

      <div className="relative w-full h-72 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-2 overflow-hidden shadow-inner">
        <svg viewBox="0 0 100 110" className="h-full max-w-full drop-shadow-sm">
          {/* Base Silhouette */}
          <circle cx="50" cy="14" r="7" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
          <rect x="47" y="21" width="6" height="5" rx="1" fill="#E2E8F0" />
          <path d="M32 26 L68 26 L64 68 L36 68 Z" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M30 26 L20 52 L26 54 L34 32 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
          <path d="M70 26 L80 52 L74 54 L66 32 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
          <path d="M36 68 L34 104 L44 104 L48 68 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
          <path d="M64 68 L66 104 L56 104 L52 68 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />

          {/* Muscle Nodes */}
          {muscleNodes.map((node) => {
            const pos = viewAngle === "front" ? node.frontPos : node.backPos;
            if (pos.r === 0) return null;
            
            const muscleData = metrics[node.key] || { development_score: 0 };
            const score = muscleData.development_score;
            const color = getHeatColor(score);
            const isSelected = selectedMuscle === node.key;

            return (
              <g
                key={node.key}
                onClick={() => {
                  soundscape.playTapSound();
                  onSelectMuscle(node.key);
                }}
                className="cursor-pointer transition-all hover:scale-105 origin-center"
                style={{ transformOrigin: `${pos.cx}px ${pos.cy}px` }}
              >
                <circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r={pos.r + (isSelected ? 2 : 0)}
                  fill={color}
                  opacity={isSelected ? "0.9" : "0.65"}
                  stroke={isSelected ? "#1E293B" : color}
                  strokeWidth={isSelected ? "1.5" : "0.5"}
                  className={isSelected ? "animate-pulse" : ""}
                />
                <text
                  x={pos.cx}
                  y={pos.cy + 1.5}
                  fontSize="3.5"
                  fontWeight="bold"
                  fill="#ffffff"
                  textAnchor="middle"
                  pointerEvents="none"
                  style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.5)" }}
                >
                  {Math.round(score)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md p-2 rounded-xl border border-slate-200 text-[9px] font-bold text-slate-600 space-y-1.5 shadow-sm">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Optimal</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Good</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Needs Work</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Neglected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
