import React, { useState } from "react";
import { Play, Pause, FastForward, Activity, Flame, Moon, Coffee, HeartPulse } from "lucide-react";

interface TimelineEvent {
  id: string;
  time: string;
  type: "workout" | "meal" | "sleep" | "measurement" | "mood";
  title: string;
  details: string;
}

interface ReplayMyDayProps {
  events: TimelineEvent[];
  date: string;
}

export function ReplayMyDay({ events, date }: ReplayMyDayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // In a real app, this would use a setInterval to animate through the events
  
  const getIcon = (type: string) => {
    switch (type) {
      case "workout": return <Activity className="w-5 h-5 text-emerald-500" />;
      case "meal": return <Flame className="w-5 h-5 text-orange-500" />;
      case "sleep": return <Moon className="w-5 h-5 text-indigo-500" />;
      case "mood": return <HeartPulse className="w-5 h-5 text-rose-500" />;
      default: return <Coffee className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
        <Play className="w-32 h-32" />
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black tracking-tight text-white">Replay My Day</h2>
            <p className="text-xs font-medium text-slate-400">{date}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-500 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
              <FastForward className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
          {events.length === 0 ? (
            <div className="text-sm text-slate-500 font-medium text-center mt-10">No events recorded on this day.</div>
          ) : (
            events.map((evt, idx) => (
              <div 
                key={evt.id} 
                className={`flex gap-4 transition-all duration-500 ${idx === currentIndex ? "opacity-100 scale-100" : "opacity-40 scale-95"}`}
                onClick={() => setCurrentIndex(idx)}
              >
                <div className="flex flex-col items-center">
                  <div className="text-xs font-bold text-slate-400 mb-2">{evt.time}</div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${idx === currentIndex ? "bg-slate-800 border-2 border-slate-600" : "bg-slate-800/50"}`}>
                    {getIcon(evt.type)}
                  </div>
                  {idx < events.length - 1 && <div className="w-0.5 h-full bg-slate-800 mt-2 min-h-[30px]" />}
                </div>
                <div className="pt-7 pb-4">
                  <h4 className="text-sm font-bold text-slate-200">{evt.title}</h4>
                  <p className="text-xs font-medium text-slate-500 mt-1">{evt.details}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
