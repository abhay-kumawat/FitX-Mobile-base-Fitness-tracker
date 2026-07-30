import React, { useState } from "react";
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface InsightExplainerProps {
  title: string;
  value: string | number;
  explanation: string;
  confidence: string;
  trendDirection: "up" | "down" | "neutral";
  trendValue: string;
}

export function InsightExplainer({ title, value, explanation, confidence, trendDirection, trendValue }: InsightExplainerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative group" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-default flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
          <Info className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
        </div>
        
        <div className="flex items-end justify-between mt-auto">
          <div className="text-2xl font-black text-slate-800">{value}</div>
          
          {trendDirection !== "neutral" && (
            <div className={`flex items-center text-xs font-bold ${trendDirection === "up" ? "text-emerald-600" : "text-rose-600"}`}>
              {trendDirection === "up" ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
              {trendValue}
            </div>
          )}
          {trendDirection === "neutral" && (
            <div className="flex items-center text-xs font-bold text-slate-400">
              <Minus className="w-3.5 h-3.5 mr-1" />
              {trendValue}
            </div>
          )}
        </div>
      </div>

      {/* Popover */}
      {isOpen && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-64 bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700/50 text-xs">
          <p className="font-medium text-slate-300 mb-2">{explanation}</p>
          <div className="flex items-center justify-between border-t border-slate-700 pt-2 mt-2">
            <span className="text-slate-400 font-medium">AI Confidence</span>
            <span className="font-bold text-emerald-400">{confidence}</span>
          </div>
          {/* A small pointer triangle */}
          <div className="absolute top-full left-6 -mt-1 border-4 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
}
