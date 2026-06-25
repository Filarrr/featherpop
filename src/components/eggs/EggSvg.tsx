"use client";

// The animated, progressively-cracking egg SVG.
// `crackLevel` is 0..4:
//   0 = pristine egg (no cracks)
//   1 = small crack    (10 words)
//   2 = medium crack   (20 words)
//   3 = large crack    (30 words)
//   4 = almost open    (40 words)
// (5 = hatch — handled by EggHatchReveal instead.)
//
// Each level reuses the prior level's cracks and adds new ones — so
// the egg visibly accumulates damage instead of replacing the
// pattern. The pattern stays stable for a given color so the kid
// sees "their" egg, not a new one each time.

import type { EggColor } from "@/lib/child-profile";

interface Props {
  color: EggColor;
  crackLevel: number; // 0..4
  size?: number;
  hovering?: boolean;
}

const EGG_PALETTES: Record<EggColor, { body: [string, string]; pattern: string; sheen: string }> = {
  purple:  { body: ["#d4b5ff", "#a86bff"], pattern: "#6a2dff", sheen: "#fff" },
  blue:    { body: ["#cfeeff", "#7cd1ff"], pattern: "#1da9e8", sheen: "#fff" },
  pink:    { body: ["#ffd6ec", "#ff9bce"], pattern: "#ff2d8e", sheen: "#fff" },
  gold:    { body: ["#fff0a0", "#ffd14a"], pattern: "#a86800", sheen: "#fff8b0" },
  rainbow: { body: ["#ffd6ec", "#a76bff"], pattern: "#1da9e8", sheen: "#fff" }, // base; gradient overrides
  silver:  { body: ["#f1f5fb", "#cfd6e6"], pattern: "#5a6680", sheen: "#fff" },
};

