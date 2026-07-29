"use client";

import React, { useState } from "react";
import { Droplet, Plus, Trash2, Sparkles } from "lucide-react";
import { useDietStore, LiquidType } from "@/store/useDietStore";
import { soundscape } from "@/lib/soundscapeEngine";
import {
  ResponsiveCard,
  AdaptiveBadge,
  FlexibleRow,
  FlexibleGrid,
  FlexibleStack,
  AdaptiveHeading,
  AdaptiveText,
  FluidProgress,
  ResponsiveIconContainer,
} from "@/components/ui/primitives";

interface HydrationTrackerProps {
  dateStr: string;
}

export const HydrationTracker: React.FC<HydrationTrackerProps> = ({ dateStr }) => {
  const { hydrationByDate, dailyWaterTargetMl, addLiquid, removeLiquid } = useDietStore();
  const [selectedType, setSelectedType] = useState<LiquidType>("Water");

  const logs = hydrationByDate[dateStr] || [];
  const currentTotalMl = logs.reduce((sum, item) => sum + item.volumeMl, 0);
  const progressPct = Math.min(100, Math.round((currentTotalMl / dailyWaterTargetMl) * 100));

  const liquidTypes: { type: LiquidType; emoji: string; bg: string; activeBg: string; text: string }[] = [
    { type: "Water", emoji: "💧", bg: "bg-cyan-50 text-cyan-800 border-cyan-200", activeBg: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-sm", text: "text-cyan-700" },
    { type: "Electrolytes", emoji: "⚡", bg: "bg-amber-50 text-amber-800 border-amber-200", activeBg: "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-sm", text: "text-amber-700" },
    { type: "Protein Shake", emoji: "🥛", bg: "bg-purple-50 text-purple-800 border-purple-200", activeBg: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-400 shadow-sm", text: "text-purple-700" },
    { type: "Tea & Coffee", emoji: "☕", bg: "bg-yellow-50 text-yellow-900 border-yellow-200", activeBg: "bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-yellow-400 shadow-sm", text: "text-yellow-800" },
    { type: "Fresh Juice", emoji: "🥤", bg: "bg-rose-50 text-rose-800 border-rose-200", activeBg: "bg-gradient-to-r from-rose-500 to-pink-600 text-white border-rose-400 shadow-sm", text: "text-rose-700" },
  ];

  const handleQuickAdd = (amountMl: number) => {
    soundscape.playTapSound();
    const typeObj = liquidTypes.find((t) => t.type === selectedType);
    addLiquid(dateStr, selectedType, amountMl, typeObj?.emoji || "💧");
  };

  return (
    <ResponsiveCard variant="default" padding="normal" radius="3xl">
      <FlexibleStack gap="md">
        {/* Header */}
        <FlexibleRow justify="between" align="center" gap="sm">
          <FlexibleRow justify="start" align="center" gap="xs" className="flex-1 min-w-0">
            <ResponsiveIconContainer size="sm" variant="cyan">
              <Droplet className="w-4 h-4 text-cyan-600 animate-pulse" />
            </ResponsiveIconContainer>
            <div className="min-w-0 flex-1">
              <AdaptiveHeading level={3} className="truncate">
                Hydration & Liquidity Sanctuary
              </AdaptiveHeading>
              <AdaptiveText size="xs" variant="muted" className="mt-0.5">
                Track water, electrolytes, and protein shakes
              </AdaptiveText>
            </div>
          </FlexibleRow>

          <AdaptiveBadge variant="cyan" size="sm">
            {currentTotalMl} / {dailyWaterTargetMl} ml ({progressPct}%)
          </AdaptiveBadge>
        </FlexibleRow>

        {/* Visual Progress Bar */}
        <FluidProgress value={progressPct} height="md" color="cyan" showLabel labelPosition="top" subText={`${currentTotalMl} ml logged`} />

        {/* Select Liquid Category & Quick Add Buttons */}
        <FlexibleStack gap="sm">
          <FlexibleRow justify="start" align="center" gap="xs" className="flex-wrap">
            {liquidTypes.map((t) => {
              const isActive = selectedType === t.type;
              return (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setSelectedType(t.type)}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-black flex items-center space-x-1.5 border transition-all ${
                    isActive ? t.activeBg : `${t.bg} hover:border-slate-300`
                  }`}
                >
                  <span>{t.emoji}</span>
                  <span className="whitespace-nowrap">{t.type}</span>
                </button>
              );
            })}
          </FlexibleRow>

          {/* Quick Add Volume Buttons */}
          <FlexibleGrid minItemWidth={100} gap="xs">
            {[250, 500, 750, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleQuickAdd(amt)}
                className="py-2 px-2 bg-gradient-to-b from-cyan-50 to-cyan-100/60 hover:from-cyan-500 hover:to-blue-600 text-cyan-950 hover:text-white border border-cyan-300 rounded-2xl text-xs font-mono font-black transition-all flex items-center justify-center space-x-1 shadow-2xs active:scale-95 group"
              >
                <Plus className="w-3.5 h-3.5 shrink-0 group-hover:rotate-90 transition-transform" />
                <span>+{amt}ml</span>
              </button>
            ))}
          </FlexibleGrid>
        </FlexibleStack>

        {/* Fluid History Stream */}
        <FlexibleStack gap="xs" className="pt-2 border-t border-slate-100">
          <FlexibleRow justify="between" align="center">
            <AdaptiveText size="xs" variant="muted" className="uppercase font-bold tracking-wider">
              Today's Fluid Logs ({logs.length})
            </AdaptiveText>
            {logs.length > 0 && (
              <AdaptiveBadge variant="cyan" size="xs" icon={<Sparkles className="w-3 h-3" />}>
                Hydration Active
              </AdaptiveBadge>
            )}
          </FlexibleRow>

          {logs.length === 0 ? (
            <AdaptiveText size="xs" variant="muted" className="italic">
              No fluids logged today yet. Select a liquid and tap a volume above!
            </AdaptiveText>
          ) : (
            <FlexibleRow justify="start" align="center" gap="xs" className="flex-wrap">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono flex items-center space-x-1.5 text-slate-800 shrink-0"
                >
                  <span>{log.emoji}</span>
                  <span className="font-black text-slate-900">{log.type}</span>
                  <span className="text-cyan-700 font-black">+{log.volumeMl}ml</span>
                  <span className="text-[10px] text-slate-400">({log.timestamp})</span>
                  <button
                    type="button"
                    onClick={() => {
                      soundscape.playTapSound();
                      removeLiquid(dateStr, log.id);
                    }}
                    className="p-0.5 text-slate-300 hover:text-rose-600 transition-colors rounded shrink-0 ml-1"
                    title="Undo fluid log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </FlexibleRow>
          )}
        </FlexibleStack>
      </FlexibleStack>
    </ResponsiveCard>
  );
};
