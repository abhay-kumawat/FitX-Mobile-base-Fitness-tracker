import React from 'react';
import { Check, X, ShieldAlert, Sparkles, RefreshCcw } from 'lucide-react';
import { soundscape } from '@/lib/soundscapeEngine';

interface DiffData {
  added: { name: string; rationale: string }[];
  removed: { name: string; rationale: string }[];
  modified: { name: string; changes: string[]; rationale: string }[];
}

interface AIPlanReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  diffData: DiffData | null;
  onApprove: () => void;
  onReject: () => void;
}

export function AIPlanReviewModal({ isOpen, onClose, diffData, onApprove, onReject }: AIPlanReviewModalProps) {
  if (!isOpen || !diffData) return null;

  const handleApprove = () => {
    soundscape.playSuccessSound();
    onApprove();
    onClose();
  };

  const handleReject = () => {
    soundscape.playTapSound();
    onReject();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center bg-slate-900/40 backdrop-blur-sm sm:px-4 pb-0 sm:pb-safe">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up sm:animate-in sm:zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-black text-lg leading-tight">AI Coach Proposed Changes</h2>
              <p className="text-emerald-100 text-xs font-medium">Review the modified workout plan</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white bg-black/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diff Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50">
          
          {/* Added */}
          {diffData.added && diffData.added.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Added Exercises
              </h3>
              {diffData.added.map((item, idx) => (
                <div key={idx} className="bg-white border border-emerald-100 rounded-xl p-3 shadow-sm">
                  <div className="font-bold text-slate-800 text-sm mb-1">{item.name}</div>
                  <div className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-md inline-block">
                    Why: {item.rationale}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Removed */}
          {diffData.removed && diffData.removed.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                Removed Exercises
              </h3>
              {diffData.removed.map((item, idx) => (
                <div key={idx} className="bg-white border border-rose-100 rounded-xl p-3 shadow-sm opacity-75 line-through decoration-rose-500/30">
                  <div className="font-bold text-slate-800 text-sm mb-1">{item.name}</div>
                  <div className="text-xs text-rose-600 font-medium bg-rose-50 px-2 py-1 rounded-md inline-block no-underline">
                    Why: {item.rationale}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modified */}
          {diffData.modified && diffData.modified.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                Modified Parameters
              </h3>
              {diffData.modified.map((item, idx) => (
                <div key={idx} className="bg-white border border-amber-100 rounded-xl p-3 shadow-sm">
                  <div className="font-bold text-slate-800 text-sm mb-1">{item.name}</div>
                  <ul className="text-xs text-slate-600 list-disc list-inside mb-2">
                    {item.changes.map((change, cIdx) => <li key={cIdx}>{change}</li>)}
                  </ul>
                  <div className="text-xs text-amber-700 font-medium bg-amber-50 px-2 py-1 rounded-md inline-block">
                    Why: {item.rationale}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0 grid grid-cols-2 gap-3 pb-safe">
          <button 
            onClick={handleReject}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
            Reject All
          </button>
          <button 
            onClick={handleApprove}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white bg-slate-900 shadow-md shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            Approve & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
