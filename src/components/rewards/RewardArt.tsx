"use client";

// Rich SVG illustrations for the 4 surprise rewards on /rewards.
// Each gets its own multi-layer composition (gradient backdrop, halo
// glow, sparkle dust, distinct hero glyph). This replaces the
// "Lucide icon on a flat gradient" pattern that read as mid.

interface Props {
  id: string;
  size?: number;
}

export function RewardArt({ id, size = 140 }: Props) {
  switch (id) {
    case "coloring":
      return <ColoringArt size={size} />;
    case "puzzle":
      return <PuzzleArt size={size} />;
    case "character":
      return <CharacterArt size={size} />;
    case "mystery":
      return <MysteryArt size={size} />;
    default:
      return <ColoringArt size={size} />;
  }
}

function SparkleDust({ scheme }: { scheme: "pink" | "blue" | "purple" | "orange" }) {
  const c = {
    pink: "#ffe7f7",
    blue: "#dff3ff",
    purple: "#efe1ff",
    orange: "#fff1d6",
  }[scheme];
  return (
    <g>
      {[
        [40, 60, 1.6],
        [180, 40, 2.2],
        [195, 100, 1.4],
        [50, 130, 1.8],
        [165, 145, 2],
        [20, 100, 1.4],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={c} opacity={0.85} />
      ))}
      {[
        [105, 35, 4],
        [35, 25, 3],
        [180, 165, 3.5],
      ].map(([x, y, r], i) => (
        <Sparkle key={`s${i}`} cx={x} cy={y} r={r} fill={c} />
      ))}
    </g>
  );
}

function Sparkle({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  const r2 = r * 0.4;
  return (
    <g opacity={0.9}>
      <path
        d={`M ${cx} ${cy - r} L ${cx + r2} ${cy - r2} L ${cx + r} ${cy} L ${cx + r2} ${cy + r2} L ${cx} ${cy + r} L ${cx - r2} ${cy + r2} L ${cx - r} ${cy} L ${cx - r2} ${cy - r2} Z`}
        fill={fill}
      />
    </g>
  );
}

function ColoringArt({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 220 200" width={size} height={(size * 200) / 220} aria-hidden>
      <defs>
        <linearGradient id="cl-paper" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff8f0" />
          <stop offset="1" stopColor="#ffe2cf" />
        </linearGradient>
        <linearGradient id="cl-crayon-a" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ff7ab8" />
          <stop offset="1" stopColor="#ff2d8e" />
        </linearGradient>
        <linearGradient id="cl-crayon-b" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#4cc4ff" />
          <stop offset="1" stopColor="#1da9e8" />
        </linearGradient>
        <linearGradient id="cl-crayon-c" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffd14a" />
          <stop offset="1" stopColor="#f0a900" />
        </linearGradient>
        <radialGradient id="cl-halo" cx="50%" cy="40%" r="55%">
          <stop offset="0" stopColor="#fff" stopOpacity={0.75} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* Paper sheet (tilted) */}
      <g transform="rotate(-6 110 100)">
        <rect x="38" y="36" width="144" height="128" rx="10" fill="url(#cl-paper)" stroke="#ffb285" strokeWidth="2" />
        <rect x="38" y="36" width="144" height="128" rx="10" fill="url(#cl-halo)" />
        {/* Outlined drawing — heart with rays */}
        <path
          d="M110 110 C 100 92, 78 92, 78 108 C 78 124, 110 142, 110 142 C 110 142, 142 124, 142 108 C 142 92, 120 92, 110 110 Z"
          fill="#fff"
          stroke="#b13bff"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Heart partially colored */}
        <path
          d="M110 110 C 100 92, 78 92, 78 108 C 78 124, 96 134, 110 138 Z"
          fill="#ff7ab8"
          opacity={0.85}
        />
        {/* Rays */}
        {[60, 80, 100, 120, 140, 160].map((x, i) => (
          <line
            key={i}
            x1={x}
            y1={64}
            x2={x + (i % 2 === 0 ? 4 : -4)}
            y2={78}
            stroke="#ffd14a"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        ))}
      </g>
      {/* Crayons stacked across the bottom */}
      <g transform="translate(10 150) rotate(-12)">
        <Crayon x={0} fill="url(#cl-crayon-a)" tip="#ff2d8e" />
      </g>
      <g transform="translate(70 165) rotate(6)">
        <Crayon x={0} fill="url(#cl-crayon-b)" tip="#1da9e8" />
      </g>
      <g transform="translate(140 158) rotate(-4)">
        <Crayon x={0} fill="url(#cl-crayon-c)" tip="#f0a900" />
      </g>
      <SparkleDust scheme="pink" />
    </svg>
  );
}

