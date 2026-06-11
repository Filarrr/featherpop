"use client";

import { useEffect, useState } from "react";

/**
 * Cute (not scary) spider drops from the top on a silk thread, walks down,
 * mouth opens, letters get chomped. onDone fires when the chomp finishes.
 *
 * Asset preference:
 *  - /media/sort/spider-creep.png   — drop-in pose (idle, mouth closed)
 *  - /media/sort/spider-eating.png  — chomping pose (mouth open with letter)
 *  Inline SVG fallback covers both.
 */
export function Spider({
  letters,
  onDone,
}: {
  letters: string[];
  onDone?: () => void;
}) {
  const [eaten, setEaten] = useState(0);
  const [imgFallback, setImgFallback] = useState(false);

  useEffect(() => {
    if (eaten >= letters.length) {
      const t = window.setTimeout(() => onDone?.(), 900);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setEaten((n) => n + 1), 380);
    return () => window.clearTimeout(t);
  }, [eaten, letters.length, onDone]);

  const eating = eaten > 0 && eaten <= letters.length;

  return (
    <div className="spider-stage" aria-live="polite">
      <div className="spider-letters" aria-hidden>
        {letters.map((l, i) => (
          <span
            key={`${i}-${l}`}
            className={`spider-letter ${i < eaten ? "is-eaten" : ""}`}
          >
            {l}
          </span>
        ))}
      </div>

      <div className="spider-thread" aria-hidden />
      <div className="spider-walker">
        {!imgFallback ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={
              eating
                ? "/media/sort/spider-eating.png"
                : "/media/sort/spider-creep.png"
            }
            alt=""
            className="spider-img"
            draggable={false}
            onError={() => setImgFallback(true)}
          />
        ) : (
          <SpiderSvg eating={eating} />
        )}
      </div>

      <p className="spider-caption">Oh no — the letter-spider got them!</p>
    </div>
  );
}

function SpiderSvg({ eating }: { eating: boolean }) {
  return (
    <svg viewBox="0 0 160 140" width={160} height={140} className="spider-svg" aria-hidden>
      <defs>
        <radialGradient id="spider-body" cx="50%" cy="40%" r="55%">
          <stop offset="0" stopColor="#3a2a55" />
          <stop offset="1" stopColor="#1a0f3a" />
        </radialGradient>
      </defs>
      {[
        "M40 80 Q 12 70 4 92",
        "M40 88 Q 8 90 6 112",
        "M48 92 Q 22 110 28 130",
        "M64 96 Q 56 120 70 132",
        "M96 96 Q 104 120 88 132",
        "M112 92 Q 138 110 132 130",
        "M120 88 Q 152 90 154 112",
        "M120 80 Q 148 70 156 92",
      ].map((d, i) => (
        <path
          key={i}
          d={d}
          stroke="#1a0f3a"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          className={`spider-leg leg-${i}`}
        />
      ))}
      <ellipse cx="80" cy="80" rx="36" ry="30" fill="url(#spider-body)" />
      <path d="M68 56 Q 80 38 92 56 Q 86 50 80 52 Q 74 50 68 56 Z" fill="#b13bff" />
      <circle cx="80" cy="50" r="3" fill="#ff2d8e" />
      <circle cx="68" cy="74" r="8" fill="#fff" />
      <circle cx="92" cy="74" r="8" fill="#fff" />
      <circle cx="68" cy="76" r="4" fill="#1a0f3a" />
      <circle cx="92" cy="76" r="4" fill="#1a0f3a" />
      <circle cx="69" cy="74" r="1.4" fill="#fff" />
      <circle cx="93" cy="74" r="1.4" fill="#fff" />
      {eating ? (
        <>
          <ellipse cx="80" cy="92" rx="10" ry="7" fill="#3a0010" />
          <path d="M76 88 L 78 96" stroke="#fff" strokeWidth={1.5} />
          <path d="M84 88 L 82 96" stroke="#fff" strokeWidth={1.5} />
        </>
      ) : (
        <path
          d="M70 92 Q 80 100 90 92"
          stroke="#fff"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
      )}
      <path d="M86 96 L 88 102 L 90 96 Z" fill="#fff" />
    </svg>
  );
}
