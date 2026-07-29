"use client";

import React, { useState } from "react";
import { SlidersHorizontal, ShieldCheck, Zap, Flame, Activity, Sparkles, RefreshCw } from "lucide-react";
import {
  ResponsiveCard,
  MetricCard,
  AdaptiveBadge,
  FlexibleRow,
  FlexibleGrid,
  FlexibleStack,
  AdaptiveHeading,
  AdaptiveText,
  AdaptiveNumber,
  ResponsiveIconContainer,
  FluidProgress,
  SmartButton,
  LayoutBoundary,
} from "@/components/ui/primitives";

export const UIStressTestPlayground: React.FC = () => {
  // Stress test states
  const [extremeNumbers, setExtremeNumbers] = useState(false);
  const [longText, setLongText] = useState(false);
  const [badgeExplosion, setBadgeExplosion] = useState(false);
  const [aiParagraphs, setAiParagraphs] = useState(false);
  const [simulatedWidth, setSimulatedWidth] = useState<"320px" | "375px" | "768px" | "100%">("100%");

  const calories = extremeNumbers ? 99999 : 2450;
  const protein = extremeNumbers ? 9999 : 185;
  const carbs = extremeNumbers ? 8888 : 260;
  const fat = extremeNumbers ? 7777 : 70;

  const foodTitle = longText
    ? "Special Anabolic Homemade Whole Wheat Multigrain Protein Paratha Roll with Extra Cottage Cheese, Paneer Tikka, Spiced Dal & Greek Yogurt Dressing"
    : "Grilled Chicken & Brown Rice Bowl";

  return (
    <LayoutBoundary maxWidth="xl" padding="normal">
      <FlexibleStack gap="lg">
        {/* Header Banner */}
        <ResponsiveCard variant="gradient" padding="normal">
          <FlexibleRow justify="between" align="center" gap="md">
            <FlexibleStack gap="xs" className="flex-1">
              <FlexibleRow justify="start" align="center" gap="xs">
                <ResponsiveIconContainer size="md" variant="purple">
                  <SlidersHorizontal className="w-5 h-5 text-purple-600" />
                </ResponsiveIconContainer>
                <AdaptiveHeading level={2}>
                  UI Layout Resilience & Stress Test Playground
                </AdaptiveHeading>
              </FlexibleRow>
              <AdaptiveText size="sm" variant="secondary">
                Simulate extreme backend data, massive numbers, long titles, badge explosions, and responsive breakpoints to verify ZERO overflow, ZERO text clipping, and perfect layout boundaries.
              </AdaptiveText>
            </FlexibleStack>

            <AdaptiveBadge variant="gold" size="md" icon={<ShieldCheck className="w-4 h-4" />}>
              100% Adaptive Architecture
            </AdaptiveBadge>
          </FlexibleRow>
        </ResponsiveCard>

        {/* Interactive Controls Drawer */}
        <ResponsiveCard variant="subtle" padding="compact" radius="2xl">
          <FlexibleStack gap="sm">
            <AdaptiveHeading level={4} className="text-slate-800 font-bold uppercase tracking-wider text-xs">
              🧪 Live Stress Test Controls
            </AdaptiveHeading>

            <FlexibleRow justify="start" align="center" gap="sm" className="flex-wrap">
              <button
                onClick={() => setExtremeNumbers(!extremeNumbers)}
                className={`px-3 py-2 rounded-xl text-xs font-black border transition-all ${
                  extremeNumbers
                    ? "bg-rose-600 text-white border-rose-700 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                🔥 Extreme Numbers (99999 kcal)
              </button>

              <button
                onClick={() => setLongText(!longText)}
                className={`px-3 py-2 rounded-xl text-xs font-black border transition-all ${
                  longText
                    ? "bg-amber-500 text-amber-950 border-amber-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                📝 Long Titles (250 chars)
              </button>

              <button
                onClick={() => setBadgeExplosion(!badgeExplosion)}
                className={`px-3 py-2 rounded-xl text-xs font-black border transition-all ${
                  badgeExplosion
                    ? "bg-purple-600 text-white border-purple-700 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                💥 Badge Explosion (10+ badges)
              </button>

              <button
                onClick={() => setAiParagraphs(!aiParagraphs)}
                className={`px-3 py-2 rounded-xl text-xs font-black border transition-all ${
                  aiParagraphs
                    ? "bg-cyan-600 text-white border-cyan-700 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                🤖 AI Multi-Paragraphs
              </button>

              <div className="flex items-center space-x-1 font-mono text-xs">
                <span className="font-bold text-slate-500 mr-1">Viewport Width:</span>
                {(["100%", "768px", "375px", "320px"] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => setSimulatedWidth(w)}
                    className={`px-2 py-1 rounded-lg font-bold border transition-all ${
                      simulatedWidth === w
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-300"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </FlexibleRow>
          </FlexibleStack>
        </ResponsiveCard>

        {/* Test Container Frame */}
        <div
          style={{ width: simulatedWidth, maxWidth: "100%" }}
          className="mx-auto transition-all duration-300 space-y-6 border-2 border-dashed border-slate-300 p-2 sm:p-4 rounded-3xl bg-slate-50/50"
        >
          {/* Card 1: Adaptive Nutrition Summary Card under Stress */}
          <ResponsiveCard variant="default" padding="normal" radius="3xl">
            <FlexibleStack gap="md">
              <FlexibleRow justify="between" align="center">
                <AdaptiveHeading level={3}>Live Macro Dashboard</AdaptiveHeading>
                <AdaptiveBadge variant="emerald" size="sm">
                  Stress Test Active
                </AdaptiveBadge>
              </FlexibleRow>

              {/* Metric Cards Grid under Stress */}
              <FlexibleGrid minItemWidth={150} gap="sm">
                <MetricCard
                  label="Protein"
                  value={protein}
                  target={180}
                  unit="g"
                  accentColor="emerald"
                  ratioBadge="35% kcal"
                  icon={<Zap className="w-3.5 h-3.5 text-emerald-600" />}
                />
                <MetricCard
                  label="Carbs"
                  value={carbs}
                  target={260}
                  unit="g"
                  accentColor="blue"
                  ratioBadge="45% kcal"
                  icon={<Flame className="w-3.5 h-3.5 text-blue-600" />}
                />
                <MetricCard
                  label="Fats"
                  value={fat}
                  target={70}
                  unit="g"
                  accentColor="purple"
                  ratioBadge="20% kcal"
                  icon={<Activity className="w-3.5 h-3.5 text-purple-600" />}
                />
              </FlexibleGrid>

              <FluidProgress value={extremeNumbers ? 999 : 78} height="md" color="emerald" showLabel labelPosition="top" subText="Overall Daily Progress" />
            </FlexibleStack>
          </ResponsiveCard>

          {/* Card 2: Food Meal Item under Stress */}
          <ResponsiveCard variant="default" padding="normal" radius="3xl">
            <FlexibleStack gap="sm">
              <FlexibleRow justify="between" align="start" gap="xs">
                <FlexibleRow justify="start" align="start" gap="xs" className="flex-1 min-w-0">
                  <ResponsiveIconContainer size="md" variant="amber">
                    <span>🍗</span>
                  </ResponsiveIconContainer>

                  <FlexibleStack gap="xs" className="flex-1 min-w-0">
                    <AdaptiveHeading level={4} className="break-words">
                      {foodTitle}
                    </AdaptiveHeading>

                    <FlexibleRow justify="start" align="center" gap="xs" className="text-xs font-mono">
                      <AdaptiveNumber value={calories} unit="kcal" color="emerald" size="sm" />
                      <span>P: <strong className="text-emerald-700">{protein}g</strong></span>
                      <span>C: <strong className="text-blue-700">{carbs}g</strong></span>
                      <span>F: <strong className="text-purple-700">{fat}g</strong></span>
                    </FlexibleRow>
                  </FlexibleStack>
                </FlexibleRow>

                <SmartButton variant="emerald" size="sm">
                  Logged
                </SmartButton>
              </FlexibleRow>

              {/* Badge Explosion Simulation */}
              {badgeExplosion && (
                <FlexibleRow justify="start" align="center" gap="xs" className="flex-wrap pt-2 border-t border-slate-100">
                  <AdaptiveBadge variant="emerald">High Protein</AdaptiveBadge>
                  <AdaptiveBadge variant="amber">Keto Friendly</AdaptiveBadge>
                  <AdaptiveBadge variant="blue">Low Glycemic</AdaptiveBadge>
                  <AdaptiveBadge variant="purple">Anabolic Hypertrophy</AdaptiveBadge>
                  <AdaptiveBadge variant="rose">Pre-Workout Fuel</AdaptiveBadge>
                  <AdaptiveBadge variant="gold">Verified Verified Verified</AdaptiveBadge>
                  <AdaptiveBadge variant="cyan">Electrolyte Dense</AdaptiveBadge>
                  <AdaptiveBadge variant="dark">Zero Trans Fats</AdaptiveBadge>
                </FlexibleRow>
              )}

              {/* AI Generated Paragraphs Simulation */}
              {aiParagraphs && (
                <ResponsiveCard variant="subtle" padding="compact" radius="2xl" className="border-cyan-200 bg-cyan-50/50 mt-2">
                  <FlexibleStack gap="xs">
                    <AdaptiveHeading level={4} className="text-cyan-900 text-xs flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-cyan-600" /> AI Nutrition Intelligence Advice
                    </AdaptiveHeading>
                    <AdaptiveText size="xs" variant="secondary">
                      This meal provides optimal muscle protein synthesis triggering leucine concentrations. The ratio of complex carbohydrates to unsaturated fats ensures sustained glycogen replenishment over a 4-hour workout recovery window without insulin spikes.
                    </AdaptiveText>
                    <AdaptiveText size="xs" variant="muted">
                      Micronutrient density: High bioavailability in zinc, magnesium, and dietary iron. Recommended hydration pairing: 500ml sodium-electrolyte water.
                    </AdaptiveText>
                  </FlexibleStack>
                </ResponsiveCard>
              )}
            </FlexibleStack>
          </ResponsiveCard>
        </div>
      </FlexibleStack>
    </LayoutBoundary>
  );
};
