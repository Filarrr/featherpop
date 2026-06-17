"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw, Sparkles, Timer, Trophy } from "lucide-react";
import {
  buzz,
  childCheer,
  ding,
  fanfare,
  pop,
  tick,
  urgentTick,
  wordReveal,
} from "@/lib/audio";
import { Confetti } from "@/components/Confetti";
import { submitFoundWordAction } from "@/lib/park-hunt-actions";

const TIMER_SECONDS = 60;

export function StationGrid({
  stationId,
  words,
  targetWord,
  matchesStation,
}: {
  stationId: number; // 0-indexed (display +1)
  words: string[];
  targetWord: string | null;
  matchesStation: boolean;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<"playing" | "won" | "lost" | "wrong-station">(
    matchesStation ? "playing" : "wrong-station",
  );
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [wrongTap, setWrongTap] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const [nextTarget, setNextTarget] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const tickedRef = useRef(false);

  // Shuffle the 20 words for display so it's not the same grid order
  // every time the kid scans the same QR.
  const shuffled = useMemo(() => {
    const a = words.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, [words]);

  // Countdown timer.
  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      setPhase("lost");
      buzz();
      return;
    }
    const t = window.setTimeout(() => {
      setTimeLeft((s) => s - 1);
      if (timeLeft <= 11) urgentTick();
      else if (timeLeft % 10 === 0) tick();
    }, 1000);
    return () => window.clearTimeout(t);
  }, [phase, timeLeft]);

  // Cheerful entry chord once on mount.
  useEffect(() => {
    if (matchesStation && !tickedRef.current) {
      tickedRef.current = true;
      pop();
    }
  }, [matchesStation]);

  const handleTap = useCallback(
    async (word: string) => {
      if (phase !== "playing" || submitting || !targetWord) return;
      // Optimistic: ding immediately on correct.
      if (word === targetWord) {
        setSubmitting(true);
        ding(1320, 90);
        setConfettiKey((k) => k + 1);
        const res = await submitFoundWordAction({ word, stationId });
        setSubmitting(false);
        if (res.ok) {
          setPhase("won");
          setNextTarget(res.next.word);
          wordReveal();
          window.setTimeout(() => fanfare(), 500);
          window.setTimeout(() => childCheer(), 1100);
        } else {
          // Server rejected (most likely target rotated already) — bail.
          setPhase("lost");
          buzz();
        }
        return;
      }
      // Wrong tap — buzz, brief shake.
      buzz();
      setWrongTap(word);
      window.setTimeout(() => setWrongTap(null), 500);
    },
    [phase, submitting, targetWord, stationId],
  );

  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, "0");
  const urgent = phase === "playing" && timeLeft <= 10;

  if (phase === "wrong-station") {
    return (
      <div className="parkhunt-station parkhunt-station-empty">
        <h2 className="h-display text-3xl">
          <span className="h-gradient">Try another station!</span>
        </h2>
        <p>
          The eagle&apos;s word isn&apos;t at <strong>Station {stationId + 1}</strong>{" "}
          right now. Walk around the park and try a different QR.
        </p>
        <Link href="/park-hunt" className="btn btn-gold btn-lg">
          <RefreshCw aria-hidden className="h-5 w-5" />
          Back to the Eagle
        </Link>
      </div>
    );
  }

  return (
    <div className="parkhunt-station">
      <Confetti trigger={confettiKey} pieces={50} />

      <header className="parkhunt-station-hud">
        <span className="kicker">Station {stationId + 1}</span>
        <p className="parkhunt-station-find">
          Find <strong>{targetWord}</strong>
        </p>
        <span className={`parkhunt-timer ${urgent ? "is-urgent" : ""}`}>
          <Timer aria-hidden className="h-4 w-4" />
          {minutes}:{seconds}
        </span>
      </header>

      <div className="parkhunt-grid">
        {shuffled.map((w) => (
          <button
            key={w}
            type="button"
            disabled={phase !== "playing" || submitting}
            onClick={() => handleTap(w)}
            className={`parkhunt-word ${wrongTap === w ? "is-wrong" : ""} ${
              phase === "won" && w === targetWord ? "is-found" : ""
            }`}
            aria-label={`Word ${w}`}
          >
            {w}
          </button>
        ))}
      </div>

      {phase === "won" ? (
        <div className="parkhunt-station-result is-win">
          <Trophy aria-hidden className="h-7 w-7" />
          <h2 className="h-display text-3xl">
            Great job! You found <span className="h-gradient">{targetWord}</span>
          </h2>
          <p>+1 feather earned!</p>
          <div className="parkhunt-station-actions">
            <Link href="/park-hunt" className="btn btn-gold btn-lg btn-pulse">
              <Sparkles aria-hidden className="h-5 w-5" />
              Next word{nextTarget ? `: ${nextTarget}` : ""}
            </Link>
            <Link href="/" className="btn btn-ghost">
              Done for now
            </Link>
          </div>
        </div>
      ) : null}

      {phase === "lost" ? (
        <div className="parkhunt-station-result is-lose">
          <h2 className="h-display text-3xl">Time&apos;s up — try again!</h2>
          <p>The eagle still has a word waiting for you.</p>
          <div className="parkhunt-station-actions">
            <Link href="/park-hunt" className="btn btn-gold btn-lg">
              <RefreshCw aria-hidden className="h-5 w-5" />
              Back to the Eagle
            </Link>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="btn btn-ghost"
            >
              Try this station again
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
