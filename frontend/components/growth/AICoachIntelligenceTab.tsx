"use client";

import React, { useState } from "react";
import { Bot, Zap, MessageSquare, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { PillBadge } from "@/components/atomic/PillBadge";
import { Button3D } from "@/components/atomic/Button3D";

export function AICoachIntelligenceTab() {
  const [expandedId, setExpandedId] = useState<string | null>("rec-1");

  const recommendations = [
    {
      id: "rec-1",
      title: "Increase Shoulder Volume",
      summary: "Your shoulder progression has stalled. I recommend adding 2 more sets per week.",
      confidence: 89,
      evidence: [
        "Shoulder trained only once in last 14 days.",
        "Chest trained four times.",
        "Recovery score high (85/100).",
        "Previous shoulder progression positive."
      ],
      actionLabel: "Apply Change",
    },
    {
      id: "rec-2",
      title: "Sleep & Cortisol Alert",
      summary: "Your workouts are running over 60 mins consistently. This may impact recovery.",
      confidence: 94,
      evidence: [
        "Last 3 sessions averaged 72 minutes.",
        "Reported morning energy dropped to 4/10.",
        "Cortisol buildup negatively affects hypertrophy."
      ],
      actionLabel: "Cap Workouts to 50m",
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-smooth-reveal">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-6 h-6 text-purple-300" />
            <h2 className="text-base font-black text-white">AI Coach Intelligence</h2>
          </div>
          <p className="text-sm text-purple-200">
            I don't just guess. Every recommendation is grounded in your historical data.
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Bot className="w-32 h-32" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-black text-slate-900 px-1">Data-Driven Insights</h3>
        
        <div className="flex flex-col gap-3">
          {recommendations.map((rec) => {
            const isExpanded = expandedId === rec.id;
            return (
              <div key={rec.id} className="bg-white border border-slate-200 rounded-2xl p-1 shadow-xs transition-all">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                  className="w-full flex flex-col gap-2 p-3 text-left focus:outline-none"
                >
                  <div className="flex items-center justify-between w-full">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-500" /> {rec.title}
                    </h4>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rec.summary}</p>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 flex flex-col gap-4 border-t border-slate-100 mt-2">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-500" /> Evidence & Reasoning
                        </span>
                        <PillBadge variant="purple">{rec.confidence}% Confidence</PillBadge>
                      </div>
                      <ul className="text-[11px] text-slate-600 flex flex-col gap-2 list-disc pl-4 marker:text-purple-400 font-medium">
                        {rec.evidence.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button3D variant="primary" className="text-xs py-2.5">
                      {rec.actionLabel}
                    </Button3D>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-inner mt-4">
        <MessageSquare className="w-5 h-5 text-slate-400 shrink-0" />
        <input 
          type="text" 
          placeholder="Ask AI: What should I change this week?"
          className="bg-transparent border-none text-sm font-medium text-slate-900 focus:ring-0 p-0 w-full placeholder:text-slate-400"
        />
        <Button3D variant="secondary" className="px-3 py-1.5 text-xs whitespace-nowrap">Ask</Button3D>
      </div>
    </div>
  );
}
