"use client";

// The BIG celebration for hitting 1,000 words in a month — the Golden
// Feather. Rarest achievement in the app, so it gets the full treatment:
// golden rays, a rising feather, sparkles, confetti and a fanfare, plus a
// direct link to print the certificate.

import { useEffect } from "react";
import Link from "next/link";
import { Crown, Printer, X } from "lucide-react";
import { Confetti } from "@/components/Confetti";
import { childCheer, eagleVoice, fanfare, pop, wordReveal } from "@/lib/audio";

export function GoldenFeatherReveal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    pop();
    const t1 = window.setTimeout(() => wordReveal(), 250);
    const t2 = window.setTimeout(() => fanfare(), 800);
    const t3 = window.setTimeout(() => eagleVoice(), 1600);
    const t4 = window.setTimeout(() => childCheer(), 2400);
    return () => [t1, t2, t3, t4].forEach(window.clearTimeout);
  }, []);

  return (
    <div
      className="golden-reveal"
      role="dialog"
      aria-labelledby="golden-reveal-title"
    >
      <Confetti trigger={Date.now()} pieces={120} />
      <div className="golden-reveal-rays" aria-hidden />

      <div className="golden-reveal-card">
        <button
          type="button"
          className="golden-reveal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X aria-hidden className="h-5 w-5" />
        </button>

        <p className="golden-reveal-kicker">
          <Crown aria-hidden className="h-4 w-4" />
          1,000 WORDS THIS MONTH!
        </p>

        <div className="golden-reveal-art">
          <span className="golden-reveal-halo" aria-hidden />
          <GoldenFeatherArt size={150} />
          <span className="golden-reveal-sparkles" aria-hidden>
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} style={{ ["--i" as string]: i }} />
            ))}
          </span>
        </div>

        <h2 id="golden-reveal-title" className="golden-reveal-title">
          GOLDEN FEATHER
        </h2>
        <p className="golden-reveal-tag">
          The rarest reward of all — and you earned it.
        </p>
        <p className="golden-reveal-meta">
          <strong>+500 FeatherPop</strong> · Champion badge added to your avatar
        </p>

        <div className="golden-reveal-actions">
          <Link
            href="/print/golden-feather"
            className="btn btn-gold btn-lg btn-pulse"
          >
            <Printer aria-hidden className="h-5 w-5" />
            Print my certificate
          </Link>
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Keep reading!
          </button>
        </div>
      </div>
    </div>
  );
}

/** Standalone golden feather (own gradient ids so it can co-exist on a page). */
export function GoldenFeatherArt({ size = 150 }: { size?: number }) {
  return (
    <svg
      className="golden-reveal-feather"
      viewBox="0 0 200 220"
      width={size}
      height={(size * 220) / 200}
      aria-hidden
    >
      <defs>
        <linearGradient id="gfr-feather" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff8b0" />
          <stop offset="0.5" stopColor="#ffd14a" />
          <stop offset="1" stopColor="#f0a900" />
        </linearGradient>
        <linearGradient id="gfr-shine" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.7} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
          <stop offset="1" stopColor="#fff" stopOpacity={0.35} />
        </linearGradient>
      </defs>
      <g transform="translate(100 28)">
        <path
          d="M 0 0 C 38 28, 48 64, 36 124 C 32 144, 18 158, 0 168 C -18 158, -32 144, -36 124 C -48 64, -38 28, 0 0 Z"
          fill="url(#gfr-feather)"
          stroke="#a86800"
          strokeWidth="2"
        />
        <path
          d="M 0 0 C 38 28, 48 64, 36 124 C 32 144, 18 158, 0 168 C -18 158, -32 144, -36 124 C -48 64, -38 28, 0 0 Z"
          fill="url(#gfr-shine)"
        />
        <path d="M 0 4 L 0 162" stroke="#a86800" strokeWidth="2" />
        {Array.from({ length: 9 }).map((_, i) => {
          const y = 18 + i * 16;
          return (
            <g key={i}>
              <path
                d={`M 0 ${y} Q -16 ${y + 6} -28 ${y + 16}`}
                stroke="#a86800"
                strokeWidth="1.2"
                fill="none"
                opacity={0.55}
              />
              <path
                d={`M 0 ${y} Q 16 ${y + 6} 28 ${y + 16}`}
                stroke="#a86800"
                strokeWidth="1.2"
                fill="none"
                opacity={0.55}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
