"use client";

import { useState } from "react";
import { FEATHER_META } from "@/lib/levels";
import type { FeatherType } from "@/lib/missions";

/**
 * Renders a single feather. Prefers the PNG at
 * /public/media/sort/feather-<type>.png when available; falls back to an
 * inline SVG glyph if the PNG fails to load (e.g. during early dev before
 * assets are dropped in).
 */
export function FeatherSvg({
  type,
  size = 96,
}: {
  type: FeatherType;
  size?: number;
}) {
  const meta = FEATHER_META[type];
  const [fallback, setFallback] = useState(false);

  if (!fallback) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/media/sort/feather-${type}.png`}
        alt=""
        width={size}
        height={size * 1.4}
        style={{
          width: size,
          height: "auto",
          objectFit: "contain",
          filter: `drop-shadow(0 6px 14px ${meta.glow})`,
          pointerEvents: "none",
        }}
        draggable={false}
        onError={() => setFallback(true)}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 64 96"
      width={size}
      height={size * 1.5}
      style={{
        filter: `drop-shadow(0 6px 18px ${meta.glow})`,
        pointerEvents: "none",
      }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`fg-sort-${type}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.9} />
          <stop offset="0.4" stopColor={meta.color} stopOpacity={0.95} />
          <stop offset="1" stopColor={meta.color} stopOpacity={1} />
        </linearGradient>
      </defs>
      <path
        d="M32 3 C 50 17, 58 38, 51 64 C 48 79, 39 89, 32 93 C 25 89, 16 79, 13 64 C 6 38, 14 17, 32 3 Z"
        fill={`url(#fg-sort-${type})`}
        stroke={meta.color}
        strokeWidth={1.5}
        strokeOpacity={0.85}
      />
      <path
        d="M32 12 L 32 88"
        stroke="#ffffff"
        strokeOpacity={0.75}
        strokeWidth={1.6}
      />
      {[20, 30, 40, 52, 66, 78].map((y) => (
        <g key={y}>
          <path
            d={`M32 ${y} Q 22 ${y + 2} 14 ${y + 7}`}
            stroke="#ffffff"
            strokeOpacity={0.55}
            strokeWidth={1}
            fill="none"
          />
          <path
            d={`M32 ${y} Q 42 ${y + 2} 50 ${y + 7}`}
            stroke="#ffffff"
            strokeOpacity={0.55}
            strokeWidth={1}
            fill="none"
          />
        </g>
      ))}
    </svg>
  );
}

export function NestSvg({
  type,
  size = 140,
}: {
  type: FeatherType;
  size?: number;
}) {
  const meta = FEATHER_META[type];
  const [fallback, setFallback] = useState(false);

  if (!fallback) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/media/sort/nest-${type}.png`}
        alt=""
        width={size}
        height={size * 0.8}
        style={{
          width: size,
          height: "auto",
          objectFit: "contain",
          filter: `drop-shadow(0 8px 20px ${meta.glow})`,
          pointerEvents: "none",
        }}
        draggable={false}
        onError={() => setFallback(true)}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 200 140"
      width={size}
      height={size * 0.7}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <defs>
        <radialGradient id={`nest-glow-${type}`} cx="50%" cy="45%" r="55%">
          <stop offset="0" stopColor={meta.color} stopOpacity={0.55} />
          <stop offset="1" stopColor={meta.color} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`nest-twig-${type}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#a06a3a" />
          <stop offset="1" stopColor="#5e3a1a" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="90" rx="92" ry="38" fill={`url(#nest-glow-${type})`} />
      <path
        d="M 12 88 Q 100 30 188 88 Q 188 122 100 130 Q 12 122 12 88 Z"
        fill={`url(#nest-twig-${type})`}
        stroke="#3d220c"
        strokeWidth={1}
      />
      {Array.from({ length: 22 }).map((_, i) => {
        const x1 = 18 + i * 8 + (i % 2) * 2;
        const y1 = 78 + (i % 3) * 6;
        const x2 = x1 + 12 + (i % 4) * 2;
        const y2 = y1 + 8 + (i % 2) * 4;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#3d220c"
            strokeOpacity={0.55}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
        );
      })}
      <ellipse
        cx="100"
        cy="80"
        rx="68"
        ry="14"
        fill={meta.color}
        opacity={0.18}
      />
    </svg>
  );
}