function Crayon({ x, fill, tip }: { x: number; fill: string; tip: string }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x="0" y="0" width="58" height="14" rx="3" fill={fill} stroke="#1a0f3a" strokeOpacity={0.15} />
      <rect x="0" y="2" width="58" height="3" fill="#fff" opacity={0.35} />
      <polygon points="58,0 70,7 58,14" fill={tip} stroke="#1a0f3a" strokeOpacity={0.15} />
      <rect x="46" y="0" width="2" height="14" fill="#1a0f3a" opacity={0.18} />
      <rect x="10" y="0" width="2" height="14" fill="#1a0f3a" opacity={0.18} />
    </g>
  );
}

function PuzzleArt({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 220 200" width={size} height={(size * 200) / 220} aria-hidden>
      <defs>
        <linearGradient id="pz-a" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7cd1ff" />
          <stop offset="1" stopColor="#4cc4ff" />
        </linearGradient>
        <linearGradient id="pz-b" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#a76bff" />
          <stop offset="1" stopColor="#6a2dff" />
        </linearGradient>
        <linearGradient id="pz-c" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ff7ab8" />
          <stop offset="1" stopColor="#ff2d8e" />
        </linearGradient>
        <linearGradient id="pz-d" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffe48a" />
          <stop offset="1" stopColor="#ffd14a" />
        </linearGradient>
      </defs>
      {/* 4-piece interlocking jigsaw — slight 3D tilt with shadow under each */}
      <g transform="translate(110 100)">
        <g transform="rotate(-8)">
          <PuzzlePiece x={-58} y={-58} fill="url(#pz-a)" knobs={{ right: "out", bottom: "out" }} />
          <PuzzlePiece x={4} y={-58} fill="url(#pz-b)" knobs={{ left: "in", bottom: "in" }} />
          <PuzzlePiece x={-58} y={4} fill="url(#pz-c)" knobs={{ right: "in", top: "in" }} />
          <PuzzlePiece x={4} y={4} fill="url(#pz-d)" knobs={{ left: "out", top: "out" }} />
        </g>
      </g>
      <SparkleDust scheme="blue" />
    </svg>
  );
}

function PuzzlePiece({
  x,
  y,
  fill,
  knobs,
}: {
  x: number;
  y: number;
  fill: string;
  knobs: Partial<Record<"top" | "right" | "bottom" | "left", "in" | "out">>;
}) {
  const w = 54;
  // Simple square with optional knob bumps. We approximate with rounded
  // bumps to keep the SVG paths short.
  const bumps: string[] = [];
  if (knobs.right === "out") bumps.push(`M ${x + w} ${y + w / 2 - 10} q 14 10 0 20`);
  if (knobs.bottom === "out") bumps.push(`M ${x + w / 2 - 10} ${y + w} q 10 14 20 0`);
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={w}
        rx="6"
        fill={fill}
        stroke="#1a0f3a"
        strokeOpacity={0.25}
        strokeWidth="2"
      />
      <rect x={x + 4} y={y + 4} width={w - 8} height={6} rx="3" fill="#fff" opacity={0.35} />
      {bumps.map((d, i) => (
        <path key={i} d={d} fill={fill} stroke="#1a0f3a" strokeOpacity={0.25} strokeWidth="2" />
      ))}
    </g>
  );
}

