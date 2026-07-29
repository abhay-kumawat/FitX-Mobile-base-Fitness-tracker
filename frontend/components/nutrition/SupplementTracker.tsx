"use client";

import React, { useState } from "react";
import { Pill, Check, Plus, Clock, Trash2, ShieldCheck } from "lucide-react";
import { useDietStore, SupplementTiming } from "@/store/useDietStore";
import { soundscape } from "@/lib/soundscapeEngine";
import {
  ResponsiveCard,
  AdaptiveBadge,
  FlexibleRow,
  FlexibleGrid,
  FlexibleStack,
  AdaptiveHeading,
  AdaptiveText,
  ResponsiveIconContainer,
  SmartButton,
} from "@/components/ui/primitives";

interface SupplementTrackerProps {
  dateStr: string;
}

export const SupplementTracker: React.FC<SupplementTrackerProps> = ({ dateStr }) => {
  const { supplementsByDate, toggleSupplementStatus, addSupplement, removeSupplement } = useDietStore();

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("1 scoop (5g)");
  const [timing, setTiming] = useState<SupplementTiming>("Pre-Workout");
  const [scheduledTime, setScheduledTime] = useState("16:00");
  const [isAdding, setIsAdding] = useState(false);

  const supps = supplementsByDate[dateStr] || [];

  const handleToggle = (id: string) => {
    soundscape.playTapSound();
    toggleSupplementStatus(dateStr, id);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundscape.playTapSound();
    addSupplement(dateStr, {
      name,
      dosage,
      timing,
      scheduledTime,
      dateStr,
      badgeEmoji: timing === "Pre-Workout" ? "🔥" : timing === "Morning" ? "🌅" : "💊",
    });

    setName("");
    setIsAdding(false);
  };

  const timingBadges: Record<SupplementTiming, { emoji: string; variant: "amber" | "emerald" | "rose" | "purple" | "blue" }> = {
    Morning: { emoji: "🌅", variant: "amber" },
    "With Meals": { emoji: "🥗", variant: "emerald" },
    "Pre-Workout": { emoji: "🔥", variant: "rose" },
    "Post-Workout": { emoji: "🥛", variant: "purple" },
    Bedtime: { emoji: "🌙", variant: "blue" },
  };

  return (
    <ResponsiveCard variant="default" padding="normal" radius="3xl">
      <FlexibleStack gap="md">
        {/* Header */}
        <FlexibleRow justify="between" align="center" gap="sm">
          <FlexibleRow justify="start" align="center" gap="xs" className="flex-1 min-w-0">
            <ResponsiveIconContainer size="sm" variant="purple">
              <Pill className="w-4 h-4 text-purple-600" />
            </ResponsiveIconContainer>
            <div className="min-w-0 flex-1">
              <AdaptiveHeading level={3} className="truncate">
                Medicine & Supplement Schedule
              </AdaptiveHeading>
              <AdaptiveText size="xs" variant="muted" className="mt-0.5">
                Track daily doses, timing slots, and medication check-offs
              </AdaptiveText>
            </div>
          </FlexibleRow>

          <SmartButton
            variant="purple"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAdding(!isAdding)}
          >
            {isAdding ? "Cancel" : "Add Supp"}
          </SmartButton>
        </FlexibleRow>

        {/* Add Supplement Drawer */}
        {isAdding && (
          <ResponsiveCard variant="subtle" padding="compact" radius="2xl" className="border-purple-200 bg-purple-50/70">
            <form onSubmit={handleAdd} className="space-y-2.5">
              <FlexibleRow justify="start" align="center" gap="xs" className="text-xs font-black text-purple-900">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Add Medication or Supplement</span>
              </FlexibleRow>

              <input
                type="text"
                required
                placeholder="Supplement / Medication Name (e.g. Creatine, Omega-3)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-sans"
              />

              <FlexibleGrid minItemWidth={120} gap="xs">
                <input
                  type="text"
                  placeholder="Dosage (5g / 1 pill)"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-sans"
                />
                <select
                  value={timing}
                  onChange={(e) => setTiming(e.target.value as SupplementTiming)}
                  className="p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-sans"
                >
                  <option value="Morning">🌅 Morning</option>
                  <option value="With Meals">🥗 With Meals</option>
                  <option value="Pre-Workout">🔥 Pre-Workout</option>
                  <option value="Post-Workout">🥛 Post-Workout</option>
                  <option value="Bedtime">🌙 Bedtime</option>
                </select>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                />
              </FlexibleGrid>

              <SmartButton type="submit" variant="purple" size="sm" fullWidth>
                ✨ Save Supplement / Drug Schedule
              </SmartButton>
            </form>
          </ResponsiveCard>
        )}

        {/* Supplement Cards List */}
        <FlexibleStack gap="xs">
          {supps.length === 0 ? (
            <AdaptiveText size="xs" variant="muted" className="italic text-center py-2">
              No supplements or medications scheduled for today.
            </AdaptiveText>
          ) : (
            supps.map((supp) => {
              const isDone = supp.status === "completed";
              const badge = timingBadges[supp.timing] || { emoji: "💊", variant: "slate" };

              return (
                <ResponsiveCard
                  key={supp.id}
                  variant={isDone ? "subtle" : "default"}
                  padding="compact"
                  radius="2xl"
                  className={`transition-all ${isDone ? "bg-purple-50/40 border-purple-200 opacity-90" : "hover:border-purple-300"}`}
                >
                  <FlexibleRow justify="between" align="center" gap="sm">
                    <FlexibleRow justify="start" align="center" gap="xs" className="flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggle(supp.id)}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                          isDone
                            ? "bg-purple-600 text-white shadow-xs scale-105"
                            : "border-2 border-slate-300 hover:border-purple-500 text-transparent"
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      <FlexibleStack gap="xs" className="flex-1 min-w-0">
                        <FlexibleRow justify="start" align="center" gap="xs">
                          <span className={`text-xs sm:text-sm font-black break-words ${isDone ? "line-through text-slate-400" : "text-slate-900"}`}>
                            {supp.name}
                          </span>
                          <AdaptiveBadge variant="purple" size="xs">
                            {supp.dosage}
                          </AdaptiveBadge>
                        </FlexibleRow>

                        <FlexibleRow justify="start" align="center" gap="xs" className="text-[11px] font-mono text-slate-500">
                          <AdaptiveBadge variant={badge.variant} size="xs">
                            {badge.emoji} {supp.timing}
                          </AdaptiveBadge>

                          {supp.scheduledTime && (
                            <span className="flex items-center text-slate-400">
                              <Clock className="w-3 h-3 mr-0.5 inline" /> {supp.scheduledTime}
                            </span>
                          )}
                        </FlexibleRow>
                      </FlexibleStack>
                    </FlexibleRow>

                    <button
                      type="button"
                      onClick={() => {
                        soundscape.playTapSound();
                        removeSupplement(dateStr, supp.id);
                      }}
                      className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 shrink-0"
                      title="Delete supplement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </FlexibleRow>
                </ResponsiveCard>
              );
            })
          )}
        </FlexibleStack>
      </FlexibleStack>
    </ResponsiveCard>
  );
};
