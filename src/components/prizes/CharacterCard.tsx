"use client";

// Premium SVG-based collectible character card. Used both on:
//   - /prize/[at] (the reveal page after claim)
//   - /collection  (the kid's owned deck)
//
// Layout: trading-card aspect (5:7 portrait). Frame color + glyph
// color come from the card's `scheme`. Rarity gets its own ribbon
// across the top and a corner gem. Locked variant = greyed silhouette
// with a "?" — used on the collection page for cards the kid hasn't
// pulled yet.

import { CharacterCard as Card } from "@/lib/prize-library";
import { Lock, Star } from "lucide-react";

interface Props {
  card: Card;
  count?: number; // copies owned; >1 shows a 'x N' badge
  locked?: boolean;
  large?: boolean;
}

const SCHEME_PALETTES = {
  pink:   { ringA: "#ff9bce", ringB: "#ff2d8e", body: "#ffd6ec", deep: "#a3105d" },
  blue:   { ringA: "#7cd1ff", ringB: "#1da9e8", body: "#cfeeff", deep: "#106a92" },
  purple: { ringA: "#b487ff", ringB: "#6a2dff", body: "#e0ceff", deep: "#3d1aa3" },
  orange: { ringA: "#ffc18a", ringB: "#ff6b3a", body: "#ffd9b6", deep: "#a0421b" },
  green:  { ringA: "#6bf0bc", ringB: "#1faa75", body: "#c5f8df", deep: "#0f7d54" },
  gold:   { ringA: "#ffe48a", ringB: "#f0a900", body: "#fff0a0", deep: "#a86800" },
  teal:   { ringA: "#7cf0d5", ringB: "#1fb89a", body: "#cff7ec", deep: "#0a6a55" },
} as const;

const RARITY_META = {
  common:    { stars: 1, label: "COMMON",    bandStart: "#cfcfd8", bandEnd: "#8c8c98", textColor: "#1a0f3a" },
  rare:      { stars: 3, label: "RARE",      bandStart: "#7cd1ff", bandEnd: "#1da9e8", textColor: "#fff" },
  epic:      { stars: 4, label: "EPIC",      bandStart: "#b487ff", bandEnd: "#6a2dff", textColor: "#fff" },
  legendary: { stars: 5, label: "LEGENDARY", bandStart: "#ffe48a", bandEnd: "#f0a900", textColor: "#1a0f3a" },
} as const;