function CharacterArt({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 220 200" width={size} height={(size * 200) / 220} aria-hidden>
      <defs>
        <linearGradient id="ch-card" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#efe1ff" />
        </linearGradient>
        <linearGradient id="ch-frame" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffe48a" />
          <stop offset="0.5" stopColor="#ffd14a" />
          <stop offset="1" stopColor="#f0a900" />
        </linearGradient>
        <radialGradient id="ch-port" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#ffd6f0" />
          <stop offset="1" stopColor="#a76bff" />
        </radialGradient>
      </defs>
      {/* Trading-card frame tilted */}
      <g transform="rotate(-8 110 100)">
        <rect x="42" y="20" width="136" height="160" rx="14" fill="url(#ch-frame)" />
        <rect x="50" y="28" width="120" height="144" rx="10" fill="url(#ch-card)" />
        {/* Portrait window */}
        <rect x="60" y="38" width="100" height="86" rx="8" fill="url(#ch-port)" />
        {/* Bird silhouette */}
        <g transform="translate(110 90)">
          <ellipse cx="0" cy="0" rx="22" ry="20" fill="#b13bff" />
          <circle cx="-6" cy="-22" r="13" fill="#ff7ab8" />
          <circle cx="-9" cy="-23" r="2" fill="#1a0f3a" />
          <path d="M -2 -22 L 8 -20 L -2 -16 Z" fill="#ffd14a" />
          <path d="M 0 -2 L 26 -6 L 18 6 Z" fill="#a76bff" />
        </g>
        {/* Name plate */}
        <rect x="60" y="132" width="100" height="28" rx="6" fill="#1a0f3a" />
        <text
          x="110"
          y="150"
          textAnchor="middle"
          fontSize="13"
          fontWeight={800}
          fill="#ffd14a"
          fontFamily="var(--font-baloo, sans-serif)"
          letterSpacing="0.06em"
        >
          MS. POP
        </text>
        {/* Power stars (top right of frame) */}
        <g transform="translate(160 38)">
          <Sparkle cx={0} cy={0} r={5} fill="#fff" />
        </g>
      </g>
      <SparkleDust scheme="purple" />
    </svg>
  );
}

function MysteryArt({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 220 200" width={size} height={(size * 200) / 220} aria-hidden>
      <defs>
        <linearGradient id="my-box" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ff9a3a" />
          <stop offset="1" stopColor="#ff6b3a" />
        </linearGradient>
        <linearGradient id="my-ribbon" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffe48a" />
          <stop offset="1" stopColor="#ffd14a" />
        </linearGradient>
        <radialGradient id="my-glow" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#fff" stopOpacity={0.95} />
          <stop offset="0.5" stopColor="#ffd14a" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffd14a" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* Halo glow behind box */}
      <circle cx="110" cy="105" r="80" fill="url(#my-glow)" />
      {/* Gift box body */}
      <rect x="50" y="80" width="120" height="92" rx="8" fill="url(#my-box)" stroke="#1a0f3a" strokeOpacity={0.18} strokeWidth="2" />
      {/* Lid */}
      <rect x="42" y="68" width="136" height="22" rx="6" fill="url(#my-box)" stroke="#1a0f3a" strokeOpacity={0.18} strokeWidth="2" />
      {/* Vertical ribbon */}
      <rect x="98" y="68" width="24" height="104" fill="url(#my-ribbon)" />
      <rect x="98" y="68" width="24" height="3" fill="#fff" opacity={0.4} />
      {/* Horizontal ribbon band on lid */}
      <rect x="42" y="76" width="136" height="8" fill="url(#my-ribbon)" />
      {/* Bow */}
      <g transform="translate(110 64)">
        <ellipse cx="-14" cy="0" rx="14" ry="9" fill="url(#my-ribbon)" stroke="#1a0f3a" strokeOpacity={0.2} strokeWidth="1.5" />
        <ellipse cx="14" cy="0" rx="14" ry="9" fill="url(#my-ribbon)" stroke="#1a0f3a" strokeOpacity={0.2} strokeWidth="1.5" />
        <circle cx="0" cy="0" r="6" fill="url(#my-ribbon)" stroke="#1a0f3a" strokeOpacity={0.2} strokeWidth="1.5" />
      </g>
      {/* Question mark on box face */}
      <text
        x="110"
        y="138"
        textAnchor="middle"
        fontSize="40"
        fontWeight={800}
        fill="#fff"
        fontFamily="var(--font-baloo, sans-serif)"
        style={{ filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.25))" }}
      >
        ?
      </text>
      <SparkleDust scheme="orange" />
    </svg>
  );
}
