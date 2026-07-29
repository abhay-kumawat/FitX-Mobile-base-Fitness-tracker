"use client";

import React, { useState, useEffect } from "react";

interface Star {
  id: number;
  top: string;
  left: string;
  size: number;
  duration: string;
  delay: string;
  color: string;
}

export default function StarBackground() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      top: `${Math.floor(Math.random() * 100)}%`,
      left: `${Math.floor(Math.random() * 100)}%`,
      size: Math.random() * 2 + 1,
      duration: `${Math.random() * 3 + 3}s`,
      delay: `${Math.random() * 2}s`,
      color: i % 4 === 0 ? "#F3B744" : i % 5 === 0 ? "#A78BFA" : i % 7 === 0 ? "#34D399" : "#F8FAFC",
    }));
    setStars(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            boxShadow: star.color !== "#F8FAFC" ? `0 0 6px ${star.color}` : "none",
            animationDuration: star.duration,
            animationDelay: star.delay,
          }}
        />
      ))}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[radial-gradient(ellipse_at_center,rgba(243,183,68,0.06)_0%,rgba(167,139,250,0.03)_40%,transparent_75%)] pointer-events-none" />
    </div>
  );
}

