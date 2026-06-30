"use client";

// Printable coloring scenes from the Ms. Feather Pop universe.
// Thick black outlines on white background — designed to print
// clean on letter-size paper, big enough areas for ages 3-7.
//
// Every scene has a hidden tiny feather glyph somewhere for the
// "Find the Feather" meta-game (mentioned on the prize reveal).

import { getColoring } from "@/lib/prize-library";

interface Props {
  id: string;
  size?: number;
}

export function ColoringScene({ id, size = 540 }: Props) {
  // Prefer the client's real coloring-book artwork when the page has one.
  const page = getColoring(id);
  if (page?.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={page.image}
        alt={page.title}
        width={size}
        height={Math.round(size * 1.5)}
        style={{
          width: size,
          height: "auto",
          maxWidth: "100%",
          display: "block",
          margin: "0 auto",
        }}
      />
    );
  }

  switch (id) {
    case "egg-cave":
      return <EggCave size={size} />;
    case "reading-tree":
      return <ReadingTree size={size} />;
    case "park-map":
      return <ParkMap size={size} />;
    case "alphabet-garden":
      return <AlphabetGarden size={size} />;
    default:
      return <EggCave size={size} />;
  }
}

const STROKE = "#1a0f3a";
const STROKE_W = 2.4;

function Title({ text }: { text: string }) {
  return (
    <g>
      <rect x="80" y="30" width="540" height="48" rx="24" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
      <text
        x="350"
        y="63"
        textAnchor="middle"
        fontSize="26"
        fontWeight={800}
        fill={STROKE}
        fontFamily="var(--font-baloo, sans-serif)"
        letterSpacing="0.08em"
      >
        {text}
      </text>
    </g>
  );
}

function Sig() {
  return (
    <text
      x="350"
      y="855"
      textAnchor="middle"
      fontSize="12"
      fontWeight={700}
      fill={STROKE}
      opacity={0.6}
      fontFamily="var(--font-fredoka, sans-serif)"
      letterSpacing="0.2em"
    >
      MS. FEATHER POP · COLOR ME!
    </text>
  );
}

/** A tiny 12-mark feather glyph used as the "hidden" find-it feather. */
function HiddenFeather({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path
        d="M0 0 C 6 4, 8 10, 6 20 C 5 24, 3 26, 0 28 C -3 26, -5 24, -6 20 C -8 10, -6 4, 0 0 Z"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.2"
      />
      <path d="M0 2 L 0 26" stroke={STROKE} strokeWidth="1.2" />
    </g>
  );
}

/* ============================================================
   Scene 1 — The Magical Egg Cave
   ============================================================ */
function EggCave({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 700 900" width={size} height={(size * 900) / 700} aria-hidden style={{ background: "white" }}>
      <Title text="THE MAGICAL EGG CAVE" />

      {/* Cave silhouette */}
      <path
        d="M 60 200 Q 350 100 640 200 L 640 760 Q 640 800 600 800 L 100 800 Q 60 800 60 760 Z"
        fill="none"
        stroke={STROKE}
        strokeWidth={STROKE_W + 0.8}
      />

      {/* Hanging crystals from cave ceiling */}
      {[140, 220, 320, 420, 520, 580].map((x, i) => (
        <g key={i}>
          <path d={`M ${x - 22} 200 L ${x + 22} 200 L ${x} ${230 + (i % 2) * 20} Z`} fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
        </g>
      ))}

      {/* Big center egg with pattern */}
      <ellipse cx="350" cy="500" rx="120" ry="160" fill="none" stroke={STROKE} strokeWidth={STROKE_W + 1} />
      {/* Zigzag band on center egg */}
      <path
        d="M 250 460 L 290 440 L 330 460 L 370 440 L 410 460 L 450 440"
        fill="none"
        stroke={STROKE}
        strokeWidth={STROKE_W}
      />
      {/* Dots on center egg */}
      {[
        [310, 520],
        [350, 540],
        [390, 520],
        [310, 600],
        [350, 580],
        [390, 600],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="10" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
      ))}

      {/* Left smaller egg with stripes */}
      <ellipse cx="170" cy="610" rx="70" ry="95" fill="none" stroke={STROKE} strokeWidth={STROKE_W + 0.5} />
      {[565, 600, 635, 670].map((y, i) => (
        <path key={i} d={`M ${110 + (i % 2) * 6} ${y} Q 170 ${y - 6} ${230 - (i % 2) * 6} ${y}`} fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
      ))}

      {/* Right smaller egg with stars */}
      <ellipse cx="530" cy="610" rx="70" ry="95" fill="none" stroke={STROKE} strokeWidth={STROKE_W + 0.5} />
      {[
        [510, 570],
        [560, 600],
        [510, 640],
        [550, 660],
      ].map(([x, y], i) => (
        <StarOutline key={i} cx={x} cy={y} r={11} />
      ))}

      {/* Ground rocks */}
      <path d="M 100 770 Q 140 750 180 770 Q 220 760 260 770 Q 300 750 340 770 Q 380 760 420 770 Q 460 750 500 770 Q 540 760 580 770 Q 620 750 640 770" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />

      {/* Sparkle stars in the cave */}
      {[
        [140, 280],
        [240, 320],
        [560, 290],
        [490, 340],
        [620, 380],
        [120, 420],
      ].map(([x, y], i) => (
        <SparkleOutline key={i} cx={x} cy={y} r={14} />
      ))}

      {/* Hidden feather: tucked between two ground rocks */}
      <HiddenFeather x={485} y={755} rot={-15} />

      <Sig />
    </svg>
  );
}

