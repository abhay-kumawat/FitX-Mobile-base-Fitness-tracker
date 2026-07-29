import React from "react";
import { UIStressTestPlayground } from "@/components/dev/UIStressTestPlayground";

export const metadata = {
  title: "FitX Adaptive Layout Stress Test",
  description: "Developer playground for testing layout resilience and adaptive primitives.",
};

export default function StressTestPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-main)] py-6 sm:py-10">
      <UIStressTestPlayground />
    </main>
  );
}
