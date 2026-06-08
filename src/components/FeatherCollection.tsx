"use client";

import Link from "next/link";
import { Lock, Trophy } from "lucide-react";
import { useActiveChild } from "@/lib/use-active-child";
import { totalFeathers } from "@/lib/child-profile";
import { FEATHER_META, FEATHER_ORDER, levelFor, nextLevel } from "@/lib/levels";

function FeatherGlyph({ color, locked }: { color: string; locked: boolean }) {
  return (
    <svg viewBox="0 0 64 96" className="feather-glyph" aria-hidden>
      <defs>
        <linearGradient id={`fg-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={locked ? 0.25 : 0.9} />
          <stop offset="1" stopColor={color} stopOpacity={locked ? 0.4 : 1} />
        </linearGradient>
      </defs>
      <path
        d="M32 4 C 48 18, 56 38, 50 64 C 47 78, 39 88, 32 92 C 25 88, 17 78, 14 64 C 8 38, 16 18, 32 4 Z"
        fill={locked ? "transparent" : `url(#fg-${color})`}
        stroke={color}
        strokeWidth={locked ? 2.5 : 1.5}
        strokeOpacity={locked ? 0.55 : 0.85}
      />
      <path
        d="M32 14 L 32 86"
        stroke={locked ? color : "#ffffff"}
        strokeOpacity={locked ? 0.4 : 0.7}
        strokeWidth={1.5}
      />
      {!locked
        ? [18, 30, 42, 56, 70].map((y) => (
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
          ))
        : null}
    </svg>
  );
}

export function FeatherCollection() {
  const { progress, activeChildId } = useActiveChild();

  if (!activeChildId) {
    return (
      <div className="feather-collection">
        <p className="text-[var(--ink-soft)]">
          Pick a child profile to start a feather collection.{" "}
          <Link href="/account/profiles" style={{ color: "var(--gold)", fontWeight: 700 }}>
            Choose →
          </Link>
        </p>
      </div>
    );
  }

  const total = totalFeathers(progress);
  const level = levelFor(total);
  const next = nextLevel(total);
  const span = next ? Math.max(1, next.min - level.min) : 1;
  const pct = next
    ? Math.min(100, Math.round(((total - level.min) / span) * 100))
    : 100;
  const unlockedTypes = FEATHER_ORDER.filter((f) => (progress.feathers[f] ?? 0) > 0).length;

  return (
    <div className="feather-collection">
      <header className="feather-collection-head">
        <span className="kicker">
          <Trophy aria-hidden className="h-4 w-4" />
          Your feathers
        </span>
        <h1 className="h-display text-3xl">{level.title}</h1>
        <p className="text-[var(--ink-soft)]">
          <strong>{total}</strong> feathers · <strong>{unlockedTypes}</strong> of{" "}
          {FEATHER_ORDER.length} types unlocked
          {next ? (
            <>
              {" "}
              · {next.min - total} more to <strong>{next.title}</strong>
            </>
          ) : (
            <> · Top level!</>
          )}
        </p>
        <div className="level-progress" aria-hidden>
          <span style={{ width: `${pct}%` }} />
        </div>
      </header>

      <div className="feather-grid">
        {FEATHER_ORDER.map((f) => {
          const m = FEATHER_META[f];
          const n = progress.feathers[f] ?? 0;
          const unlocked = n > 0;
          return (
            <article
              key={f}
              className={`feather-tile ${unlocked ? "is-unlocked" : "is-locked"}`}
              style={{
                ["--feather-color" as string]: m.color,
                ["--feather-glow" as string]: m.glow,
              }}
            >
              <div className="feather-tile-art">
                <FeatherGlyph color={m.color} locked={!unlocked} />
                {!unlocked ? (
                  <span className="feather-tile-lock" aria-label="Locked">
                    <Lock aria-hidden className="h-4 w-4" />
                  </span>
                ) : null}
              </div>
              <h3>{m.name}</h3>
              <p>{unlocked ? m.description : "Earn this one!"}</p>
              <span className="feather-tile-count">
                {unlocked ? `×${n}` : "Locked"}
              </span>
            </article>
          );
        })}
      </div>
    </div>
  );
}
