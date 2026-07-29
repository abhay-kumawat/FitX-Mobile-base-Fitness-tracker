"use client";

import React, { useState, useEffect } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  vx: number;
  vy: number;
  shape: "circle" | "star" | "square";
}

interface ConfettiBurstProps {
  trigger: boolean;
  onComplete?: () => void;
}

export default function ConfettiBurst({ trigger, onComplete }: ConfettiBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const colors = ["#F5A623", "#28CB75", "#2BBCE0", "#A38ED4", "#FB7185", "#FDE68A"];
    const shapes: ("circle" | "star" | "square")[] = ["circle", "star", "square"];

    const newParticles: Particle[] = Array.from({ length: 24 }).map((_, i) => {
      const angle = (i / 24) * 360 + Math.random() * 15;
      const speed = 3 + Math.random() * 6;
      const rad = (angle * Math.PI) / 180;
      return {
        id: i,
        x: 0,
        y: 0,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vx: Math.cos(rad) * speed,
        vy: Math.sin(rad) * speed - 2, // Slight initial upward arc
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      };
    });

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      if (onComplete) onComplete();
    }, 1200);

    return () => clearTimeout(timer);
  }, [trigger, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-visible">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-cartoon-pop transition-all duration-1000 ease-out"
          style={{
            transform: `translate(${p.vx * 18}px, ${p.vy * 18}px) rotate(${p.rotation + 180}deg)`,
            opacity: 0,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.shape !== "star" ? p.color : "transparent",
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "square" ? "3px" : "0",
          }}
        >
          {p.shape === "star" && (
            <svg viewBox="0 0 24 24" fill={p.color} className="w-full h-full">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