/* ============================================================
   Scene 2 — The Eagle's Reading Tree
   ============================================================ */
function ReadingTree({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 700 900" width={size} height={(size * 900) / 700} aria-hidden style={{ background: "white" }}>
      <Title text="THE EAGLE'S READING TREE" />

      {/* Tree trunk */}
      <path
        d="M 320 760 L 280 500 Q 280 460 320 460 L 380 460 Q 420 460 420 500 L 380 760 Z"
        fill="none"
        stroke={STROKE}
        strokeWidth={STROKE_W + 0.8}
      />
      {/* Bark lines */}
      <path d="M 310 540 L 320 720" fill="none" stroke={STROKE} strokeWidth="1.6" />
      <path d="M 350 560 L 360 740" fill="none" stroke={STROKE} strokeWidth="1.6" />
      <path d="M 390 540 L 380 720" fill="none" stroke={STROKE} strokeWidth="1.6" />

      {/* Big leafy canopy — three lobes */}
      <circle cx="220" cy="380" r="120" fill="none" stroke={STROKE} strokeWidth={STROKE_W + 0.8} />
      <circle cx="480" cy="380" r="120" fill="none" stroke={STROKE} strokeWidth={STROKE_W + 0.8} />
      <circle cx="350" cy="280" r="140" fill="none" stroke={STROKE} strokeWidth={STROKE_W + 0.8} />

      {/* Eagle in the middle of the top canopy */}
      <g transform="translate(350 280)">
        {/* Body */}
        <ellipse cx="0" cy="10" rx="38" ry="32" fill="none" stroke={STROKE} strokeWidth={STROKE_W + 0.5} />
        {/* Head */}
        <circle cx="0" cy="-25" r="22" fill="none" stroke={STROKE} strokeWidth={STROKE_W + 0.5} />
        {/* Eye */}
        <circle cx="6" cy="-28" r="3" fill={STROKE} />
        {/* Beak */}
        <path d="M 16 -24 L 30 -20 L 16 -16 Z" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
        {/* Wings */}
        <path d="M -35 0 Q -55 10 -50 30 Q -38 25 -28 20 Z" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
        <path d="M 35 0 Q 55 10 50 30 Q 38 25 28 20 Z" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
        {/* Holding a book */}
        <rect x="-18" y="20" width="36" height="22" rx="2" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
        <line x1="0" y1="20" x2="0" y2="42" stroke={STROKE} strokeWidth="1.4" />
        <line x1="-12" y1="28" x2="-2" y2="28" stroke={STROKE} strokeWidth="1.2" />
        <line x1="2" y1="28" x2="12" y2="28" stroke={STROKE} strokeWidth="1.2" />
        <line x1="-12" y1="34" x2="-2" y2="34" stroke={STROKE} strokeWidth="1.2" />
        <line x1="2" y1="34" x2="12" y2="34" stroke={STROKE} strokeWidth="1.2" />
      </g>

      {/* Two smaller birds in side canopies */}
      <g transform="translate(220 380)">
        <ellipse cx="0" cy="5" rx="22" ry="18" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
        <circle cx="0" cy="-12" r="13" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
        <circle cx="4" cy="-14" r="2" fill={STROKE} />
        <path d="M 10 -12 L 20 -10 L 10 -8 Z" fill="none" stroke={STROKE} strokeWidth="1.4" />
      </g>
      <g transform="translate(480 380)">
        <ellipse cx="0" cy="5" rx="22" ry="18" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
        <circle cx="0" cy="-12" r="13" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
        <circle cx="-4" cy="-14" r="2" fill={STROKE} />
        <path d="M -10 -12 L -20 -10 L -10 -8 Z" fill="none" stroke={STROKE} strokeWidth="1.4" />
      </g>

      {/* Leaves around canopies (small ovals) */}
      {[
        [180, 320],
        [250, 320],
        [140, 410],
        [180, 460],
        [520, 320],
        [450, 320],
        [560, 410],
        [520, 460],
        [320, 180],
        [380, 180],
        [280, 220],
        [420, 220],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="14" ry="9" fill="none" stroke={STROKE} strokeWidth="1.6" />
      ))}

      {/* Ground */}
      <path d="M 60 770 Q 350 760 640 770" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
      {/* Grass tufts */}
      {[100, 180, 260, 440, 520, 600].map((x, i) => (
        <g key={i} transform={`translate(${x} 770)`}>
          <path d="M -8 0 L 0 -12 L 8 0" fill="none" stroke={STROKE} strokeWidth="1.6" />
        </g>
      ))}

      {/* Sun in corner */}
      <circle cx="600" cy="120" r="36" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
      {Array.from({ length: 8 }).map((_, i) => {
        const ang = (i * Math.PI) / 4;
        const x1 = 600 + Math.cos(ang) * 44;
        const y1 = 120 + Math.sin(ang) * 44;
        const x2 = 600 + Math.cos(ang) * 60;
        const y2 = 120 + Math.sin(ang) * 60;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={STROKE} strokeWidth="1.8" />;
      })}

      {/* Hidden feather: tucked into the grass at the bottom-left */}
      <HiddenFeather x={140} y={740} rot={20} />

      <Sig />
    </svg>
  );
}

