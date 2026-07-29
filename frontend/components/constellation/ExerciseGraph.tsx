"use client";

import React, { useState } from "react";
import { GitBranch, Lock, Unlock, Sparkles, CheckCircle2, ChevronRight, Award } from "lucide-react";

interface ConstellationNode {
  id: string;
  name: string;
  category: "Squat Progression" | "Push Progression" | "Hinge Progression";
  level: "Mastered" | "Active" | "Locked";
  prereq?: string;
  recordPR?: string;
  xpValue: number;
  x: number;
  y: number;
}

export default function ExerciseGraph() {
  const nodes: ConstellationNode[] = [
    // Squat Tree
    { id: "sq-1", name: "Bodyweight Squat", category: "Squat Progression", level: "Mastered", recordPR: "30 Reps", xpValue: 100, x: 14, y: 25 },
    { id: "sq-2", name: "Goblet Squat", category: "Squat Progression", level: "Mastered", prereq: "Bodyweight Squat", recordPR: "24kg x 12", xpValue: 250, x: 38, y: 25 },
    { id: "sq-3", name: "Barbell Back Squat", category: "Squat Progression", level: "Active", prereq: "Goblet Squat", recordPR: "100kg x 8", xpValue: 500, x: 62, y: 25 },
    { id: "sq-4", name: "Bulgarian Split Squat", category: "Squat Progression", level: "Locked", prereq: "Barbell Back Squat", xpValue: 750, x: 86, y: 25 },

    // Push Tree
    { id: "ps-1", name: "Standard Push-Up", category: "Push Progression", level: "Mastered", recordPR: "25 Reps", xpValue: 120, x: 14, y: 75 },
    { id: "ps-2", name: "Diamond Push-Up", category: "Push Progression", level: "Mastered", prereq: "Standard Push-Up", recordPR: "15 Reps", xpValue: 280, x: 38, y: 75 },
    { id: "ps-3", name: "Incline DB Press", category: "Push Progression", level: "Active", prereq: "Diamond Push-Up", recordPR: "28kg x 10", xpValue: 520, x: 62, y: 75 },
    { id: "ps-4", name: "Barbell Bench Press", category: "Push Progression", level: "Locked", prereq: "Incline DB Press", xpValue: 800, x: 86, y: 75 },
  ];

  const [activeNode, setActiveNode] = useState<ConstellationNode>(nodes[2]);

  return (
    <div className="glass-card rounded-[24px] p-5 space-y-4 border-fitx-borderSubtle">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-fitx-purpleGlow">Skill Constellation</span>
          <h3 className="text-sm font-extrabold text-white flex items-center">
            <GitBranch className="w-4 h-4 mr-1.5 text-fitx-gold" /> Movement Mastery Skill Tree
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-fitx-gold bg-fitx-gold/10 px-2.5 py-1 rounded-xl border border-fitx-gold/30">
          Level 8 Mastery
        </span>
      </div>

      {/* Interactive Constellation Visual Canvas */}
      <div className="relative w-full h-56 bg-gradient-to-b from-[#101010] to-[#161616] rounded-2xl border border-fitx-borderSubtle p-2 overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Connecting Glow Lines */}
          {/* Squat Line */}
          <line x1="15" y1="25" x2="40" y2="25" stroke="#A3E635" strokeWidth="1.5" strokeDasharray="2 1" />
          <line x1="40" y1="25" x2="65" y2="25" stroke="#F5C400" strokeWidth="2" />
          <line x1="65" y1="25" x2="90" y2="25" stroke="#333333" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Push Line */}
          <line x1="15" y1="75" x2="40" y2="75" stroke="#A3E635" strokeWidth="1.5" strokeDasharray="2 1" />
          <line x1="40" y1="75" x2="65" y2="75" stroke="#F5C400" strokeWidth="2" />
          <line x1="65" y1="75" x2="90" y2="75" stroke="#333333" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Interactive Nodes */}
          {nodes.map((node) => {
            const isSelected = activeNode.id === node.id;
            const isMastered = node.level === "Mastered";
            const isActive = node.level === "Active";
            const nodeColor = isMastered ? "#A3E635" : isActive ? "#F5C400" : "#555555";

            return (
              <g
                key={node.id}
                onClick={() => setActiveNode(node)}
                className="cursor-pointer transition-transform hover:scale-125"
              >
                {/* Node Outer Halo Glow */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? "7" : "5"}
                  fill={nodeColor}
                  opacity={isSelected ? "0.9" : "0.5"}
                  stroke={isSelected ? "#FFFFFF" : nodeColor}
                  strokeWidth={isSelected ? "2" : "1"}
                  className={isSelected ? "animate-pulse" : ""}
                />

                {/* Inner Icon Indicator */}
                <circle cx={node.x} cy={node.y} r="2.5" fill="#0A0A0A" />

                <text
                  x={node.x}
                  y={node.y + (node.y < 50 ? -9 : 12)}
                  fontSize="3"
                  fontWeight="bold"
                  fill={isSelected ? "#FFD60A" : "#CCCCCC"}
                  textAnchor="middle"
                >
                  {node.name.split(" ")[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Details Card */}
      <div className="glass-card p-4 rounded-2xl border-fitx-gold/40 bg-fitx-cardAlt space-y-2">
        <div className="flex items-center justify-between border-b border-fitx-borderSubtle pb-2">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-fitx-gold" />
            <h4 className="text-xs font-extrabold text-white">{activeNode.name}</h4>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
              activeNode.level === "Mastered"
                ? "bg-fitx-neonGreen/15 text-fitx-neonGreen border-fitx-neonGreen/30"
                : activeNode.level === "Active"
                ? "bg-fitx-gold/15 text-fitx-gold border-fitx-gold/30"
                : "bg-gray-800 text-gray-400 border-gray-700"
            }`}
          >
            {activeNode.level}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
          <div>
            <span className="text-fitx-textSecondary text-[10px] block">Personal Record (PR):</span>
            <span className="text-white font-extrabold">{activeNode.recordPR || "Not Set"}</span>
          </div>
          <div>
            <span className="text-fitx-textSecondary text-[10px] block">XP Reward:</span>
            <span className="text-fitx-gold font-extrabold">+{activeNode.xpValue} XP</span>
          </div>
        </div>

        {activeNode.prereq && (
          <div className="text-[11px] text-fitx-textSecondary pt-1 flex items-center">
            <span>Prerequisite:</span>
            <span className="text-white font-semibold ml-1.5 flex items-center">
              {activeNode.prereq} <ChevronRight className="w-3 h-3 text-fitx-gold ml-0.5" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
