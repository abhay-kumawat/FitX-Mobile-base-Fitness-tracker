"use client";

import React, { useState, useEffect } from "react";
import { GrowthBodyMap } from "@/components/charts/GrowthBodyMap";
import { MuscleAnalysisPanel } from "@/components/growth/MuscleAnalysisPanel";
import { Activity, Loader2 } from "lucide-react";

export const BodyAnalysisTab: React.FC = () => {
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/api/growth/muscle-analytics?user_id=1");
        const data = await res.json();
        setMetrics(data);
        if (Object.keys(data).length > 0 && !selectedMuscle) {
          setSelectedMuscle("Chest"); // Default selection
        }
      } catch (e) {
        console.error("Failed to fetch muscle analytics", e);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm font-bold">Scanning Body Metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in mt-3">
      <GrowthBodyMap
        metrics={metrics}
        selectedMuscle={selectedMuscle}
        onSelectMuscle={setSelectedMuscle}
      />
      
      {selectedMuscle && metrics[selectedMuscle] ? (
        <MuscleAnalysisPanel
          muscleName={selectedMuscle}
          data={metrics[selectedMuscle]}
        />
      ) : (
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl text-center text-slate-500">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs font-bold uppercase tracking-wider">Select a muscle group to view deep analytics.</p>
        </div>
      )}
    </div>
  );
};
