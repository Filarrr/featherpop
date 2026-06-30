"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Camera, RefreshCw, Sparkles, Trophy } from "lucide-react";
import {
  childCheer,
  eagleCheers,
  fanfare,
  pop,
  wordReveal,
} from "@/lib/audio";
import { Confetti } from "@/components/Confetti";
import { submitFoundWordAction } from "@/lib/park-hunt-actions";
import { EggHatchReveal } from "@/components/eggs/EggHatchReveal";
import { EggCrackReveal } from "@/components/eggs/EggCrackReveal";
import type { EggColor, HatchedEntry } from "@/lib/child-profile";

/**
 * Park Hunt station result.
 *
 * Per the client spec: the GAME is the physical hunt — walk the park,
 * scan QR stations until you find the one whose word list contains the
 * eagle's word. So scanning the CORRECT station = instant pass. There's
 * no on-screen timer or tap-the-word step; finding the right QR in the
 * real world IS the achievement.
 *
 *   matchesStation === true  → the target word lives at this station →
 *                              award + celebrate, then offer Letter Pop.
 *   matchesStation === false → wrong QR, scan another (3 tries before the
 *                              eagle rotates the word).
 */
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
  const [phase, setPhase] = useState<"checking" | "won" | "wrong-station">(
    matchesStation ? "checking" : "wrong-station",
  );
  const [confettiKey, setConfettiKey] = useState(0);
  const [nextTarget, setNextTarget] = useState<string | null>(null);
  const [hatched, setHatched] = useState<HatchedEntry | null>(null);
  const [crackMilestone, setCrackMilestone] = useState<{
    level: number;
    label: string;
    message: string;
    color: EggColor;
    wordsInEgg: number;
  } | null>(null);
  // Guard so the award only fires once even under StrictMode double-mount.
  const awardedRef = useRef(false);

  // Correct station → award immediately on mount, then celebrate.
  useEffect(() => {
    if (!matchesStation || !targetWord || awardedRef.current) return;
    awardedRef.current = true;
    (async () => {
      const res = await submitFoundWordAction({
        word: targetWord,
        stationId,
      }).catch(() => null);

      // Whether or not the server award succeeded, the kid scanned the
      // right station — show the win. (A duplicate/expired target just
      // means the feather already landed.)
      setPhase("won");
      setConfettiKey((k) => k + 1);
      pop();
      window.setTimeout(() => wordReveal(), 150);
      window.setTimeout(() => fanfare(), 600);
      // Chanel: 'Yes! Feathers up and let's find the word!'
      window.setTimeout(() => eagleCheers(), 1100);
      window.setTimeout(() => childCheer(), 6600);

      if (res && res.ok) {
        setNextTarget(res.next.word);
        if (res.hatched) setHatched(res.hatched);
        else if (res.crackJustCrossed) setCrackMilestone(res.crackJustCrossed);
      }
    })();
  }, [matchesStation, targetWord, stationId]);

  // ---- Wrong station ----
  if (phase === "wrong-station") {
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
      triesRemaining === 1 ? "1 try left" : `${triesRemaining} tries left`;
    return (
      <div className="parkhunt-station parkhunt-station-empty">
        <h2 className="h-display text-3xl">
          <span className="h-gradient">Try another station!</span>
        </h2>
        <p>
          The eagle&apos;s word isn&apos;t at{" "}
          <strong>Station {stationId + 1}</strong> — walk around and scan a
          different QR.
        </p>
        <p className="parkhunt-tries">
          <strong>{triesText}</strong> before the eagle rotates the word.
        </p>
        <div className="parkhunt-station-actions">
          <Link href="/scan" className="btn btn-gold btn-lg">
            <Camera aria-hidden className="h-5 w-5" />
            Scan another QR
          </Link>
          <Link href="/park-hunt" className="btn btn-ghost">
            Back to the Eagle
          </Link>
        </div>
      </div>
    );
  }

  // ---- Correct station: checking → won ----
  return (
    <div className="parkhunt-station">
      <Confetti trigger={confettiKey} pieces={60} />

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
          Hunting <strong>{targetWord}</strong>
        </p>
      </header>

      {/* The station's word list — the target is highlighted so the kid
          can see their word really is posted here. No tapping required:
          finding the right QR is the win. */}
      <div className="parkhunt-grid" aria-hidden={phase === "won"}>
        {words.map((w) => (
          <span
            key={w}
            className={`parkhunt-word ${w === targetWord ? "is-found" : ""}`}
          >
            {w}
          </span>
        ))}
      </div>

      {phase === "won" ? (
        <div className="parkhunt-station-result is-win">
          <Trophy aria-hidden className="h-7 w-7" />
          <span className="parkhunt-station-result-eyebrow">
            <Sparkles aria-hidden className="h-4 w-4" />
            YOU PASSED
          </span>
          <h2 className="h-display text-3xl">
            You found <span className="h-gradient">{targetWord}</span> at the
            park!
          </h2>
          <p className="parkhunt-station-result-sub">
            +1 feather earned. Want to spell it out in{" "}
            <strong>Letter Pop</strong> for bonus feathers?
          </p>
          <div className="parkhunt-station-actions">
            <Link
              href={`/play?word=${encodeURIComponent(targetWord ?? "")}`}
              className="btn btn-gold btn-lg btn-pulse"
            >
              <Sparkles aria-hidden className="h-5 w-5" />
              Yes — play Letter Pop with {targetWord}
            </Link>
            <Link href="/park-hunt" className="btn btn-ghost">
              Find another word
              {nextTarget ? ` (${nextTarget})` : ""}
            </Link>
          </div>
        </div>
      ) : (
        <div className="parkhunt-station-result">
          <p className="parkhunt-station-result-sub">
            Checking the station…
          </p>
        </div>
      )}
    </div>
  );
}
