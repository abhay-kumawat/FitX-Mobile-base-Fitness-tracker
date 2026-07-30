"use client";

import React, { useState } from "react";
import { Smartphone, Monitor, Wifi, Battery, Signal, Sparkles } from "lucide-react";

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  const [isFrameMode, setIsFrameMode] = useState(true);
  const [frameWidth, setFrameWidth] = useState<"standard" | "compact">("standard");

  const widthClass = frameWidth === "standard" ? "max-w-[412px]" : "max-w-[360px]";

  return (
    <div className="min-h-screen bg-[#0F172A] text-[var(--text-primary)] flex flex-col items-center justify-start relative font-sans transition-colors duration-300 selection:bg-emerald-500 selection:text-white">
      {/* Background Decorative Mesh & Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/30 via-slate-900 to-slate-950 z-0" />

      {/* Top Desktop Frame Control Switcher */}
      <div className="w-full bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between z-50 text-xs shadow-md shrink-0">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-xs" />
          <span className="font-black tracking-wider text-white uppercase text-[11px] flex items-center gap-1.5">
            FitX AI Mobile Web App <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </span>
          <span className="hidden sm:inline-block text-[10px] text-slate-400 font-extrabold font-mono border-l border-slate-700 pl-2">
            Dedicated Mobile Frame Mode
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => {
              setIsFrameMode(true);
              setFrameWidth("standard");
            }}
            className={`px-2.5 py-1 rounded-xl font-extrabold text-[10px] flex items-center space-x-1 transition-all active:scale-95 border ${
              isFrameMode && frameWidth === "standard"
                ? "bg-emerald-500 text-white border-emerald-400 shadow-xs"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>390px iPhone</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setIsFrameMode(true);
              setFrameWidth("compact");
            }}
            className={`px-2.5 py-1 rounded-xl font-extrabold text-[10px] flex items-center space-x-1 transition-all active:scale-95 border ${
              isFrameMode && frameWidth === "compact"
                ? "bg-emerald-500 text-white border-emerald-400 shadow-xs"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>360px Compact</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFrameMode(false)}
            className={`px-2.5 py-1 rounded-xl font-extrabold text-[10px] flex items-center space-x-1 transition-all active:scale-95 border ${
              !isFrameMode
                ? "bg-emerald-500 text-white border-emerald-400 shadow-xs"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Fluid View</span>
          </button>
        </div>
      </div>

      {/* Outer Phone Wrapper (With Side Buttons & Shadow on Desktop) */}
      <div className={`w-full relative flex items-center justify-center ${isFrameMode ? "py-4 sm:py-8 px-2 sm:px-0 z-10" : "z-10"}`}>
        {isFrameMode && (
          <>
            {/* Left Side Physical Buttons Mockup (Volume Up & Down) */}
            <div className="hidden sm:block absolute -left-3 top-28 w-1.5 h-10 bg-slate-700 rounded-l-md border-r border-slate-800 shadow-md" />
            <div className="hidden sm:block absolute -left-3 top-42 w-1.5 h-10 bg-slate-700 rounded-l-md border-r border-slate-800 shadow-md" />
            {/* Right Side Physical Button Mockup (Power Button) */}
            <div className="hidden sm:block absolute -right-3 top-32 w-1.5 h-14 bg-slate-700 rounded-r-md border-l border-slate-800 shadow-md" />
          </>
        )}

        {/* Main Phone Device Viewport Box */}
        <div
          className={`w-full flex flex-col transition-all duration-300 ${
            isFrameMode
              ? `${widthClass} my-0 sm:my-2 rounded-[32px] sm:rounded-[48px] border-4 sm:border-[10px] border-slate-900 bg-[var(--bg-main)] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] relative h-[100dvh] sm:h-[850px] overflow-hidden [transform:translateZ(0)]`
              : "max-w-md mx-auto h-[100dvh] bg-[var(--bg-main)] relative overflow-hidden [transform:translateZ(0)] flex flex-col"
          }`}
        >
          {/* iOS Dynamic Status Bar (Visible in Frame Mode) */}
          {isFrameMode && (
            <div className="z-50 bg-[var(--status-bar-bg)] backdrop-blur-xl px-4 pt-2.5 pb-2 flex items-center justify-between text-xs select-none border-b border-[var(--status-bar-border)] text-[var(--status-bar-text)] shrink-0">
              <span className="font-black font-mono text-[12px] tracking-tight">9:41</span>

              {/* Dynamic Island Notch */}
              <div className="w-24 h-4.5 bg-slate-950 rounded-full flex items-center justify-between px-2 shadow-inner">
                <div className="w-2 h-2 rounded-full bg-slate-800" />
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                </div>
              </div>

              {/* Right Status Icons */}
              <div className="flex items-center space-x-1.5 opacity-90">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4 fill-current" />
              </div>
            </div>
          )}

          {/* Viewport Content Container - Scrollable */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 w-full flex flex-col bg-[var(--bg-main)]">
            <div className="px-3.5 sm:px-4 pb-24 flex flex-col w-full h-full">
              {children}
            </div>
          </div>

          {/* Bottom iOS Home Bar Indicator */}
          {isFrameMode && (
            <div className="z-50 pt-3 pb-2 flex justify-center pointer-events-none shrink-0" style={{ background: "var(--home-bar-bg)" }}>
              <div className="w-32 h-1 rounded-full shadow-xs" style={{ backgroundColor: "var(--home-bar-pill)" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