export function CharacterCard({ card, count, locked = false, large = false }: Props) {
  const palette = SCHEME_PALETTES[card.scheme];
  const rarity = RARITY_META[card.rarity];
  const id = `card-${card.id}`;
  const width = large ? 280 : 200;
  const height = Math.round((width * 7) / 5);

  if (locked) {
    return (
      <div className={`character-card is-locked ${large ? "is-large" : ""}`}>
        <svg viewBox="0 0 100 140" width={width} height={height} aria-hidden>
          <rect x="2" y="2" width="96" height="136" rx="10" fill="#dcd6e8" stroke="#a89bc8" strokeWidth="2" strokeDasharray="3 3" />
          <text x="50" y="80" textAnchor="middle" fontSize="50" fontWeight={800} fill="#a89bc8" fontFamily="var(--font-baloo, sans-serif)">?</text>
        </svg>
        <span className="character-card-lock" aria-hidden>
          <Lock className="h-4 w-4" />
        </span>
        <span className="character-card-locked-label">Letter {card.letter}</span>
      </div>
    );
  }

  return (
    <div className={`character-card ${large ? "is-large" : ""} rarity-${card.rarity}`}>
      {count && count > 1 ? (
        <span className="character-card-count" aria-label={`Owned ${count} times`}>
          ×{count}
        </span>
      ) : null}
      <svg viewBox="0 0 100 140" width={width} height={height} aria-label={card.name}>
        <defs>
          <linearGradient id={`${id}-ring`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={palette.ringA} />
            <stop offset="1" stopColor={palette.ringB} />
          </linearGradient>
          <linearGradient id={`${id}-body`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.5" stopColor={palette.body} />
            <stop offset="1" stopColor={palette.ringA} />
          </linearGradient>
          <linearGradient id={`${id}-band`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={rarity.bandStart} />
            <stop offset="1" stopColor={rarity.bandEnd} />
          </linearGradient>
          <radialGradient id={`${id}-port`} cx="50%" cy="40%" r="60%">
            <stop offset="0" stopColor="#fff" stopOpacity={0.85} />
            <stop offset="1" stopColor={palette.ringB} stopOpacity={0.55} />
          </radialGradient>
          <linearGradient id={`${id}-shine`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.55} />
            <stop offset="0.4" stopColor="#fff" stopOpacity={0} />
            <stop offset="1" stopColor="#fff" stopOpacity={0.3} />
          </linearGradient>
        </defs>

        {/* Outer frame */}
        <rect x="1.5" y="1.5" width="97" height="137" rx="9" fill={`url(#${id}-ring)`} />
        <rect x="4.5" y="4.5" width="91" height="131" rx="7" fill={`url(#${id}-body)`} />

        {/* Top rarity band */}
        <rect x="6" y="6" width="88" height="14" rx="4" fill={`url(#${id}-band)`} />
        <text
          x="50"
          y="16.5"
          textAnchor="middle"
          fontSize="6.5"
          fontWeight={800}
          fill={rarity.textColor}
          fontFamily="var(--font-baloo, sans-serif)"
          letterSpacing="0.2em"
        >
          {rarity.label}
        </text>

        {/* Letter chip top-left */}
        <circle cx="14" cy="13" r="6.5" fill="#fff" stroke={palette.deep} strokeWidth="1.2" />
        <text
          x="14"
          y="16"
          textAnchor="middle"
          fontSize="8"
          fontWeight={800}
          fill={palette.deep}
          fontFamily="var(--font-baloo, sans-serif)"
        >
          {card.letter}
        </text>

        {/* Stars top-right */}
        {Array.from({ length: rarity.stars }).map((_, i) => (
          <g key={i} transform={`translate(${82 - i * 5} 13)`}>
            <StarGlyph size={2.2} fill={rarity.bandStart === "#cfcfd8" ? "#fff" : "#fff8b0"} />
          </g>
        ))}

        {/* Portrait window */}
        <rect x="10" y="26" width="80" height="60" rx="6" fill={`url(#${id}-port)`} stroke={palette.deep} strokeOpacity={0.25} strokeWidth="1.2" />
        {/* Mini sparkles in the portrait */}
        <circle cx="18" cy="34" r="1" fill="#fff" />
        <circle cx="82" cy="32" r="1.2" fill="#fff" />
        <circle cx="80" cy="78" r="0.8" fill="#fff" />
        <circle cx="20" cy="80" r="1" fill="#fff" />

        {/* Centerpiece emoji */}
        <text
          x="50"
          y="68"
          textAnchor="middle"
          fontSize="36"
          style={{ filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.18))" }}
        >
          {card.emoji}
        </text>

        {/* Name plate */}
        <rect x="8" y="90" width="84" height="14" rx="3" fill={palette.deep} />
        <text
          x="50"
          y="99.5"
          textAnchor="middle"
          fontSize="6.5"
          fontWeight={800}
          fill="#fff"
          fontFamily="var(--font-baloo, sans-serif)"
        >
          {card.name.toUpperCase().slice(0, 26)}
        </text>

        {/* Power callout */}
        <rect x="8" y="106" width="84" height="22" rx="4" fill="#fff" stroke={palette.deep} strokeOpacity={0.2} strokeWidth="0.8" />
        <text x="11" y="113" fontSize="4.5" fontWeight={800} fill={palette.deep} fontFamily="var(--font-baloo, sans-serif)" letterSpacing="0.1em">
          POWER
        </text>
        {wrapText(card.power, 24, 3).map((line, i) => (
          <text
            key={i}
            x="11"
            y={120 + i * 4.5}
            fontSize="4"
            fontWeight={600}
            fill="#1a0f3a"
            fontFamily="var(--font-fredoka, sans-serif)"
          >
            {line}
          </text>
        ))}

        {/* Bottom signature */}
        <text x="50" y="135" textAnchor="middle" fontSize="3.5" fontWeight={700} fill={palette.deep} opacity={0.7} fontFamily="var(--font-fredoka, sans-serif)" letterSpacing="0.1em">
          MS. FEATHER POP · FEATHERVERSE
        </text>

        {/* Holographic shine overlay */}
        <rect x="4.5" y="4.5" width="91" height="131" rx="7" fill={`url(#${id}-shine)`} />
      </svg>
    </div>
  );
}

/** Greedy word-wrap into up to `maxLines` lines of at most `maxChars` chars each. */
function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/)) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
    if (lines.length >= maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines.slice(0, maxLines);
}

function StarGlyph({ size, fill }: { size: number; fill: string }) {
  const r = size;
  const r2 = r * 0.4;
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const ang = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r2;
    points.push(`${(Math.cos(ang) * rr).toFixed(2)},${(Math.sin(ang) * rr).toFixed(2)}`);
  }
  return <polygon points={points.join(" ")} fill={fill} />;
}

/** Lucide Star wrapper for the deck list bullets */
export function RarityStars({ rarity }: { rarity: Card["rarity"] }) {
  const n = RARITY_META[rarity].stars;
  return (
    <span className="character-card-rarity-stars">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="h-3 w-3" aria-hidden />
      ))}
    </span>
  );
}
