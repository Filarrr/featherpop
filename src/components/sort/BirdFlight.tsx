"use client";

import { useEffect, useState } from "react";

/**
 * Bird flies along a curved path across the top of the screen, dragging a
 * parchment banner. After the path finishes, the parchment lands center and
 * unrolls to reveal the key word. onReveal fires after the unroll completes
 * so the caller can show the "Tap to play Letter Pop" CTA.
 */
export function BirdFlight({
  word,
  onReveal,
}: {
  word: string;
  onReveal?: () => void;
}) {
  const [phase, setPhase] = useState<"flying" | "dropping" | "reveal">("flying");

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("dropping"), 2200);
    const t2 = window.setTimeout(() => {
      setPhase("reveal");
      onReveal?.();
    }, 3400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onReveal]);

  return (
    <div className="bird-stage" aria-live="polite">
      <div className="bird-bg-streaks" aria-hidden>
        <span />
        <span />
        <span />
      </div>

      <div className={`bird-flier is-${phase}`}>
        <BirdSvg />
        <div className="bird-banner-string" aria-hidden />
        <ParchmentBanner word={word} phase={phase} />
      </div>

      {phase === "reveal" ? (
        <div className="bird-burst" aria-hidden>
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} style={{ ["--i" as string]: i }} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function BirdSvg() {
  return (
    <svg viewBox="0 0 220 120" width={180} height={100} className="bird-svg" aria-hidden>
      <defs>
        <linearGradient id="bird-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ff7ab8" />
          <stop offset="0.5" stopColor="#b13bff" />
          <stop offset="1" stopColor="#6a2dff" />
        </linearGradient>
        <linearGradient id="bird-wing" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffd14a" />
          <stop offset="1" stopColor="#ff2d8e" />
        </linearGradient>
      </defs>
      {/* tail */}
      <path
        d="M30 60 Q 12 64 6 80 Q 18 70 38 70 Z"
        fill="#6a2dff"
      />
      {/* body */}
      <ellipse cx="90" cy="65" rx="55" ry="32" fill="url(#bird-body)" />
      {/* belly */}
      <ellipse cx="90" cy="78" rx="38" ry="14" fill="#ffd6f0" opacity={0.8} />
      {/* head */}
      <circle cx="148" cy="48" r="26" fill="url(#bird-body)" />
      {/* beak */}
      <path d="M170 50 L 200 56 L 170 60 Z" fill="#ffd14a" stroke="#f0a900" strokeWidth={1} />
      {/* eye */}
      <circle cx="156" cy="42" r="5" fill="#1a0f3a" />
      <circle cx="158" cy="40" r="1.6" fill="#fff" />
      {/* wing (animated flap via CSS) */}
      <g className="bird-wing">
        <path
          d="M80 50 Q 60 10 100 12 Q 130 18 110 56 Z"
          fill="url(#bird-wing)"
          stroke="#ff2d8e"
          strokeOpacity={0.4}
          strokeWidth={1}
        />
      </g>
      {/* sparkles */}
      <g opacity={0.85}>
        <circle cx="40" cy="40" r="1.8" fill="#fff" />
        <circle cx="60" cy="95" r="1.4" fill="#fff" />
        <circle cx="180" cy="80" r="1.4" fill="#fff" />
      </g>
    </svg>
  );
}

function ParchmentBanner({ word, phase }: { word: string; phase: string }) {
  return (
    <div className={`bird-banner phase-${phase}`}>
      <svg viewBox="0 0 360 140" className="bird-banner-svg" aria-hidden>
        <defs>
          <linearGradient id="parch" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff7e6" />
            <stop offset="1" stopColor="#ffe9b8" />
          </linearGradient>
        </defs>
        {/* paper */}
        <path
          d="M 30 30 Q 40 18 60 22 L 300 22 Q 320 18 330 30 L 330 110 Q 320 122 300 118 L 60 118 Q 40 122 30 110 Z"
          fill="url(#parch)"
          stroke="#c98a2a"
          strokeWidth={2}
        />
        {/* ribbon ties */}
        <path
          d="M22 50 L 36 70 L 22 90 L 12 70 Z"
          fill="#ff2d8e"
          stroke="#b30055"
          strokeWidth={1}
        />
        <path
          d="M338 50 L 324 70 L 338 90 L 348 70 Z"
          fill="#ff2d8e"
          stroke="#b30055"
          strokeWidth={1}
        />
        {/* inner border */}
        <path
          d="M 50 36 L 310 36 L 310 104 L 50 104 Z"
          fill="none"
          stroke="#c98a2a"
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.55}
        />
      </svg>
      <span className="bird-banner-word">{word}</span>
    </div>
  );
}
