"use client";

import React from "react";
import { RecoverySanctuary } from "@/components/recovery/RecoverySanctuary";
import { AuthGuard } from "@/components/AuthGuard";

export default function RecoveryPage() {
  return (
    <AuthGuard>
      <div className="flex flex-col gap-6 pb-28 animate-smooth-reveal">
        <RecoverySanctuary />
      </div>
    </AuthGuard>
  );
}
