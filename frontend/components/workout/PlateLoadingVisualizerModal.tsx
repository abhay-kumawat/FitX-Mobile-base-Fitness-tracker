"use client";

import React from "react";
import { useWorkoutStore } from "@/store/useWorkoutStore";
import { Button3D } from "@/components/atomic/Button3D";
import { X, Disc } from "lucide-react";

export const PlateLoadingVisualizerModal: React.FC = () => {
  const { showPlateModal, selectedWeightForPlate, closePlateModal } = useWorkoutStore();

  if (!showPlateModal) return null;

  const barWeight = 20; // Standard Olympic Barbell 20kg
  const targetPerSide = Math.max(0, (selectedWeightForPlate - barWeight) / 2);

  // Calculate plates
  const availablePlates = [20, 15, 10, 5, 2.5, 1.25];
  const loadedPlatesPerSide: number[] = [];
  let remaining = targetPerSide;

  for (const plate of availablePlates) {
    while (remaining >= plate) {
      loadedPlatesPerSide.push(plate);
      remaining = Number((remaining - plate).toFixed(2));
    }
  }

  const getPlateColor = (weight: number) => {
    switch (weight) {
      case 20: return "#3B82F6"; // Blue
      case 15: return "#EF4444"; // Red
      case 10: return "#10B981"; // Green
      case 5: return "#F59E0B";  // Yellow
      case 2.5: return "#8B5CF6"; // Purple
      default: return "#64748B"; // Gray
    }
  };

  const getPlateHeight = (weight: number) => {
    switch (weight) {
      case 20: return 90;
      case 15: return 80;
      case 10: return 70;
      case 5: return 60;
      case 2.5: return 50;
      default: return 40;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 max-w-sm w-full flex flex-col gap-4 shadow-2xl relative animate-smooth-reveal">
        <button
          type="button"
          onClick={closePlateModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Disc className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Barbell Plate Loader</h3>
            <p className="text-[11px] font-semibold text-slate-400">Target: {selectedWeightForPlate} kg (Bar 20kg)</p>
          </div>
        </div>

        {/* Barbell SVG Graphic */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[140px] relative overflow-x-auto">
          <svg width="280" height="120" viewBox="0 0 280 120" className="overflow-visible">
            {/* Bar Sleeve */}
            <rect x="20" y="55" width="240" height="10" fill="#94A3B8" rx="2" />
            {/* Collar Stoppers */}
            <rect x="70" y="45" width="10" height="30" fill="#64748B" rx="3" />
            <rect x="200" y="45" width="10" height="30" fill="#64748B" rx="3" />

            {/* Left Side Plates (Rendered inner to outer) */}
            {loadedPlatesPerSide.map((plateWeight, idx) => {
              const height = getPlateHeight(plateWeight);
              const color = getPlateColor(plateWeight);
              const xPos = 62 - idx * 10;
              return (
                <g key={`left-${idx}`}>
                  <rect
                    x={xPos}
                    y={60 - height / 2}
                    width="8"
                    height={height}
                    fill={color}
                    rx="2"
                    stroke="#0F172A"
                    strokeWidth="1"
                  />
                </g>
              );
            })}

            {/* Right Side Plates */}
            {loadedPlatesPerSide.map((plateWeight, idx) => {
              const height = getPlateHeight(plateWeight);
              const color = getPlateColor(plateWeight);
              const xPos = 210 + idx * 10;
              return (
                <g key={`right-${idx}`}>
                  <rect
                    x={xPos}
                    y={60 - height / 2}
                    width="8"
                    height={height}
                    fill={color}
                    rx="2"
                    stroke="#0F172A"
                    strokeWidth="1"
                  />
                </g>
              );
            })}
          </svg>

          <span className="text-xs font-black text-emerald-400 mt-2">
            Load Per Side: {targetPerSide} kg
          </span>
        </div>

        {/* Plate Breakdown List */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Required Plates (Per Side)</span>
          {loadedPlatesPerSide.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {loadedPlatesPerSide.map((weight, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl text-xs font-black text-white border shadow-sm"
                  style={{ backgroundColor: `${getPlateColor(weight)}33`, borderColor: getPlateColor(weight) }}
                >
                  {weight} kg
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs font-semibold text-slate-400">Standard empty bar (20 kg)</span>
          )}
        </div>

        <Button3D variant="blue" fullWidth onClick={closePlateModal}>
          Done Loading
        </Button3D>
      </div>
    </div>
  );
};
