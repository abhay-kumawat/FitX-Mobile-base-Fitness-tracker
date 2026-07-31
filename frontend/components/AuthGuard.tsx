"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext, isProfileComplete } from "@/context/AuthContext";
import { AuthFlowContainer } from "@/components/auth/AuthFlowContainer";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, userProfile, loading, isAuthenticated } = useAuthContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500">Authenticating FitX Session...</span>
      </div>
    );
  }

  // Rule 1: Not Authenticated -> Show Welcome / Auth Flow
  if (!isAuthenticated && !userProfile && !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-2 sm:p-4 animate-smooth-reveal">
        <AuthFlowContainer initialScreen="welcome" />
      </div>
    );
  }

  // Rule 2: Unverified Email (only for Firebase Email/Password accounts) -> Show Email Verification Screen
  if (user && user.providerData[0]?.providerId === "password" && !user.emailVerified) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-2 sm:p-4 animate-smooth-reveal">
        <AuthFlowContainer initialScreen="verification" />
      </div>
    );
  }

  // Rule 3: Incomplete Profile -> Show Complete Profile Onboarding Wizard
  if (!isProfileComplete(userProfile)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-2 sm:p-4 animate-smooth-reveal">
        <AuthFlowContainer initialScreen="complete_profile" />
      </div>
    );
  }

  // Rule 4: Fully Authenticated -> Grant Access to App Pages
  return <>{children}</>;
}
