"use client";

// Enamel-medal SVG used on the Progress page badges row.
// Five tiers map to: explorer (green), reader (blue), finder (purple),
// champion (pink), golden-feather (gold). Each has a unique core glyph.

import { Lock } from "lucide-react";

interface Props {
  tier: "explorer" | "reader" | "finder" | "champion" | "golden";
  earned: boolean;
}

const TIER_PALETTES: Record<
  Props["tier"],
  { ring: [string, string]; field: [string, string]; ribbon: [string, string]; glyph: string }
> = {
  explorer: {
    ring: ["#bff5dd", "#34e3a4"],
    field: ["#6bf0bc", "#1faa75"],
    ribbon: ["#34e3a4", "#0f7d54"],
    glyph: "🌱",
  },
  reader: {
    ring: ["#c7ecff", "#4cc4ff"],
    field: ["#7cd1ff", "#1da9e8"],
    ribbon: ["#4cc4ff", "#106a92"],
    glyph: "📖",
  },
  finder: {
    ring: ["#dec7ff", "#a76bff"],
    field: ["#b487ff", "#6a2dff"],
    ribbon: ["#a76bff", "#3d1aa3"],
    glyph: "🔍",
  },
  champion: {
    ring: ["#ffd0e7", "#ff7ab8"],
    field: ["#ff9bce", "#ff2d8e"],
    ribbon: ["#ff7ab8", "#a3105d"],
    glyph: "🏆",
  },
  golden: {
    ring: ["#fff0a0", "#ffd14a"],
    field: ["#ffe48a", "#f0a900"],
    ribbon: ["#ffd14a", "#a86800"],
    glyph: "🪶",
  },
};

export function Medal({ tier, earned }: Props) {
  const p = TIER_PALETTES[tier];
  const id = `medal-${tier}`;

  return (
    <div className={`progress-medal ${earned ? "is-earned" : "is-locked"}`}>
      <svg viewBox="0 0 100 130" width="100%" height="100%" aria-hidden>
        <defs>
          <linearGradient id={`${id}-ring`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={p.ring[0]} />
            <stop offset="1" stopColor={p.ring[1]} />
          </linearGradient>
          <radialGradient id={`${id}-field`} cx="50%" cy="38%" r="60%">
            <stop offset="0" stopColor={p.field[0]} />
            <stop offset="1" stopColor={p.field[1]} />
          </radialGradient>
          <linearGradient id={`${id}-ribbon`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={p.ribbon[0]} />
            <stop offset="1" stopColor={p.ribbon[1]} />
          </linearGradient>
          <linearGradient id={`${id}-shine`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.7} />
            <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
            <stop offset="1" stopColor="#fff" stopOpacity={0.35} />
          </linearGradient>
        </defs>

        {/* Ribbon tails */}
        <path
          d="M 30 65 L 22 122 L 36 110 L 40 122 L 50 84 Z"
          fill={`url(#${id}-ribbon)`}
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="1"
        />
        <path
          d="M 70 65 L 78 122 L 64 110 L 60 122 L 50 84 Z"
          fill={`url(#${id}-ribbon)`}
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="1"
        />

        {/* Outer scalloped ring (8-point) */}
        <Scalloped cx={50} cy={48} r={36} fill={`url(#${id}-ring)`} />
        {/* Inner field */}
        <circle cx="50" cy="48" r="28" fill={`url(#${id}-field)`} stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />
        {/* Shine arc */}
        <path
          d="M 30 30 A 22 22 0 0 1 68 30"
          fill="none"
          stroke={`url(#${id}-shine)`}
          strokeWidth="6"
          opacity={0.55}
        />
        <circle cx="50" cy="48" r="28" fill={`url(#${id}-shine)`} opacity={0.5} />

        {/* Center glyph */}
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fontSize="28"
          style={{ filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.25))" }}
        >
          {p.glyph}
        </text>
      </svg>

      {!earned ? (
        <span className="progress-medal-lock" aria-hidden>
          <Lock className="h-5 w-5" />
        </span>
      ) : null}
    </div>
  );
}

function Scalloped({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  // 8-point scalloped circle — gives the medal an enamel-pin silhouette.
  const points = 8;
  const deep = r * 1.08;
  const shallow = r * 0.94;
  const path: string[] = [];
  for (let i = 0; i <= points * 2; i++) {
    const ang = (i * Math.PI) / points - Math.PI / 2;
    const rr = i % 2 === 0 ? deep : shallow;
    const x = cx + Math.cos(ang) * rr;
    const y = cy + Math.sin(ang) * rr;
    path.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  path.push("Z");
  return <path d={path.join(" ")} fill={fill} stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />;
}
