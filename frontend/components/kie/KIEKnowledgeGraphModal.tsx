"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, ShieldCheck, Tag, X, Search, Layers, CheckCircle2 } from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

interface KIEKnowledgeGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KIEKnowledgeGraphModal({
  isOpen,
  onClose,
}: KIEKnowledgeGraphModalProps) {
  const [taxonomy, setTaxonomy] = useState<any>(null);
  const [activeNode, setActiveNode] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("hypertrophy volume");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTaxonomyAndDefaultNode();
    }
  }, [isOpen]);

  const loadTaxonomyAndDefaultNode = async () => {
    setIsLoading(true);
    try {
      const [tax, node] = await Promise.all([
        fetchFromAPI("/kie/taxonomy"),
        fetchFromAPI("/kie/evidence-node?id=kie_node_hypertrophy_01"),
      ]);
      setTaxonomy(tax);
      setActiveNode(node);
    } catch (e) {
      console.warn("KIE fetch error", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-cartoon-pop">
      <div className="w-full max-w-lg cartoon-card p-6 bg-gradient-to-br from-[#0B101D] via-[#10172A] to-[#1A233A] border-2 border-fitx-lavender/50 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-2xl bg-fitx-lavender/20 text-fitx-lavender">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight flex items-center">
                Knowledge Intelligence Engine <Sparkles className="w-3.5 h-3.5 ml-1 text-fitx-lavender" />
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">22 Domains • Evidence-Backed Graph</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 touch-target"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Taxonomy Categories Scroll Pills */}
        {taxonomy && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block">
              22 Structured Science Domains ({taxonomy.active_knowledge_nodes} Verified Nodes)
            </span>
            <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {taxonomy.categories?.slice(0, 8).map((cat: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-slate-300 whitespace-nowrap"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Selected Evidence Node Detail Card */}
        {activeNode && (
          <div className="space-y-3.5 p-4 rounded-2xl bg-white/5 border border-fitx-lavender/30 animate-cartoon-pop">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-extrabold uppercase text-fitx-lavender bg-fitx-lavender/20 px-2.5 py-0.5 rounded-full border border-fitx-lavender/40">
                {activeNode.evidence_level} EVIDENCE
              </span>
              <span className="text-[10px] font-mono font-bold text-fitx-emerald bg-fitx-emerald/15 px-2 py-0.5 rounded-full border border-fitx-emerald/30">
                {(activeNode.confidence_score * 100).toFixed(0)}% Consensus
              </span>
            </div>

            <div>
              <h4 className="text-sm font-extrabold text-white">{activeNode.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{activeNode.description}</p>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-white/10 text-xs font-mono">
              <div className="flex items-start">
                <span className="text-slate-400 font-bold w-28 shrink-0">Population:</span>
                <span className="text-slate-200">{activeNode.applicable_population?.join(", ")}</span>
              </div>
              <div className="flex items-start">
                <span className="text-rose-400 font-bold w-28 shrink-0">Contraindicated:</span>
                <span className="text-rose-300">{activeNode.contraindications?.join(", ")}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 pt-1">
              {activeNode.tags?.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-fitx-lavender/10 text-fitx-lavender border border-fitx-lavender/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
