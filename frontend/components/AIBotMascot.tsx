"use client";

import React, { useState } from "react";
import { Sparkles, Flame, Zap, Heart, Trophy, Crown, Smile } from "lucide-react";
import ConfettiBurst from "./ConfettiBurst";

export type MascotMood = "happy" | "hyped" | "cheering" | "caring" | "proud" | "resting";

interface AIBotMascotProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showBubble?: boolean;
  mood?: MascotMood;
  level?: number;
  costume?: "none" | "sweatband" | "crown" | "cape";
  onTap?: () => void;
}

export default function AIBotMascot({
  message = "Good morning! Duo Flexy says: You're 100% charged and ready to conquer Today's Mission! 🚀",
  size = "md",
  showBubble = true,
  mood = "happy",
  level = 5,
  costume = "sweatband",
  onTap,
}: AIBotMascotProps) {
  const [currentMood, setCurrentMood] = useState<MascotMood>(mood);
  const [isTriggered, setIsTriggered] = useState(false);

  const moodQuotes: Record<MascotMood, string> = {
    happy: "Ready for your daily streak? Let's crush today's exercise! 🦉⚡",
    hyped: "MAX POWER ACTIVE! 100% Muscle Priming Ready! ⚡",
    cheering: "WOOHOO! You completely crushed that set! +50 XP! 🙌",
    caring: "Listen to your body today. Rest is where the muscle grows! 💖",
    proud: "Look at that 12-day streak! You're an absolute legend! 👑",
    resting: "Deep breaths... Rest your muscles & drink some water! 🧘‍♂️",
  };

  const handleMascotTap = () => {
    setIsTriggered(true);
    const moods: MascotMood[] = ["happy", "hyped", "cheering", "proud", "caring"];
    const nextMood = moods[(moods.indexOf(currentMood) + 1) % moods.length];
    setCurrentMood(nextMood);
    if (onTap) onTap();
  };

  const dimensions = {
    sm: { width: 58, height: 58 },
    md: { width: 88, height: 88 },
    lg: { width: 120, height: 120 },
    xl: { width: 154, height: 154 },
  }[size];

  return (
    <div className="flex items-center space-x-3.5 relative select-none">
      <ConfettiBurst trigger={isTriggered} onComplete={() => setIsTriggered(false)} />

      {/* Tap-to-Interact Flexy Mascot Body */}
      <div 
        onClick={handleMascotTap}
        className="relative animate-mascot-bounce shrink-0 cursor-pointer group"
        title="Tap Duo Flexy for motivation boost!"
      >
        {/* Duolingo Vibrant Aura Glow */}
        <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-[#58CC02] via-[#FFC800] to-[#1CB0F6] opacity-40 blur-xl animate-mascot-halo group-hover:opacity-75 transition-opacity" />

        {/* Level Badge Pill */}
        <div className="absolute -top-2 -right-1 z-20 bg-[#FFC800] border-b-2 border-[#E5B200] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center space-x-0.5">
          <Crown className="w-3 h-3 fill-slate-950" />
          <span>Lvl {level}</span>
        </div>
        
        {/* Expressive Vector SVG Graphic for Duo Flexy */}
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-[0_10px_20px_rgba(88,204,2,0.4)] transition-transform duration-200 group-hover:scale-110 active:scale-95"
        >
          {/* Rotating Outer Halo Ring */}
          <circle 
            cx="60" 
            cy="60" 
            r="54" 
            stroke="#58CC02" 
            strokeWidth="3" 
            strokeDasharray="10 6" 
            className="animate-spin" 
            style={{ animationDuration: '12s' }}
            opacity="0.8" 
          />

          {/* Superhero Cape */}
          {(costume === "cape" || currentMood === "proud") && (
            <path d="M25 55 Q10 85 20 105 Q60 115 100 105 Q110 85 95 55 Z" fill="#FF9600" opacity="0.95" />
          )}

          {/* Duolingo Headphones (Left & Right Earcups) */}
          <rect x="10" y="44" width="14" height="26" rx="7" fill="#58CC02" stroke="#8EE000" strokeWidth="2.5" />
          <rect x="96" y="44" width="14" height="26" rx="7" fill="#58CC02" stroke="#8EE000" strokeWidth="2.5" />
          <path d="M17 46 C 17 16, 103 16, 103 46" stroke="#58CC02" strokeWidth="5" strokeLinecap="round" fill="none" />

          {/* Robot Head Capsule Body */}
          <rect x="20" y="26" width="80" height="68" rx="34" fill="url(#duoFlexyBotGrad)" stroke="#8EE000" strokeWidth="3.5" />

          {/* Athlete Sweatband */}
          {costume === "sweatband" && (
            <g>
              <rect x="20" y="32" width="80" height="12" rx="4" fill="#FF9600" />
              <circle cx="60" cy="38" r="3.5" fill="#FFF" />
            </g>
          )}

          {/* Golden Crown */}
          {costume === "crown" && (
            <path d="M45 26 L52 14 L60 22 L68 14 L75 26 Z" fill="#FFC800" stroke="#FFE875" strokeWidth="2" />
          )}

          {/* Dark Glass Visor Screen */}
          <rect x="28" y="42" width="64" height="36" rx="18" fill="#131F24" stroke="rgba(88, 204, 2, 0.7)" strokeWidth="2" />

          {/* Expressive Glowing Eyes */}
          {currentMood === "hyped" || currentMood === "cheering" ? (
            <>
              {/* Star Eyes */}
              <polygon points="46,49 48,55 54,55 49,59 51,65 46,61 41,65 43,59 38,55 44,55" fill="#FFC800" />
              <polygon points="74,49 76,55 82,55 77,59 79,65 74,61 69,65 71,59 66,55 72,55" fill="#FFC800" />
            </>
          ) : currentMood === "caring" || currentMood === "resting" ? (
            <>
              {/* Curved Happy Eyes */}
              <path d="M40 59 Q46 51 52 59" stroke="#58CC02" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M68 59 Q74 51 80 59" stroke="#58CC02" strokeWidth="4" strokeLinecap="round" fill="none" />
            </>
          ) : currentMood === "proud" ? (
            <>
              {/* Heart Eyes */}
              <path d="M41 54 C41 51 44 49 46 51 C48 49 51 51 51 54 C51 58 46 62 46 62 C46 62 41 58 41 54 Z" fill="#FF4B4B" />
              <path d="M69 54 C69 51 72 49 74 51 C76 49 79 51 79 54 C79 58 74 62 74 62 C74 62 69 58 69 54 Z" fill="#FF4B4B" />
            </>
          ) : (
            <>
              {/* Glowing Feather Green Eyes */}
              <circle cx="46" cy="59" r="6.5" fill="#58CC02">
                <animate attributeName="r" values="6.5;7.5;6.5" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="74" cy="59" r="6.5" fill="#58CC02">
                <animate attributeName="r" values="6.5;7.5;6.5" dur="2.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="48" cy="57" r="2.5" fill="#FFFFFF" />
              <circle cx="76" cy="57" r="2.5" fill="#FFFFFF" />
            </>
          )}

          {/* Cute Smile Mouth */}
          <path d="M50 68 Q60 75 70 68" stroke="#8EE000" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Chest Power Core */}
          <circle cx="60" cy="102" r="9.5" fill="url(#duoFlexyCoreGrad)" stroke="#8EE000" strokeWidth="2" />
          <path d="M60 97 L57 103 L60 102 L59 107 L63 101 L60 102 Z" fill="#131F24" />

          {/* SVG Gradients */}
          <defs>
            <linearGradient id="duoFlexyBotGrad" x1="20" y1="26" x2="100" y2="94" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1B2A32" />
              <stop offset="0.6" stopColor="#131F24" />
              <stop offset="1" stopColor="#2E5A0A" />
            </linearGradient>
            <linearGradient id="duoFlexyCoreGrad" x1="51" y1="93" x2="69" y2="111" gradientUnits="userSpaceOnUse">
              <stop stopColor="#58CC02" />
              <stop offset="1" stopColor="#46A302" />
            </linearGradient>
          </defs>
        </svg>

        {/* Mascot Tap Pill */}
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#58CC02] border-b-2 border-[#46A302] text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg animate-bounce">
          Tap Duo!
        </span>
      </div>

      {/* Interactive Speech Bubble */}
      {showBubble && (
        <div className="relative duo-card p-4 bg-[#1B2A32]/95 border-2 border-[#58CC02]/40 max-w-xs shadow-2xl rounded-3xl animate-smooth-reveal">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-[#FFC800] animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#58CC02]">
                Duo AI Coach
              </span>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black bg-[#58CC02]/20 text-[#58CC02] border border-[#58CC02]/40">
              {currentMood === "hyped" ? (
                <Zap className="w-3 h-3 mr-1 text-[#FFC800]" />
              ) : currentMood === "caring" || currentMood === "resting" ? (
                <Heart className="w-3 h-3 mr-1 text-[#FF4B4B]" />
              ) : currentMood === "proud" ? (
                <Trophy className="w-3 h-3 mr-1 text-[#FF9600]" />
              ) : (
                <Flame className="w-3 h-3 mr-1 text-[#FF9600]" />
              )}
              {currentMood}
            </span>
          </div>

          <p className="text-xs text-slate-100 leading-relaxed font-bold">
            {isTriggered ? moodQuotes[currentMood] : message}
          </p>
        </div>
      )}
    </div>
  );
}
