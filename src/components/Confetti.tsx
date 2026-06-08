"use client";

import { useEffect, useState } from "react";

const COLORS = ["#ffd14a", "#ff2d8e", "#b13bff", "#7cd1ff", "#34e3a4", "#ffb24a"];

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  rotate: number;
  color: string;
  size: number;
  drift: number;
  shape: "rect" | "circle" | "feather";
}

export function Confetti({
  trigger,
  pieces = 80,
}: {
  trigger: number;
  pieces?: number;
}) {
  const [bursts, setBursts] = useState<{ id: number; items: Piece[] }[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const items: Piece[] = Array.from({ length: pieces }, (_, i) => {
      const seed = id + i;
      const rand = (offset: number) =>
        Math.abs(Math.sin(seed * 9301 + offset * 49297) * 233280) % 1;
      return {
        id: i,
        left: rand(1) * 100,
        delay: rand(2) * 0.4,
        duration: 1.4 + rand(3) * 1.8,
        rotate: rand(4) * 720 - 360,
        color: COLORS[Math.floor(rand(5) * COLORS.length)],
        size: 6 + rand(6) * 10,
        drift: rand(7) * 80 - 40,
        shape: rand(8) < 0.33 ? "rect" : rand(8) < 0.66 ? "circle" : "feather",
      };
    });
    setBursts((b) => [...b, { id, items }]);
    const cleanup = window.setTimeout(() => {
      setBursts((b) => b.filter((x) => x.id !== id));
    }, 3500);
    return () => window.clearTimeout(cleanup);
  }, [trigger, pieces]);

  if (bursts.length === 0) return null;

  return (
    <div className="confetti-overlay" aria-hidden>
      {bursts.map((burst) => (
        <div key={burst.id} className="confetti-burst">
          {burst.items.map((p) => (
            <span
              key={p.id}
              className={`confetti-piece is-${p.shape}`}
              style={{
                left: `${p.left}%`,
                width: p.size,
                height: p.shape === "feather" ? p.size * 1.6 : p.size,
                background:
                  p.shape === "feather" ? "transparent" : p.color,
                color: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                ["--rot" as string]: `${p.rotate}deg`,
                ["--drift" as string]: `${p.drift}px`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
