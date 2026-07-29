"use client";

import React from "react";
import { RecoverySanctuary } from "@/components/recovery/RecoverySanctuary";

export default function RecoveryPage() {
  return (
    <div className="flex flex-col gap-6 pb-28 animate-smooth-reveal">
      <RecoverySanctuary />
    </div>
  );
}
