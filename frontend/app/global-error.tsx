"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#060911] text-slate-100 min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full p-6 rounded-3xl bg-[#0F172A] border-2 border-rose-500/40 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
            ⚠️
          </div>
          <h2 className="text-base font-extrabold text-white">Application Global Error</h2>
          <p className="text-xs text-slate-400 font-mono">
            {error?.message || "Critical layout rendering failure."}
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-2xl bg-cyan-400 text-black font-extrabold text-xs"
          >
            Reload Application State
          </button>
        </div>
      </body>
    </html>
  );
}
