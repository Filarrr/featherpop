"use client";

// Inline SVG prize illustrations. Each prize gets a unique rich illustration
// (gradients, ribbons, embroidery, holographic shimmer, etc.) so the rewards
// page reads "premium video-game inventory" instead of "checklist of icons."
//
// Asset upgrade path: if /public/media/rewards/<id>.png exists it's used
// instead of the SVG automatically (the <PrizeArt> component probes once on
// mount). The SVG stays as the always-available fallback.

import { useEffect, useState } from "react";

interface Props {
  id: string;
  locked?: boolean;
  size?: number;
}

export function PrizeArt({ id, locked = false, size = 120 }: Props) {
  const [hasAsset, setHasAsset] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setHasAsset(true);
    };
    img.onerror = () => {
      if (!cancelled) setHasAsset(false);
    };
    img.src = `/media/rewards/${id}.png`;
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (hasAsset) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/media/rewards/${id}.png`}
        alt=""
        width={size}
        height={size}
        style={{
          width: size,
          height: "auto",
          objectFit: "contain",
          filter: locked ? "grayscale(0.85) brightness(0.85)" : "none",
          opacity: locked ? 0.7 : 1,
        }}
        draggable={false}
      />
    );
  }

  const className = `prize-art ${locked ? "is-locked" : ""}`;
  switch (id) {
    case "sticker":
      return <StickerSvg size={size} className={className} />;
    case "bookmark":
      return <BookmarkSvg size={size} className={className} />;
    case "patch":
      return <PatchSvg size={size} className={className} />;
    case "glitter-badge":
      return <GlitterBadgeSvg size={size} className={className} />;
    case "gold-frame":
      return <GoldFrameSvg size={size} className={className} />;
    default:
      return <TrophySvg size={size} className={className} />;
  }
}

function StickerSvg({ size, className }: { size: number; className: string }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className} aria-hidden>
      <defs>
        <radialGradient id="sticker-holo" cx="35%" cy="35%" r="65%">
          <stop offset="0" stopColor="#fff8b0" />
          <stop offset="0.4" stopColor="#ff7ab8" />
          <stop offset="0.75" stopColor="#a86bff" />
          <stop offset="1" stopColor="#3d1aa3" />
        </radialGradient>
        <linearGradient id="sticker-shimmer" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.7} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
          <stop offset="1" stopColor="#fff" stopOpacity={0.4} />
        </linearGradient>
      </defs>
      {/* Outer paper rim — wavy "die cut" sticker edge */}
      <circle cx="80" cy="80" r="74" fill="#fff" stroke="#e8d8ff" strokeWidth="2" />
      {/* Holographic body */}
      <circle cx="80" cy="80" r="66" fill="url(#sticker-holo)" />
      {/* Shimmer overlay */}
      <circle cx="80" cy="80" r="66" fill="url(#sticker-shimmer)" />
      {/* Feather glyph at center */}
      <g transform="translate(80 50)">
        <path
          d="M0 0 C 18 14, 24 32, 18 60 C 16 72, 8 80, 0 84 C -8 80, -16 72, -18 60 C -24 32, -18 14, 0 0 Z"
          fill="#fff"
          stroke="#ffe48a"
          strokeWidth="1.5"
        />
        <path d="M0 10 L 0 78" stroke="#ffd14a" strokeWidth="1.5" />
      </g>
      <text
        x="80"
        y="140"
        textAnchor="middle"
        fontFamily="var(--font-baloo, sans-serif)"
        fontWeight="800"
        fontSize="13"
        fill="#fff"
        style={{ filter: "drop-shadow(0 1px 0 #6a2dff)" }}
      >
        FEATHER POP
      </text>
    </svg>
  );
}

function BookmarkSvg({ size, className }: { size: number; className: string }) {
  return (
    <svg viewBox="0 0 120 180" width={size * 0.72} height={size} className={className} aria-hidden>
      <defs>
        <linearGradient id="bm-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffe7f7" />
          <stop offset="1" stopColor="#d8c8ff" />
        </linearGradient>
        <linearGradient id="bm-tassle" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffd14a" />
          <stop offset="1" stopColor="#ff7ab8" />
        </linearGradient>
      </defs>
      {/* Hole */}
      <circle cx="60" cy="14" r="6" fill="#fff" stroke="#a895d8" strokeWidth="1.5" />
      {/* Bookmark body */}
      <path
        d="M 12 22 L 108 22 L 108 156 L 60 134 L 12 156 Z"
        fill="url(#bm-body)"
        stroke="#a895d8"
        strokeWidth="2"
      />
      {/* Title bar */}
      <rect x="22" y="32" width="76" height="14" rx="7" fill="#6a2dff" />
      <text
        x="60"
        y="42"
        textAnchor="middle"
        fontFamily="var(--font-baloo, sans-serif)"
        fontWeight="800"
        fontSize="9"
        fill="#fff"
        letterSpacing="0.05em"
      >
        FEATHER QUEST
      </text>
      {/* Feather illustration */}
      <g transform="translate(60 88)">
        <path
          d="M0 -30 C 22 -10, 28 18, 16 44 C 12 54, 4 56, 0 56 C -4 56, -12 54, -16 44 C -28 18, -22 -10, 0 -30 Z"
          fill="#ffd14a"
          stroke="#ff9a3a"
          strokeWidth="1.5"
        />
        <path d="M0 -22 L 0 52" stroke="#fff" strokeWidth="1.5" />
      </g>
      {/* Tassle */}
      <line x1="60" y1="20" x2="60" y2="6" stroke="#ffd14a" strokeWidth="2.5" />
      <ellipse cx="60" cy="2" rx="6" ry="4" fill="url(#bm-tassle)" />
    </svg>
  );
}

function PatchSvg({ size, className }: { size: number; className: string }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className} aria-hidden>
      <defs>
        <radialGradient id="patch-bg" cx="50%" cy="40%" r="55%">
          <stop offset="0" stopColor="#ff7ab8" />
          <stop offset="1" stopColor="#3d1aa3" />
        </radialGradient>
        <linearGradient id="patch-gold" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffe48a" />
          <stop offset="1" stopColor="#f0a900" />
        </linearGradient>
      </defs>
      {/* Stitched outer ring */}
      <circle cx="80" cy="80" r="72" fill="url(#patch-gold)" />
      <circle
        cx="80"
        cy="80"
        r="68"
        fill="none"
        stroke="#fff"
        strokeWidth="2.5"
        strokeDasharray="4 3"
      />
      {/* Inner field */}
      <circle cx="80" cy="80" r="58" fill="url(#patch-bg)" />
      {/* Inner stitching */}
      <circle
        cx="80"
        cy="80"
        r="54"
        fill="none"
        stroke="#ffd14a"
        strokeWidth="1.5"
        strokeDasharray="2 2"
      />
      {/* Word Champion ribbon banner */}
      <g transform="translate(0 0)">
        <path
          d="M 28 70 Q 80 60 132 70 L 132 92 Q 80 102 28 92 Z"
          fill="#ffd14a"
          stroke="#f0a900"
          strokeWidth="2"
        />
        <text
          x="80"
          y="87"
          textAnchor="middle"
          fontFamily="var(--font-baloo, sans-serif)"
          fontWeight="800"
          fontSize="14"
          fill="#1a0f3a"
          letterSpacing="0.06em"
        >
          CHAMPION
        </text>
      </g>
      {/* Tiny stars */}
      {[
        [50, 50],
        [110, 50],
        [50, 120],
        [110, 120],
      ].map(([x, y], i) => (
        <Star key={i} cx={x} cy={y} r={4} fill="#fff" />
      ))}
    </svg>
  );
}

function GlitterBadgeSvg({ size, className }: { size: number; className: string }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className} aria-hidden>
      <defs>
        <radialGradient id="gb-glow" cx="50%" cy="40%" r="55%">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.4" stopColor="#ffd14a" />
          <stop offset="1" stopColor="#ff2d8e" />
        </radialGradient>
        <linearGradient id="gb-ribbon" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#b13bff" />
          <stop offset="1" stopColor="#6a2dff" />
        </linearGradient>
      </defs>
      {/* Crown */}
      <path
        d="M 50 28 L 60 16 L 70 28 L 80 14 L 90 28 L 100 16 L 110 28 L 108 40 L 52 40 Z"
        fill="url(#gb-glow)"
        stroke="#f0a900"
        strokeWidth="1.5"
      />
      <circle cx="60" cy="34" r="2" fill="#ff2d8e" />
      <circle cx="80" cy="32" r="2" fill="#b13bff" />
      <circle cx="100" cy="34" r="2" fill="#ff2d8e" />
      {/* Star burst body */}
      <Burst cx={80} cy={92} r={50} spikes={16} fill="url(#gb-glow)" />
      <circle cx="80" cy="92" r="36" fill="#fff" opacity={0.95} />
      {/* M for Members */}
      <text
        x="80"
        y="102"
        textAnchor="middle"
        fontFamily="var(--font-baloo, sans-serif)"
        fontWeight="800"
        fontSize="32"
        fill="url(#gb-ribbon)"
      >
        M
      </text>
      {/* Ribbon tails */}
      <path
        d="M 56 130 L 40 156 L 60 144 L 64 158 L 78 138 Z"
        fill="url(#gb-ribbon)"
      />
      <path
        d="M 104 130 L 120 156 L 100 144 L 96 158 L 82 138 Z"
        fill="url(#gb-ribbon)"
      />
      {/* Glitter dots */}
      {[
        [40, 60],
        [120, 60],
        [30, 100],
        [130, 100],
        [50, 130],
        [110, 130],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="1.5" fill="#fff" />
          <circle cx={x} cy={y} r="3" fill="#fff" opacity="0.3" />
        </g>
      ))}
    </svg>
  );
}

function GoldFrameSvg({ size, className }: { size: number; className: string }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className} aria-hidden>
      <defs>
        <linearGradient id="gf-gold" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff8b0" />
          <stop offset="0.4" stopColor="#ffd14a" />
          <stop offset="0.7" stopColor="#f0a900" />
          <stop offset="1" stopColor="#a86800" />
        </linearGradient>
        <radialGradient id="gf-portrait" cx="50%" cy="40%" r="55%">
          <stop offset="0" stopColor="#ffd6f0" />
          <stop offset="1" stopColor="#a86bff" />
        </radialGradient>
      </defs>
      {/* Outer ornate frame */}
      <circle cx="80" cy="80" r="74" fill="url(#gf-gold)" />
      <circle cx="80" cy="80" r="70" fill="none" stroke="#a86800" strokeWidth="1.5" />
      {/* Ornament leaves */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <g key={deg} transform={`rotate(${deg} 80 80)`}>
          <ellipse cx="80" cy="14" rx="8" ry="14" fill="#fff8b0" stroke="#a86800" strokeWidth="1" />
          <ellipse cx="80" cy="14" rx="3" ry="6" fill="#a86800" />
        </g>
      ))}
      {/* Inner frame band */}
      <circle cx="80" cy="80" r="60" fill="url(#gf-gold)" />
      <circle cx="80" cy="80" r="58" fill="none" stroke="#a86800" strokeWidth="1.5" />
      {/* Portrait window */}
      <circle cx="80" cy="80" r="48" fill="url(#gf-portrait)" />
      {/* Kid silhouette */}
      <g transform="translate(80 76)">
        <circle cx="0" cy="-12" r="14" fill="#5a3320" />
        <path
          d="M -22 24 Q -22 0 0 0 Q 22 0 22 24 L 22 36 L -22 36 Z"
          fill="#6a2dff"
        />
      </g>
      {/* Crown stamp */}
      <text
        x="80"
        y="138"
        textAnchor="middle"
        fontFamily="var(--font-baloo, sans-serif)"
        fontWeight="800"
        fontSize="9"
        fill="#a86800"
        letterSpacing="0.1em"
      >
        ★ MEMBER ★
      </text>
    </svg>
  );
}

function TrophySvg({ size, className }: { size: number; className: string }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className} aria-hidden>
      <defs>
        <linearGradient id="t-gold" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff8b0" />
          <stop offset="1" stopColor="#f0a900" />
        </linearGradient>
      </defs>
      <rect x="60" y="120" width="40" height="24" fill="#a86800" />
      <rect x="48" y="138" width="64" height="16" rx="2" fill="#6a3300" />
      <path
        d="M 40 36 L 120 36 L 116 72 Q 116 110 80 118 Q 44 110 44 72 Z"
        fill="url(#t-gold)"
        stroke="#a86800"
        strokeWidth="2"
      />
      <ellipse cx="80" cy="36" rx="40" ry="8" fill="#ffe48a" stroke="#a86800" strokeWidth="2" />
      <Star cx={80} cy={70} r={14} fill="#fff" />
    </svg>
  );
}

function Star({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const ang = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    points.push(`${cx + Math.cos(ang) * rr},${cy + Math.sin(ang) * rr}`);
  }
  return <polygon points={points.join(" ")} fill={fill} />;
}

function Burst({
  cx,
  cy,
  r,
  spikes,
  fill,
}: {
  cx: number;
  cy: number;
  r: number;
  spikes: number;
  fill: string;
}) {
  const points: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (i * Math.PI) / spikes - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.7;
    points.push(`${cx + Math.cos(ang) * rr},${cy + Math.sin(ang) * rr}`);
  }
  return <polygon points={points.join(" ")} fill={fill} />;
}
