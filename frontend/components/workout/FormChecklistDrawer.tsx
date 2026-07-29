"use client";

import React, { useState } from "react";
import { ChevronDown, ShieldCheck, AlertTriangle, Settings, CheckCircle2 } from "lucide-react";

interface FormChecklistDrawerProps {
  exerciseName: string;
  setupInfo?: string;
  formCues: string[];
  commonMistakes: string[];
}

export const FormChecklistDrawer: React.FC<FormChecklistDrawerProps> = ({
  exerciseName,
  setupInfo = "Set bench angle to 30°-45°. Pin load weight firmly.",
  formCues,
  commonMistakes,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-slate-300 hover:text-white transition-colors"
      >
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-fitx-cyan" />
          <span>Form Guidance & Equipment Setup Pill</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-fitx-cyan" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-3.5 pt-0 space-y-3 text-xs border-t border-white/5 bg-black/20">
          {/* Equipment Setup Helper Pill */}
          <div className="p-2.5 rounded-xl bg-fitx-cyan/10 border border-fitx-cyan/20 flex items-start space-x-2 text-[11px]">
            <Settings className="w-3.5 h-3.5 text-fitx-cyan shrink-0 mt-0.5" />
            <div>
              <strong className="text-fitx-cyan block font-semibold mb-0.5">Equipment Setup:</strong>
              <span className="text-slate-300">{setupInfo}</span>
            </div>
          </div>

          {/* Form Cues Checklist */}
          <div>
            <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-fitx-emerald flex items-center mb-1.5">
              <CheckCircle2 className="w-3 h-3 mr-1 text-fitx-emerald" /> Core Form Cues
            </h5>
            <ul className="space-y-1 pl-1">
              {formCues.map((cue, idx) => (
                <li key={idx} className="flex items-center space-x-2 text-[11px] text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-fitx-emerald shrink-0" />
                  <span>{cue}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Common Mistakes */}
          <div>
            <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-fitx-solar flex items-center mb-1.5">
              <AlertTriangle className="w-3 h-3 mr-1 text-fitx-solar" /> Avoid Mistakes
            </h5>
            <ul className="space-y-1 pl-1">
              {commonMistakes.map((mistake, idx) => (
                <li key={idx} className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-fitx-solar shrink-0" />
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
