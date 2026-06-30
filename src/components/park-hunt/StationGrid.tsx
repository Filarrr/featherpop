"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Camera, RefreshCw, Sparkles, Trophy, Wand2 } from "lucide-react";
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
 * The kid has ONE word from the eagle. Scanning the station whose list
 * contains that word = instant pass. We deliberately do NOT show the
 * station's word list (the answer would be sitting right there) and we
 * never invent a word — if there's no active eagle word we send them to
 * Feather Match to get one.
 */
export function StationGrid({
  stationId,
  hasTarget,
  matchesStation,
  targetWord,
}: {
  stationId: number; // 0-indexed (display +1)
  hasTarget: boolean;
  matchesStation: boolean;
  targetWord: string | null;
}) {
  const [phase, setPhase] = useState<"checking" | "won">("checking");
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
  const awardedRef = useRef(false);

  // Correct station → award immediately, then celebrate.
  useEffect(() => {
    if (!hasTarget || !matchesStation || !targetWord || awardedRef.current)
      return;
    awardedRef.current = true;
    (async () => {
      const res = await submitFoundWordAction({
        word: targetWord,
        stationId,
      }).catch(() => null);

      setPhase("won");
      setConfettiKey((k) => k + 1);
      pop();
      window.setTimeout(() => wordReveal(), 150);
      window.setTimeout(() => fanfare(), 600);
      window.setTimeout(() => eagleCheers(), 1100);
      window.setTimeout(() => childCheer(), 6600);

      if (res && res.ok) {
        setNextTarget(res.next.word);
        if (res.hatched) setHatched(res.hatched);
        else if (res.crackJustCrossed) setCrackMilestone(res.crackJustCrossed);
      }
    })();
  }, [hasTarget, matchesStation, targetWord, stationId]);

  // ---- No eagle word yet ----
  if (!hasTarget) {
    return (
      <div className="parkhunt-station parkhunt-station-empty">
        <h2 className="h-display text-3xl">
          <span className="h-gradient">No word to hunt yet!</span>
        </h2>
        <p>
          Play <strong>Feather Match</strong> first — the eagle will give you a
          word to find at the park.
        </p>
        <div className="parkhunt-station-actions">
          <Link href="/sort" className="btn btn-gold btn-lg">
            <Wand2 aria-hidden className="h-5 w-5" />
            Play Feather Match
          </Link>
          <Link href="/" className="btn btn-ghost">
            Home
          </Link>
        </div>
      </div>
    );
  }

  // ---- Wrong station ----
  if (!matchesStation && phase !== "won") {
    return (
      <div className="parkhunt-station parkhunt-station-empty">
        <h2 className="h-display text-3xl">
          <span className="h-gradient">Not at this station!</span>
        </h2>
        <p>
          Your word isn&apos;t at <strong>Station {stationId + 1}</strong>. Walk
          around the park and scan a different QR code.
        </p>
        <div className="parkhunt-station-actions">
          <Link href="/scan" className="btn btn-gold btn-lg">
            <Camera aria-hidden className="h-5 w-5" />
            Scan another QR
          </Link>
          <Link href="/park-hunt" className="btn btn-ghost">
            <RefreshCw aria-hidden className="h-5 w-5" />
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
          <p className="parkhunt-station-result-sub">Checking the station…</p>
        </div>
      )}
    </div>
  );
}
