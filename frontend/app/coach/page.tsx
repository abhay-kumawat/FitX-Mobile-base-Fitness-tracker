"use client";

import React, { useState } from "react";
import CoachChatWindow from "@/components/coach_chat/CoachChatWindow";
import KIEKnowledgeGraphModal from "@/components/kie/KIEKnowledgeGraphModal";
import { BookOpen, Sparkles } from "lucide-react";
import { PillBadge } from "@/components/atomic/PillBadge";
import { Button3D } from "@/components/atomic/Button3D";

export default function CoachPage() {
  const [showKIEGraph, setShowKIEGraph] = useState(false);

  return (
    <div className="space-y-4 pb-24 animate-smooth-reveal">
      <KIEKnowledgeGraphModal isOpen={showKIEGraph} onClose={() => setShowKIEGraph(false)} />

      {/* KIE Knowledge Intelligence Header Banner */}
      <div className="duo-card p-4 rounded-3xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 tracking-tight flex items-center">
              Knowledge Intelligence Engine <Sparkles className="w-3 h-3 ml-1 text-emerald-600" />
            </h3>
            <p className="text-[10px] text-slate-500 font-mono font-bold">Peer-Reviewed Level I-V Evidence Grounding</p>
          </div>
        </div>

        <Button3D
          variant="secondary"
          onClick={() => setShowKIEGraph(true)}
          className="text-xs py-1.5 px-3"
        >
          Explore Graph
        </Button3D>
      </div>

      <CoachChatWindow />
    </div>
  );
}
