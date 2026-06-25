"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw, Sparkles, Timer, Trophy } from "lucide-react";
import {
  buzz,
  childCheer,
  ding,
  eagleCheers,
  fanfare,
  pop,
  spiderVoice,
  tick,
  urgentTick,
  wordReveal,
} from "@/lib/audio";
import { Confetti } from "@/components/Confetti";
import { submitFoundWordAction } from "@/lib/park-hunt-actions";
import { EggHatchReveal } from "@/components/eggs/EggHatchReveal";
import { EggCrackReveal } from "@/components/eggs/EggCrackReveal";
import type { EggColor, HatchedEntry } from "@/lib/child-profile";

const TIMER_SECONDS = 60;

export function StationGrid({
  stationId,
  words,
  targetWord,
  matchesStation,
  triesRemaining,
  outOfTries,
}: {
  stationId: number; // 0-indexed (display +1)
  words: string[];
  targetWord: string | null;
  matchesStation: boolean;
  triesRemaining: number;
  outOfTries: boolean;
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
  const [hatched, setHatched] = useState<HatchedEntry | null>(null);
  const [crackMilestone, setCrackMilestone] = useState<{
    level: number;
    label: string;
    message: string;
    color: EggColor;
    wordsInEgg: number;
  } | null>(null);
  const tickedRef = useRef(false);
  const spiderWarnedRef = useRef(false);

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
      // Spider warning at 15s remaining (once).
      if (timeLeft === 15 && !spiderWarnedRef.current) {
        spiderWarnedRef.current = true;
        spiderVoice(); // 'Oh no, let's hurry up before the spider comes!'
      }
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
          // Hatched payload — show the egg reveal overlay on top of the
          // win screen so the kid sees the new character + free spin.
          if (res.hatched) setHatched(res.hatched);
          else if (res.crackJustCrossed) setCrackMilestone(res.crackJustCrossed);
          wordReveal();
          window.setTimeout(() => fanfare(), 500);
          // Chanel: 'Yes! Feathers up and let's find the word!'
          window.setTimeout(() => eagleCheers(), 1100);
          window.setTimeout(() => childCheer(), 6600);
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
    // Out of tries → server already rotated to a new target. Tell the
    // kid the eagle gave up + show the new word they're hunting now.
    if (outOfTries) {
      return (
        <div className="parkhunt-station parkhunt-station-empty">
          <h2 className="h-display text-3xl">
            <span className="h-gradient">Out of tries this round!</span>
          </h2>
          <p>
            The eagle has a new word ready for you:{" "}
            <strong>{targetWord ?? "…"}</strong>
          </p>
          <Link href="/park-hunt" className="btn btn-gold btn-lg">
            <RefreshCw aria-hidden className="h-5 w-5" />
            Back to the Eagle
          </Link>
        </div>
      );
    }
    const triesText =
      triesRemaining === 1
        ? "1 try left"
        : `${triesRemaining} tries left`;
    return (
      <div className="parkhunt-station parkhunt-station-empty">
        <h2 className="h-display text-3xl">
          <span className="h-gradient">Try another station!</span>
        </h2>
        <p>
          The eagle&apos;s word isn&apos;t at <strong>Station {stationId + 1}</strong>{" "}
          — walk around and scan a different QR.
        </p>
        <p className="parkhunt-tries">
          <strong>{triesText}</strong> before the eagle rotates the word.
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

      {hatched ? (
        <EggHatchReveal hatched={hatched} onClose={() => setHatched(null)} />
      ) : crackMilestone ? (
        <EggCrackReveal
          {...crackMilestone}
          onClose={() => setCrackMilestone(null)}
        />
      ) : null}

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
          <span className="parkhunt-station-result-eyebrow">
            <Sparkles aria-hidden className="h-4 w-4" />
            QUEST COMPLETE
          </span>
          <h2 className="h-display text-3xl">
            You found{" "}
            <span className="h-gradient">{targetWord}</span>!
          </h2>
          <p className="parkhunt-station-result-sub">
            Now spell it out in <strong>Letter Pop</strong> and bank the bonus
            feathers. +1 feather already earned!
          </p>
          <div className="parkhunt-station-actions">
            {/* Adefila's spec: after a correct scan the kid is prompted to
                play Letter Pop with the word they found — that's the
                victory lap. Park Hunt itself only fires a fresh target
                when the kid asks for one. */}
            <Link
              href={`/play?word=${encodeURIComponent(targetWord ?? "")}`}
              className="btn btn-gold btn-lg btn-pulse"
            >
              <Sparkles aria-hidden className="h-5 w-5" />
              Play Letter Pop with {targetWord}
            </Link>
            <Link href="/park-hunt" className="btn btn-ghost">
              Find another word
              {nextTarget ? ` (${nextTarget})` : ""}
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
