"use client";

import React, { useState } from "react";
import { TreePine, LineChart, Bot, Activity } from "lucide-react";
import { GrowthTreeTab } from "@/components/growth/GrowthTreeTab";
import { GrowthLabTab } from "@/components/growth/GrowthLabTab";
import { AICoachIntelligenceTab } from "@/components/growth/AICoachIntelligenceTab";
import { BodyAnalysisTab } from "@/components/growth/BodyAnalysisTab";
import { AuthGuard } from "@/components/AuthGuard";

export default function SkillTreePage() {
  const [activeTab, setActiveTab] = useState<"tree" | "lab" | "coach" | "body">("tree");

  return (
    <AuthGuard>
      <div className="flex flex-col gap-5 pb-28">
        {/* Header */}
        <div className="px-1 flex flex-col gap-1 mt-2">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Growth Intelligence</h1>
          <p className="text-xs font-medium text-slate-500">Your biological and performance evolution.</p>
        </div>

        {/* Modern Pill Tabs */}
        <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-full mx-1">
          <button
            onClick={() => setActiveTab("tree")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[11px] font-bold transition-all ${
              activeTab === "tree"
                ? "bg-white text-emerald-700 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <TreePine className="w-3.5 h-3.5" /> Tree
          </button>
          <button
            onClick={() => setActiveTab("lab")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[11px] font-bold transition-all ${
              activeTab === "lab"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <LineChart className="w-3.5 h-3.5" /> Lab
          </button>
          <button
            onClick={() => setActiveTab("coach")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[11px] font-bold transition-all ${
              activeTab === "coach"
                ? "bg-white text-purple-700 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> Coach
          </button>
          <button
            onClick={() => setActiveTab("body")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[11px] font-bold transition-all ${
              activeTab === "body"
                ? "bg-white text-rose-700 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Body
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="px-1">
          {activeTab === "tree" && <GrowthTreeTab />}
          {activeTab === "lab" && <GrowthLabTab />}
          {activeTab === "coach" && <AICoachIntelligenceTab />}
          {activeTab === "body" && <BodyAnalysisTab />}
        </div>
      </div>
    </AuthGuard>
  );
}
