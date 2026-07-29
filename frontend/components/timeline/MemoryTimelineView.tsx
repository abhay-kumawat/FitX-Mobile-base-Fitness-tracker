"use client";

import React, { useState } from "react";
import { History, CheckCircle, Plus } from "lucide-react";
import { PillBadge } from "@/components/atomic/PillBadge";
import { Button3D } from "@/components/atomic/Button3D";
import { soundscape } from "@/lib/soundscapeEngine";

export default function MemoryTimelineView() {
  const [memories, setMemories] = useState([
    { id: 1, category: "injury", content: "Right shoulder impiningement reported during overhead press", confidence: 0.96, is_active: true, timestamp: "2 hours ago" },
    { id: 2, category: "preference", content: "Prefers high-protein vegetarian options for dinner", confidence: 0.92, is_active: true, timestamp: "1 day ago" },
    { id: 3, category: "habit", content: "Workout completion highest between 7:00 AM - 8:30 AM", confidence: 0.98, is_active: true, timestamp: "3 days ago" },
    { id: 4, category: "milestone", content: "Achieved 100kg Barbell Squat 1RM Personal Record", confidence: 1.0, is_active: true, timestamp: "1 week ago" }
  ]);

  const [newMemoryText, setNewMemoryText] = useState("");

  const handleAddMemory = () => {
    soundscape.playTapSound();
    if (!newMemoryText.trim()) return;
    const item = {
      id: Date.now(),
      category: "user_feedback",
      content: newMemoryText,
      confidence: 0.95,
      is_active: true,
      timestamp: "Just now"
    };
    setMemories([item, ...memories]);
    setNewMemoryText("");
  };

  const getCategoryBadgeVariant = (cat: string): "red" | "purple" | "blue" | "green" => {
    switch (cat) {
      case "injury":
        return "red";
      case "preference":
        return "purple";
      case "habit":
        return "blue";
      default:
        return "green";
    }
  };

  return (
    <div className="duo-card rounded-3xl p-5 bg-white border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center">
          <History className="w-4 h-4 mr-1.5 text-emerald-600" /> AI Memory Timeline & Journal
        </h3>
        <PillBadge variant="green">Context Pipeline</PillBadge>
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={newMemoryText}
          onChange={(e) => setNewMemoryText(e.target.value)}
          placeholder="Add custom memory context or feedback..."
          className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
        />
        <Button3D
          variant="green"
          onClick={handleAddMemory}
          className="text-xs py-2 px-3"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Memory
        </Button3D>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-3 pl-4 space-y-4 pt-1">
        {memories.map((mem) => (
          <div key={mem.id} className="relative group">
            <div className="absolute -left-[21px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-500 shadow-xs" />
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <PillBadge variant={getCategoryBadgeVariant(mem.category)}>
                  {mem.category}
                </PillBadge>
                <span className="text-[10px] font-mono font-bold text-slate-500">{mem.timestamp}</span>
              </div>
              <p className="text-xs font-extrabold text-slate-800 leading-normal">{mem.content}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-200 pt-1.5 font-bold">
                <span>Confidence: {(mem.confidence * 100).toFixed(0)}%</span>
                <span className="text-emerald-700 flex items-center font-black">
                  <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" /> Active in Context
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