/* ============================================================
   Scene 3 — Feather Park Map
   ============================================================ */
function ParkMap({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 700 900" width={size} height={(size * 900) / 700} aria-hidden style={{ background: "white" }}>
      <Title text="FEATHER PARK MAP" />

      {/* Park boundary */}
      <path
        d="M 80 130 L 620 130 L 620 800 L 80 800 Z"
        fill="none"
        stroke={STROKE}
        strokeWidth={STROKE_W + 0.6}
        strokeDasharray="8 6"
      />

      {/* Winding path through the park */}
      <path
        d="M 120 180 Q 250 220 230 330 Q 220 440 350 460 Q 480 480 480 580 Q 480 680 220 700 Q 130 710 130 770"
        fill="none"
        stroke={STROKE}
        strokeWidth={STROKE_W + 2}
        strokeLinecap="round"
      />

      {/* 6 QR stations along the path */}
      {[
        [120, 180, 1],
        [230, 330, 2],
        [350, 460, 3],
        [480, 580, 4],
        [220, 700, 5],
        [130, 770, 6],
      ].map(([x, y, n], i) => (
        <g key={i}>
          {/* Station post */}
          <rect x={Number(x) - 22} y={Number(y) - 28} width="44" height="44" rx="6" fill="none" stroke={STROKE} strokeWidth={STROKE_W + 0.5} />
          {/* QR pattern blocks */}
          <rect x={Number(x) - 18} y={Number(y) - 24} width="10" height="10" rx="1" fill="none" stroke={STROKE} strokeWidth="1.4" />
          <rect x={Number(x) + 8} y={Number(y) - 24} width="10" height="10" rx="1" fill="none" stroke={STROKE} strokeWidth="1.4" />
          <rect x={Number(x) - 18} y={Number(y) + 6} width="10" height="10" rx="1" fill="none" stroke={STROKE} strokeWidth="1.4" />
          <rect x={Number(x) - 4} y={Number(y) - 8} width="8" height="8" rx="1" fill="none" stroke={STROKE} strokeWidth="1.4" />
          {/* Station number badge */}
          <circle cx={Number(x) + 28} cy={Number(y) - 20} r="14" fill="white" stroke={STROKE} strokeWidth={STROKE_W} />
          <text x={Number(x) + 28} y={Number(y) - 16} textAnchor="middle" fontSize="16" fontWeight={800} fill={STROKE} fontFamily="var(--font-baloo, sans-serif)">
            {n}
          </text>
        </g>
      ))}

      {/* Park elements scattered */}
      {/* Tree */}
      <g transform="translate(440 200)">
        <circle cx="0" cy="0" r="48" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
        <rect x="-8" y="38" width="16" height="40" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
      </g>
      {/* Pond */}
      <ellipse cx="540" cy="350" rx="60" ry="30" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
      <path d="M 510 350 Q 540 340 570 350" fill="none" stroke={STROKE} strokeWidth="1.4" />
      {/* Bench */}
      <g transform="translate(340 700)">
        <rect x="-30" y="0" width="60" height="8" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
        <line x1="-28" y1="8" x2="-28" y2="22" stroke={STROKE} strokeWidth={STROKE_W} />
        <line x1="28" y1="8" x2="28" y2="22" stroke={STROKE} strokeWidth={STROKE_W} />
      </g>
      {/* Flowers */}
      {[
        [180, 250, 18],
        [560, 480, 16],
        [350, 250, 14],
        [580, 720, 18],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle cx="0" cy="0" r="4" fill="none" stroke={STROKE} strokeWidth="1.4" />
          {[0, 1, 2, 3, 4].map((p) => {
            const a = (p * 2 * Math.PI) / 5 - Math.PI / 2;
            const px = Math.cos(a) * Number(r);
            const py = Math.sin(a) * Number(r);
            return <circle key={p} cx={px} cy={py} r="8" fill="none" stroke={STROKE} strokeWidth="1.4" />;
          })}
          <line x1="0" y1={Number(r) + 6} x2="0" y2={Number(r) + 26} stroke={STROKE} strokeWidth="1.4" />
        </g>
      ))}

      {/* Hidden feather near the pond */}
      <HiddenFeather x={500} y={395} rot={-25} />

      <Sig />
    </svg>
  );
}

