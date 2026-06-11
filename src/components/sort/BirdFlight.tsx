"use client";

import { useEffect, useState } from "react";

/**
 * Bird flies along a curved path across the top of the screen, dragging a
 * parchment banner. After the path finishes, the parchment lands center and
 * unrolls to reveal the key word. onReveal fires after the unroll completes.
 *
 * Asset preference:
 *  1) /media/sort/bird-fly-frames.png  — 4×2 sprite-sheet, animated with
 *     CSS steps() for a real wing-flap.
 *  2) /media/sort/bird-fly.png         — single hero, gentle bob only.
 *  3) Inline SVG                       — fully procedural fallback.
 */
export function BirdFlight({
  word,
  onReveal,
}: {
  word: string;
  onReveal?: () => void;
}) {
  const [phase, setPhase] = useState<"flying" | "dropping" | "reveal">("flying");
  const [birdAsset, setBirdAsset] = useState<"sprite" | "hero" | "svg">("svg");

  // Probe which bird asset is available, in preference order.
  useEffect(() => {
    let cancelled = false;
    const tryLoad = (src: string) =>
      new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
      });
    (async () => {
      if (await tryLoad("/media/sort/bird-fly-frames.png")) {
        if (!cancelled) setBirdAsset("sprite");
        return;
      }
      if (await tryLoad("/media/sort/bird-fly.png")) {
        if (!cancelled) setBirdAsset("hero");
        return;
      }
      if (!cancelled) setBirdAsset("svg");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("dropping"), 3400);
    const t2 = window.setTimeout(() => {
      setPhase("reveal");
      onReveal?.();
    }, 4800);
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
        {birdAsset === "sprite" ? (
          <div className="bird-sprite" aria-hidden />
        ) : birdAsset === "hero" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/media/sort/bird-fly.png"
            alt=""
            className="bird-hero-img"
            draggable={false}
          />
        ) : (
          <BirdSvg />
        )}

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
      <path d="M30 60 Q 12 64 6 80 Q 18 70 38 70 Z" fill="#6a2dff" />
      <ellipse cx="90" cy="65" rx="55" ry="32" fill="url(#bird-body)" />
      <ellipse cx="90" cy="78" rx="38" ry="14" fill="#ffd6f0" opacity={0.8} />
      <circle cx="148" cy="48" r="26" fill="url(#bird-body)" />
      <path d="M170 50 L 200 56 L 170 60 Z" fill="#ffd14a" stroke="#f0a900" strokeWidth={1} />
      <circle cx="156" cy="42" r="5" fill="#1a0f3a" />
      <circle cx="158" cy="40" r="1.6" fill="#fff" />
      <g className="bird-wing">
        <path
          d="M80 50 Q 60 10 100 12 Q 130 18 110 56 Z"
          fill="url(#bird-wing)"
          stroke="#ff2d8e"
          strokeOpacity={0.4}
          strokeWidth={1}
        />
      </g>
    </svg>
  );
}

function ParchmentBanner({ word, phase }: { word: string; phase: string }) {
  const [parchFallback, setParchFallback] = useState(false);
  return (
    <div className={`bird-banner phase-${phase}`}>
      {!parchFallback ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/media/sort/banner-parchment.png"
          alt=""
          className="bird-banner-img"
          draggable={false}
          onError={() => setParchFallback(true)}
        />
      ) : (
        <svg viewBox="0 0 360 140" className="bird-banner-svg" aria-hidden>
          <defs>
            <linearGradient id="parch" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#fff7e6" />
              <stop offset="1" stopColor="#ffe9b8" />
            </linearGradient>
          </defs>
          <path
            d="M 30 30 Q 40 18 60 22 L 300 22 Q 320 18 330 30 L 330 110 Q 320 122 300 118 L 60 118 Q 40 122 30 110 Z"
            fill="url(#parch)"
            stroke="#c98a2a"
            strokeWidth={2}
          />
          <path d="M22 50 L 36 70 L 22 90 L 12 70 Z" fill="#ff2d8e" stroke="#b30055" strokeWidth={1} />
          <path d="M338 50 L 324 70 L 338 90 L 348 70 Z" fill="#ff2d8e" stroke="#b30055" strokeWidth={1} />
        </svg>
      )}
      <span className="bird-banner-word">{word}</span>
    </div>
  );
}
