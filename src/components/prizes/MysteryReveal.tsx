"use client";

// Mystery box reveal — the loot-box unwrap experience.
// Phases:
//   1. closed:    wrapped box bobs gently, "tap to open"
//   2. shaking:   user tapped, box shakes + ribbons unwind
//   3. burst:     box bursts open, confetti, glow
//   4. open:      revealed payload card slides up
//
// The actual payload comes in as a prop. We just animate the reveal.

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Confetti } from "@/components/Confetti";
import { childCheer, fanfare, pop, wordReveal } from "@/lib/audio";

interface Props {
  payload: {
    label: string;
    emoji: string;
    sub?: string;
  };
  onOpen?: () => void;
  children: React.ReactNode; // the rendered prize (card, coloring preview, etc.)
}

type Phase = "closed" | "shaking" | "burst" | "open";

export function MysteryReveal({ payload, onOpen, children }: Props) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [confettiKey, setConfettiKey] = useState(0);

  function startReveal() {
    if (phase !== "closed") return;
    pop();
    setPhase("shaking");
    window.setTimeout(() => {
      setPhase("burst");
      setConfettiKey((k) => k + 1);
      wordReveal();
      window.setTimeout(() => fanfare(), 350);
      window.setTimeout(() => childCheer(), 900);
    }, 1200);
    window.setTimeout(() => {
      setPhase("open");
      onOpen?.();
    }, 1900);
  }

  return (
    <div className="mystery-reveal-shell">
      <Confetti trigger={confettiKey} pieces={90} />

      {phase !== "open" ? (
        <button
          type="button"
          className={`mystery-box mystery-box--${phase}`}
          onClick={startReveal}
          aria-label="Open the mystery box"
        >
          <svg viewBox="0 0 220 220" width={240} height={240} aria-hidden>
            <defs>
              <linearGradient id="mb-body" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#ff9a3a" />
                <stop offset="1" stopColor="#ff6b3a" />
              </linearGradient>
              <linearGradient id="mb-ribbon" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#ffe48a" />
                <stop offset="1" stopColor="#ffd14a" />
              </linearGradient>
              <radialGradient id="mb-glow" cx="50%" cy="50%" r="60%">
                <stop offset="0" stopColor="#fff" stopOpacity={0.95} />
                <stop offset="0.5" stopColor="#ffd14a" stopOpacity={0.55} />
                <stop offset="1" stopColor="#ffd14a" stopOpacity={0} />
              </radialGradient>
            </defs>

            {/* Halo glow — pulses during shaking */}
            <circle cx="110" cy="110" r="92" fill="url(#mb-glow)" className="mystery-box-halo" />

            {/* Box body */}
            <rect x="48" y="92" width="124" height="96" rx="10" fill="url(#mb-body)" stroke="#1a0f3a" strokeOpacity={0.2} strokeWidth="2" />
            {/* Lid */}
            <rect className="mystery-box-lid" x="40" y="76" width="140" height="26" rx="6" fill="url(#mb-body)" stroke="#1a0f3a" strokeOpacity={0.2} strokeWidth="2" />
            {/* Vertical ribbon */}
            <rect x="98" y="76" width="24" height="112" fill="url(#mb-ribbon)" />
            <rect x="98" y="76" width="24" height="3" fill="#fff" opacity={0.4} />
            {/* Horizontal ribbon */}
            <rect x="40" y="84" width="140" height="10" fill="url(#mb-ribbon)" />
            {/* Bow */}
            <g className="mystery-box-bow" transform="translate(110 72)">
              <ellipse cx="-16" cy="0" rx="16" ry="11" fill="url(#mb-ribbon)" stroke="#1a0f3a" strokeOpacity={0.25} strokeWidth="1.5" />
              <ellipse cx="16" cy="0" rx="16" ry="11" fill="url(#mb-ribbon)" stroke="#1a0f3a" strokeOpacity={0.25} strokeWidth="1.5" />
              <circle cx="0" cy="0" r="7" fill="url(#mb-ribbon)" stroke="#1a0f3a" strokeOpacity={0.25} strokeWidth="1.5" />
            </g>
            {/* Question mark on box face */}
            <text
              x="110"
              y="158"
              textAnchor="middle"
              fontSize="48"
              fontWeight={800}
              fill="#fff"
              fontFamily="var(--font-baloo, sans-serif)"
              style={{ filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.25))" }}
            >
              ?
            </text>
          </svg>

          <span className="mystery-box-cta">
            {phase === "closed" ? "Tap to open!" : phase === "shaking" ? "Opening…" : "✨"}
          </span>
        </button>
      ) : null}

      {phase === "open" ? (
        <div className="mystery-reveal-payload">
          <span className="mystery-reveal-eyebrow">
            <Sparkles aria-hidden className="h-4 w-4" />
            You unwrapped!
          </span>
          <div className="mystery-reveal-emoji" aria-hidden>
            {payload.emoji}
          </div>
          <h2 className="mystery-reveal-title">{payload.label}</h2>
          {payload.sub ? <p className="mystery-reveal-sub">{payload.sub}</p> : null}
          {children}
        </div>
      ) : null}
    </div>
  );
}
