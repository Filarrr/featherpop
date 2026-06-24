"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Home, Sparkles } from "lucide-react";
import { spinWheelAction, type SpinPrize } from "@/lib/child-progress-actions";
import { childCheer, fanfare, pop, wordReveal } from "@/lib/audio";
import { useActiveChild } from "@/lib/use-active-child";
import { Confetti } from "@/components/Confetti";

interface PrizeMeta {
  id: SpinPrize;
  label: string;
  emoji: string;
}

const SLICE_COLORS = [
  "#ff7ab8",
  "#ffd14a",
  "#4cc4ff",
  "#a76bff",
  "#34e3a4",
  "#ff9a3a",
  "#b13bff",
];

export function SpinWheelClient({ prizes }: { prizes: PrizeMeta[] }) {
  const { progress } = useActiveChild();
  const freeSpins = progress.freeSpins ?? 0;
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<PrizeMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);

  const slices = useMemo(() => prizes, [prizes]);
  const sliceAngle = 360 / Math.max(slices.length, 1);

  async function spin() {
    if (spinning || freeSpins <= 0) return;
    setError(null);
    setResult(null);
    setSpinning(true);
    pop();

    // Hit the server first so the result is server-decided (not
    // client-chosen). We then animate the wheel TO that slice.
    const res = await spinWheelAction();
    if (!res.ok) {
      setError(res.reason);
      setSpinning(false);
      return;
    }

    // Compute the final rotation so the chosen prize lands at the top.
    // The pointer is at 12 o'clock (angle 0); we want the center of
    // the chosen slice to align there. Add several full turns for
    // visual spin.
    const idx = slices.findIndex((p) => p.id === res.prize.id);
    const target = idx >= 0 ? idx : 0;
    const sliceCenter = target * sliceAngle + sliceAngle / 2;
    const spins = 6; // full turns before stopping
    const finalRotation = spins * 360 - sliceCenter;
    setRotation(finalRotation);

    // Reveal after the CSS transition completes (3.5s).
    window.setTimeout(() => {
      setResult({ id: res.prize.id, label: res.prize.label, emoji: res.prize.emoji });
      setConfettiKey((k) => k + 1);
      wordReveal();
      window.setTimeout(() => fanfare(), 400);
      window.setTimeout(() => childCheer(), 1000);
      setSpinning(false);
    }, 3600);
  }

  return (
    <div className="spin-shell">
      <Confetti trigger={confettiKey} pieces={70} />

      <header className="spin-header">
        <span className="kicker">
          <Sparkles aria-hidden className="h-4 w-4" />
          Spin Wheel
        </span>
        <h1 className="h-display text-3xl">
          <span className="h-gradient">
            {freeSpins > 0
              ? `You have ${freeSpins} ${freeSpins === 1 ? "spin" : "spins"}`
              : "No spins left"}
          </span>
        </h1>
        <p className="text-[var(--ink-soft)]">
          Earn a free spin every time an egg hatches (50 words read).
        </p>
      </header>

      <div className="spin-stage">
        <div className="spin-pointer" aria-hidden>▼</div>
        <svg
          viewBox="0 0 400 400"
          className={`spin-wheel ${spinning ? "is-spinning" : ""}`}
          style={{
            transform: `rotate(${rotation}deg)`,
          }}
          aria-label="Spin wheel"
        >
          {slices.map((p, i) => {
            const start = i * sliceAngle;
            const end = (i + 1) * sliceAngle;
            const fill = SLICE_COLORS[i % SLICE_COLORS.length];
            // SVG arc path for the slice.
            const cx = 200,
              cy = 200,
              r = 180;
            const startRad = ((start - 90) * Math.PI) / 180;
            const endRad = ((end - 90) * Math.PI) / 180;
            const x1 = cx + r * Math.cos(startRad);
            const y1 = cy + r * Math.sin(startRad);
            const x2 = cx + r * Math.cos(endRad);
            const y2 = cy + r * Math.sin(endRad);
            const largeArc = sliceAngle > 180 ? 1 : 0;
            const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            // Label position halfway between center and edge.
            const midRad = ((start + sliceAngle / 2 - 90) * Math.PI) / 180;
            const lx = cx + r * 0.62 * Math.cos(midRad);
            const ly = cy + r * 0.62 * Math.sin(midRad);
            return (
              <g key={p.id}>
                <path d={path} fill={fill} stroke="#ffffff" strokeWidth="3" />
                <g
                  transform={`translate(${lx} ${ly}) rotate(${start + sliceAngle / 2})`}
                >
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="34"
                    fontWeight={800}
                    fill="#ffffff"
                    style={{ filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.35))" }}
                  >
                    {p.emoji}
                  </text>
                </g>
              </g>
            );
          })}
          {/* Hub circle */}
          <circle cx="200" cy="200" r="32" fill="#1a0f3a" stroke="#fff" strokeWidth="4" />
          <text
            x="200"
            y="207"
            textAnchor="middle"
            fontSize="22"
            fontWeight={800}
            fill="#ffd14a"
          >
            SPIN
          </text>
        </svg>
      </div>

      <div className="spin-actions">
        <button
          type="button"
          onClick={spin}
          disabled={spinning || freeSpins <= 0}
          className="btn btn-gold btn-lg btn-pulse"
        >
          {spinning ? "Spinning…" : freeSpins > 0 ? "Spin!" : "Hatch an egg for a spin"}
        </button>
        <Link href="/" className="btn btn-ghost">
          <Home aria-hidden className="h-5 w-5" />
          Home
        </Link>
      </div>

      {error ? <p className="spin-error">{error}</p> : null}

      {result ? (
        <div className="spin-result" role="status">
          <p className="kicker">You won!</p>
          <h2 className="h-display text-3xl">
            <span style={{ marginRight: "0.5rem" }}>{result.emoji}</span>
            <span className="h-gradient">{result.label}</span>
          </h2>
          <p className="text-[var(--ink-soft)]">
            {result.id.startsWith("feathers-")
              ? "Added to your FeatherPop wallet."
              : "A grown-up will help you claim this prize."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
