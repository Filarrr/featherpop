"use client";

import { FEATHER_META } from "@/lib/levels";
import type { FeatherType } from "@/lib/missions";
import { CountUp } from "./CountUp";

export function FeatherAward({
  feather,
  featherPop,
  show,
}: {
  feather: FeatherType;
  featherPop: number;
  show: boolean;
}) {
  const meta = FEATHER_META[feather];
  if (!show) return null;

  return (
    <div
      className="feather-award"
      style={{
        ["--feather-color" as string]: meta.color,
        ["--feather-glow" as string]: meta.glow,
      }}
    >
      <div className="feather-award-rings" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <svg viewBox="0 0 64 96" className="feather-award-glyph" aria-hidden>
        <defs>
          <linearGradient id="award-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity={0.95} />
            <stop offset="1" stopColor={meta.color} stopOpacity={1} />
          </linearGradient>
        </defs>
        <path
          d="M32 4 C 48 18, 56 38, 50 64 C 47 78, 39 88, 32 92 C 25 88, 17 78, 14 64 C 8 38, 16 18, 32 4 Z"
          fill="url(#award-grad)"
          stroke={meta.color}
          strokeWidth="1.5"
        />
        <path
          d="M32 14 L 32 86"
          stroke="#ffffff"
          strokeOpacity={0.75}
          strokeWidth={1.5}
        />
        {[18, 30, 42, 56, 70].map((y) => (
          <g key={y}>
            <path
              d={`M32 ${y} Q 22 ${y + 2} 16 ${y + 6}`}
              stroke="#ffffff"
              strokeOpacity={0.5}
              strokeWidth={1}
              fill="none"
            />
            <path
              d={`M32 ${y} Q 42 ${y + 2} 48 ${y + 6}`}
              stroke="#ffffff"
              strokeOpacity={0.5}
              strokeWidth={1}
              fill="none"
            />
          </g>
        ))}
      </svg>
      <p className="feather-award-name">{meta.name}</p>
      <p className="feather-award-pop">
        <CountUp to={featherPop} prefix="+" duration={700} />{" "}
        <span>FeatherPop</span>
      </p>
    </div>
  );
}
