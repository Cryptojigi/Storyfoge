"use client";

import { useEffect, useState } from "react";

interface Bubble {
  id: number;
  size: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  opacity: number;
}

export default function FloatingBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    // Generate 25 random bubbles on mount
    const newBubbles: Bubble[] = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      size: Math.random() * 6 + 4, // 4px to 10px
      left: Math.random() * 100, // 0% to 100%
      animationDuration: Math.random() * 10 + 10, // 10s to 20s
      animationDelay: Math.random() * 5, // 0s to 5s
      opacity: Math.random() * 0.5 + 0.3, // 0.3 to 0.8
    }));
    setBubbles(newBubbles);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute bottom-[-20px] rounded-full bg-[#e8842c] shadow-[0_0_8px_rgba(232,132,44,0.8)]"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            opacity: bubble.opacity,
            animation: `float-up ${bubble.animationDuration}s linear ${bubble.animationDelay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
