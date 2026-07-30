"use client";

import React, { useState, useEffect } from "react";
import { Search, Calendar as CalendarIcon, Filter } from "lucide-react";
import { PillBadge } from "@/components/atomic/PillBadge";
import { DynamicGraphEngine } from "./DynamicGraphEngine";
import { InsightExplainer } from "./InsightExplainer";
import { ReplayMyDay } from "./ReplayMyDay";
import { Loader2 } from "lucide-react";

export function GrowthLabTab() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGraph, setActiveGraph] = useState<"consistency" | "recovery" | "volume">("consistency");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch dashboard metrics
        const dashboardRes = await fetch("/api/v1/pipeline/analytics/dashboard?user_id=1&timeframe=30d");
        const dashboardJson = await dashboardRes.json();
        
        if (dashboardJson.status === "success") {
          setDashboardData(dashboardJson);
        }

        // Fetch timeline events for replay
        const timelineRes = await fetch(`/api/v1/pipeline/analytics/timeline?user_id=1&limit=20`);
        const timelineJson = await timelineRes.json();
        
        // Format events for ReplayMyDay component
        const formattedEvents = timelineJson.map((e: any) => ({
          id: e.id.toString(),
          time: new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: e.category, // "workout", "sleep", "nutrition", "body", "recovery"
          title: e.type.replace("_", " ").toUpperCase(),
          details: Object.entries(e.payload).map(([k, v]) => `${k}: ${v}`).join(", ")
        }));
        setTimelineEvents(formattedEvents);

      } catch (e) {
        console.error("Failed to fetch analytics data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedDate]);

  const getGraphConfig = () => {
    switch (activeGraph) {
      case "recovery":
        return { type: "line" as const, lines: [{ key: "recovery", color: "#6366f1", name: "Recovery Score" }] };
      case "volume":
        return { type: "bar" as const, bars: [{ key: "volume", color: "#f59e0b", name: "Volume (kg)" }] };
      case "consistency":
      default:
        return { type: "area" as const, areas: [{ key: "consistency", color: "#10b981", name: "Consistency (%)" }] };
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
        <p className="text-sm font-bold">Compiling Analytics Data...</p>
      </div>
    );
  }

  const graphConfig = getGraphConfig();

  return (
    <div className="flex flex-col gap-6 animate-smooth-reveal">
      
      {/* Insight Scorecards */}
      {dashboardData && dashboardData.cards && (
        <div className="grid grid-cols-2 gap-3">
          {dashboardData.cards.slice(0, 4).map((card: any, idx: number) => (
            <InsightExplainer 
              key={idx}
              title={card.title}
              value={typeof card.value === 'number' && card.value > 1000 ? (card.value / 1000).toFixed(1) + 'k' : (typeof card.value === 'number' ? card.value.toFixed(1) : card.value)}
              explanation={card.explanation}
              confidence={card.confidence}
              trendDirection={card.trend_direction}
              trendValue={card.trend_value}
            />
          ))}
        </div>
      )}

      {/* Dynamic Graph Engine */}
      {dashboardData && dashboardData.graph_data && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-900">Performance Trends</h3>
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button 
                onClick={() => setActiveGraph("consistency")}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-colors ${activeGraph === 'consistency' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
              >
                Consistency
              </button>
              <button 
                onClick={() => setActiveGraph("recovery")}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-colors ${activeGraph === 'recovery' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                Recovery
              </button>
              <button 
                onClick={() => setActiveGraph("volume")}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-colors ${activeGraph === 'volume' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'}`}
              >
                Volume
              </button>
            </div>
          </div>
          <DynamicGraphEngine 
            data={dashboardData.graph_data} 
            type={graphConfig.type}
            xKey="date"
            lines={'lines' in graphConfig ? graphConfig.lines : undefined}
            areas={'areas' in graphConfig ? graphConfig.areas : undefined}
            bars={'bars' in graphConfig ? graphConfig.bars : undefined}
          />
        </div>
      )}

      {/* Replay My Day Timeline */}
      <ReplayMyDay events={timelineEvents} date={selectedDate} />

    </div>
  );
}
