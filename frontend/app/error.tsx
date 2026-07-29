"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("FitX Application Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-3xl bg-rose-500/20 border-2 border-rose-500/40 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/20 animate-cartoon-bounce">
        <AlertCircle className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h2 className="text-lg font-extrabold text-white">Something went wrong!</h2>
        <p className="text-xs text-slate-400 font-mono max-w-xs mx-auto">
          {error?.message || "An unexpected application error occurred."}
        </p>
      </div>

      <div className="flex space-x-3 pt-2">
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-2xl zen-cyan-btn text-xs font-extrabold flex items-center touch-target active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Try Again
        </button>

        <a
          href="/"
          className="px-4 py-2 rounded-2xl bg-white/10 border border-white/15 text-xs text-white font-extrabold flex items-center touch-target hover:bg-white/20 transition-all active:scale-95"
        >
          <Home className="w-3.5 h-3.5 mr-1.5" /> Home
        </a>
      </div>
    </div>
  );
}
