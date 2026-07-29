"use client";

import React from "react";
import { BadgeItem } from "@/store/useGamificationStore";
import { Lock } from "lucide-react";

interface BadgeTileProps {
  badge: BadgeItem;
}

export const BadgeTile: React.FC<BadgeTileProps> = ({ badge }) => {
  const getTierColor = () => {
    switch (badge.tier) {
      case "diamond":
        return "bg-cyan-50 border-cyan-300 text-cyan-900 shadow-xs";
      case "gold":
        return "bg-amber-50 border-amber-300 text-amber-900 shadow-xs";
      case "silver":
        return "bg-slate-100 border-slate-300 text-slate-900 shadow-xs";
      case "bronze":
      default:
        return "bg-orange-50 border-orange-300 text-orange-900 shadow-xs";
    }
  };

  return (
    <div
      className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 relative transition-all ${
        badge.unlocked ? `${getTierColor()}` : "bg-slate-100 border-slate-200 opacity-60"
      }`}
    >
      <div className="w-13 h-13 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-xs relative">
        {badge.icon}
        {!badge.unlocked && (
          <div className="absolute inset-0 bg-slate-200/80 rounded-2xl flex items-center justify-center">
            <Lock className="w-4 h-4 text-slate-500" />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center">
        <h5 className="text-xs font-black text-slate-900">{badge.title}</h5>
        <span className="text-[10px] font-semibold text-slate-600 mt-0.5 leading-tight">{badge.description}</span>
      </div>

      <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
        {badge.tier}
      </span>
    </div>
  );
};
