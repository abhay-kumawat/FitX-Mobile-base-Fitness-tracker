"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { GoogleAuthModal } from "./GoogleAuthModal";
import { soundscape } from "@/lib/soundscapeEngine";
import { Lock, ShieldCheck, KeyRound, ArrowRight, UserPlus } from "lucide-react";
import Link from "next/link";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is authenticated, grant full access
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // If user is NOT authenticated, show Auth Required Gateway Card
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 animate-smooth-reveal">
      <GoogleAuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-xl text-center space-y-5">
        <div className="w-14 h-14 rounded-3xl bg-slate-900 border border-slate-800 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-slate-900/10">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
            Sign In Required
          </span>
          <h2 className="text-lg font-black text-slate-900">
            Authentication Required
          </h2>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Please sign in or create an account to access your fitness app features.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              soundscape.playTapSound();
              setAuthModalOpen(true);
            }}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <svg className="w-4 h-4 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
            </svg>
            <span>Sign In / Sign Up with Google</span>
          </button>

          <Link
            href="/"
            onClick={() => soundscape.playTapSound()}
            className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center space-x-1 transition-all"
          >
            <span>Back to Landing Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