export function EggSvg({ color, crackLevel, size = 200, hovering = false }: Props) {
  const palette = EGG_PALETTES[color];
  const id = `egg-${color}`;
  const isRainbow = color === "rainbow";
  const level = Math.max(0, Math.min(4, crackLevel));

  return (
    <svg
      viewBox="0 0 160 200"
      width={size}
      height={(size * 200) / 160}
      className={`egg-svg ${hovering ? "is-hovering" : ""}`}
      aria-label={`${color} egg, crack level ${level}`}
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={palette.body[0]} />
          <stop offset="1" stopColor={palette.body[1]} />
        </linearGradient>
        {isRainbow ? (
          <linearGradient id={`${id}-rainbow`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#ff7ab8" />
            <stop offset="0.25" stopColor="#ffd14a" />
            <stop offset="0.5" stopColor="#7cf0d5" />
            <stop offset="0.75" stopColor="#7cd1ff" />
            <stop offset="1" stopColor="#a76bff" />
          </linearGradient>
        ) : null}
        <radialGradient id={`${id}-sheen`} cx="35%" cy="30%" r="35%">
          <stop offset="0" stopColor={palette.sheen} stopOpacity={0.85} />
          <stop offset="1" stopColor={palette.sheen} stopOpacity={0} />
        </radialGradient>
        {/* Glow halo */}
        <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor="#fff" stopOpacity={0.55} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Halo */}
      <ellipse cx="80" cy="100" rx="78" ry="98" fill={`url(#${id}-halo)`} />

      {/* Egg body */}
      <g className="egg-svg-body">
        <path
          d="M 80 14 C 38 14, 14 84, 14 124 C 14 168, 44 192, 80 192 C 116 192, 146 168, 146 124 C 146 84, 122 14, 80 14 Z"
          fill={isRainbow ? `url(#${id}-rainbow)` : `url(#${id}-body)`}
          stroke={palette.pattern}
          strokeWidth="2.4"
        />

        {/* Decorative pattern — zigzag band + dots (matches the coloring
            page style). Skipped on rainbow which has its own swirl. */}
        {!isRainbow ? (
          <>
            <path
              d="M 30 90 L 50 76 L 70 90 L 90 76 L 110 90 L 130 76"
              fill="none"
              stroke={palette.pattern}
              strokeWidth="2.2"
              opacity={0.85}
            />
            <g opacity={0.7}>
              <circle cx="46" cy="130" r="6" fill={palette.pattern} />
              <circle cx="80" cy="150" r="6" fill={palette.pattern} />
              <circle cx="114" cy="130" r="6" fill={palette.pattern} />
              <circle cx="60" cy="170" r="4" fill={palette.pattern} />
              <circle cx="100" cy="170" r="4" fill={palette.pattern} />
            </g>
          </>
        ) : (
          // Rainbow swirl detail
          <g opacity={0.65}>
            <path d="M 30 70 Q 80 50 130 70" fill="none" stroke="#fff" strokeWidth="2" />
            <path d="M 30 100 Q 80 80 130 100" fill="none" stroke="#fff" strokeWidth="2" />
            <path d="M 30 140 Q 80 120 130 140" fill="none" stroke="#fff" strokeWidth="2" />
          </g>
        )}

        {/* Sheen */}
        <ellipse cx="56" cy="60" rx="22" ry="28" fill={`url(#${id}-sheen)`} />
      </g>

      {/* CRACK LAYERS — each level cumulatively adds more.
          Drawn as black ink lines with a tiny lighter underline so they
          read as breaks in the shell, not painted-on decoration. */}
      {level >= 1 ? (
        <g className="egg-svg-crack-layer">
          {/* Small crack — top-right corner */}
          <path
            d="M 100 36 L 108 46 L 102 56 L 112 62"
            fill="none"
            stroke="#1a0f3a"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 100 36 L 108 46 L 102 56 L 112 62"
            fill="none"
            stroke="#fff"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeOpacity={0.6}
          />
        </g>
      ) : null}

      {level >= 2 ? (
        <g className="egg-svg-crack-layer">
          {/* Medium crack — diagonal across the middle-left */}
          <path
            d="M 32 100 L 44 108 L 38 120 L 52 128 L 46 140"
            fill="none"
            stroke="#1a0f3a"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 32 100 L 44 108 L 38 120 L 52 128 L 46 140"
            fill="none"
            stroke="#fff"
            strokeWidth="0.8"
            strokeOpacity={0.5}
          />
        </g>
      ) : null}

      {level >= 3 ? (
        <g className="egg-svg-crack-layer">
          {/* Large crack — wraps around the right side with branches */}
          <path
            d="M 130 80 L 122 96 L 134 108 L 124 124 L 134 140 L 122 152 L 130 168"
            fill="none"
            stroke="#1a0f3a"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Branch */}
          <path
            d="M 124 124 L 110 122 M 134 140 L 120 142"
            fill="none"
            stroke="#1a0f3a"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
      ) : null}

      {level >= 4 ? (
        <g className="egg-svg-crack-layer">
          {/* Almost-open — a long top jaggy that splits the shell, plus
              a tiny gap of dark "inside" peeking through. */}
          <path
            d="M 50 30 L 60 42 L 54 56 L 68 64 L 64 78 L 80 84 L 92 76 L 86 64"
            fill="none"
            stroke="#1a0f3a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Peek inside — small dark triangle on the upper crack */}
          <polygon
            points="74,38 84,38 79,46"
            fill="#1a0f3a"
            opacity={0.85}
          />
        </g>
      ) : null}

      {/* Floating sparkle when hovering / on crack milestone */}
      {hovering ? (
        <g className="egg-svg-sparkle-overlay">
          <circle cx="48" cy="48" r="2" fill="#fff" />
          <circle cx="130" cy="60" r="2.5" fill="#fff" />
          <circle cx="40" cy="158" r="1.8" fill="#fff" />
          <circle cx="120" cy="170" r="2.2" fill="#fff" />
        </g>
      ) : null}
    </svg>
  );
}
