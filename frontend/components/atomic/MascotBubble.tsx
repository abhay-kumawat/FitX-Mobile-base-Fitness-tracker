"use client";

import React from "react";
import { MascotVector } from "./MascotVector";
import { PillBadge } from "./PillBadge";

interface MascotBubbleProps {
  dialogue?: string;
  mood?: "happy" | "pumped" | "calm" | "celebratory";
  moodTag?: string;
  mascotSize?: number;
}

export const MascotBubble: React.FC<MascotBubbleProps> = ({
  dialogue = "Good morning, Champion! Your HRV is at 95%. Ready to crush Upper Body Hypertrophy today?",
  mood = "happy",
  moodTag = "Flexy: 100% Charged!",
  mascotSize = 84,
}) => {
  return (
    <div className="flex items-start gap-3 p-4 rounded-3xl duo-card bg-white border border-slate-200 shadow-md relative overflow-hidden max-w-full">
      <div className="shrink-0 flex flex-col items-center">
        <MascotVector mood={mood} size={mascotSize} />
        {moodTag && (
          <PillBadge variant="green" className="-mt-2 shadow-md">
            {moodTag}
          </PillBadge>
        )}
      </div>

      <div className="flex-1 min-w-0 relative pt-1">
        {/* Speech Bubble Arrow */}
        <div className="absolute top-6 -left-3.5 w-4 h-4 bg-slate-100 rotate-45 border-l border-b border-slate-200" />

        <div className="bg-slate-100/90 border border-slate-200 p-3 rounded-2xl shadow-xs relative z-10 break-words">
          <p className="text-xs font-bold text-slate-800 leading-relaxed">
            "{dialogue}"
          </p>
        </div>
      </div>
    </div>
  );
};