/* ============================================================
   Scene 4 — Alphabet Garden
   ============================================================ */
function AlphabetGarden({ size }: { size: number }) {
  // 26 flower-letters in a 6×5 grid (last row has 4 flowers + 2 swallowtails)
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const cols = 6;
  const cellW = 90;
  const cellH = 100;
  const startX = 100;
  const startY = 130;

  return (
    <svg viewBox="0 0 700 900" width={size} height={(size * 900) / 700} aria-hidden style={{ background: "white" }}>
      <Title text="ALPHABET GARDEN" />

      {/* Ground line at the bottom */}
      <path d="M 60 800 Q 350 790 640 800" fill="none" stroke={STROKE} strokeWidth={STROKE_W + 0.6} />

      {letters.map((l, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = startX + col * cellW;
        const cy = startY + row * cellH;
        return (
          <g key={l} transform={`translate(${cx} ${cy + 80})`}>
            {/* Stem */}
            <path d={`M 0 0 L 0 -55`} fill="none" stroke={STROKE} strokeWidth="1.8" />
            {/* Leaf */}
            <path d="M 0 -20 Q -14 -16 -14 -8 Q -6 -10 0 -16" fill="none" stroke={STROKE} strokeWidth="1.6" />
            {/* Petals */}
            {[0, 1, 2, 3, 4].map((p) => {
              const a = (p * 2 * Math.PI) / 5 - Math.PI / 2;
              const px = Math.cos(a) * 22;
              const py = Math.sin(a) * 22 - 55;
              return <circle key={p} cx={px} cy={py} r="14" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />;
            })}
            {/* Center letter */}
            <circle cx="0" cy="-55" r="14" fill="white" stroke={STROKE} strokeWidth={STROKE_W} />
            <text x="0" y="-49" textAnchor="middle" fontSize="14" fontWeight={800} fill={STROKE} fontFamily="var(--font-baloo, sans-serif)">
              {l}
            </text>
          </g>
        );
      })}

      {/* Sun in corner */}
      <circle cx="600" cy="120" r="30" fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
      {Array.from({ length: 8 }).map((_, i) => {
        const ang = (i * Math.PI) / 4;
        const x1 = 600 + Math.cos(ang) * 36;
        const y1 = 120 + Math.sin(ang) * 36;
        const x2 = 600 + Math.cos(ang) * 50;
        const y2 = 120 + Math.sin(ang) * 50;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={STROKE} strokeWidth="1.6" />;
      })}

      {/* Hidden feather: behind the U flower */}
      <HiddenFeather x={210} y={720} rot={-10} />

      <Sig />
    </svg>
  );
}

function StarOutline({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const ang = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    points.push(`${cx + Math.cos(ang) * rr},${cy + Math.sin(ang) * rr}`);
  }
  return <polygon points={points.join(" ")} fill="none" stroke={STROKE} strokeWidth={STROKE_W} />;
}

function SparkleOutline({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const r2 = r * 0.4;
  return (
    <path
      d={`M ${cx} ${cy - r} L ${cx + r2} ${cy - r2} L ${cx + r} ${cy} L ${cx + r2} ${cy + r2} L ${cx} ${cy + r} L ${cx - r2} ${cy + r2} L ${cx - r} ${cy} L ${cx - r2} ${cy - r2} Z`}
      fill="none"
      stroke={STROKE}
      strokeWidth={STROKE_W}
    />
  );
}
