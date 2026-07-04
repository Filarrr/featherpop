"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Camera, RefreshCw, Sparkles, Trophy, Wand2 } from "lucide-react";
import {
  buzz,
  childCheer,
  ding,
  eagleCheers,
  fanfare,
  pop,
  wordReveal,
} from "@/lib/audio";
import { Confetti } from "@/components/Confetti";
import { findWordAtStationAction } from "@/lib/park-hunt-actions";
import { EggHatchReveal } from "@/components/eggs/EggHatchReveal";
import { EggCrackReveal } from "@/components/eggs/EggCrackReveal";
import type { EggColor, HatchedEntry } from "@/lib/child-profile";

/**
 * Park Hunt station result.
 *
 * After scanning the right station we reveal its 20 words and the child taps
 * the eagle's word among them (a real "find it" reading moment). Correct tap →
 * congratulations + find more. If the eagle's word isn't in this station, we
 * tell them to scan a different QR.
 */
export function StationGrid({
  stationId,
  word,
  matchesStation,
  stationWords,
  locked = false,
}: {
  stationId: number; // 0-indexed (display +1)
  word: string | null;
  matchesStation: boolean;
  stationWords: string[];
  locked?: boolean;
}) {
  const [phase, setPhase] = useState<"finding" | "won" | "limit">("finding");
  const [confettiKey, setConfettiKey] = useState(0);
  const [wrongTap, setWrongTap] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hatched, setHatched] = useState<HatchedEntry | null>(null);
  const [crackMilestone, setCrackMilestone] = useState<{
    level: number;
    label: string;
    message: string;
    color: EggColor;
    wordsInEgg: number;
  } | null>(null);
  const doneRef = useRef(false);

  // Shuffle the 20 words once so the target isn't always in the same spot.
  const shuffled = useMemo(() => {
    const a = stationWords.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, [stationWords]);

  const handleTap = useCallback(
    async (tapped: string) => {
      if (!word || phase !== "finding" || submitting || doneRef.current) return;
      if (tapped !== word) {
        buzz();
        setWrongTap(tapped);
        window.setTimeout(() => setWrongTap(null), 450);
        return;
      }
      // Correct word tapped — award it.
      doneRef.current = true;
      setSubmitting(true);
      ding(1320, 90);
      const res = await findWordAtStationAction({ word, stationId }).catch(
        () => null,
      );
      setSubmitting(false);
      if (res && !res.ok && res.limit) {
        setPhase("limit");
        return;
      }
      setPhase("won");
      setConfettiKey((k) => k + 1);
      pop();
      window.setTimeout(() => wordReveal(), 120);
      window.setTimeout(() => fanfare(), 550);
      window.setTimeout(() => eagleCheers(), 1100);
      window.setTimeout(() => childCheer(), 3200);
      if (res && res.ok) {
        if (res.hatched) setHatched(res.hatched);
        else if (res.crackJustCrossed) setCrackMilestone(res.crackJustCrossed);
      }
    },
    [word, phase, submitting, stationId],
  );

  // No word in the URL → the child hasn't been handed one by the eagle.
  if (!word) {
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

  // Wrong station — the eagle's word isn't here.
  if (!matchesStation) {
    return (
      <div className="parkhunt-station parkhunt-station-empty">
        <h2 className="h-display text-3xl">
          <span className="h-gradient">Not at this station!</span>
        </h2>
        <p>
          <strong>{word}</strong> isn&apos;t at{" "}
          <strong>Station {stationId + 1}</strong>. Walk around the park and scan
          a different QR code.
        </p>
        <div className="parkhunt-station-actions">
          <Link
            href={`/scan?word=${encodeURIComponent(word)}`}
            className="btn btn-gold btn-lg"
          >
            <Camera aria-hidden className="h-5 w-5" />
            Scan another QR
          </Link>
          <Link
            href={`/park-hunt?word=${encodeURIComponent(word)}`}
            className="btn btn-ghost"
          >
            <RefreshCw aria-hidden className="h-5 w-5" />
            Back to the Eagle
          </Link>
        </div>
      </div>
    );
  }

  // Correct station BUT the free daily Park Hunt limit is used up.
  if (locked || phase === "limit") {
    return (
      <div className="parkhunt-station parkhunt-station-empty">
        <h2 className="h-display text-3xl">
          <span className="h-gradient">You found it! 🎉</span>
        </h2>
        <p>
          <strong>{word}</strong> was here — but you&apos;ve used your{" "}
          <strong>3 free Park Hunts</strong> today. Subscribe for{" "}
          <strong>$9.99/month</strong> to hunt unlimited and claim prizes.
        </p>
        <div className="parkhunt-station-actions">
          <Link href="/membership" className="btn btn-gold btn-lg">
            <Sparkles aria-hidden className="h-5 w-5" />
            See membership
          </Link>
          <Link href="/" className="btn btn-ghost">
            Home
          </Link>
        </div>
      </div>
    );
  }

  // Won — congratulations + find more.
  if (phase === "won") {
    return (
      <div className="parkhunt-station">
        <Confetti trigger={confettiKey} pieces={70} />
        {hatched ? (
          <EggHatchReveal hatched={hatched} onClose={() => setHatched(null)} />
        ) : crackMilestone ? (
          <EggCrackReveal
            {...crackMilestone}
            onClose={() => setCrackMilestone(null)}
          />
        ) : null}
        <div className="parkhunt-station-result is-win">
          <Trophy aria-hidden className="h-7 w-7" />
          <span className="parkhunt-station-result-eyebrow">
            <Sparkles aria-hidden className="h-4 w-4" />
            CONGRATULATIONS!
          </span>
          <h2 className="h-display text-3xl">
            You found <span className="h-gradient">{word}</span>!
          </h2>
          <p className="parkhunt-station-result-sub">
            +1 feather earned. Spell it in <strong>Letter Pop</strong> for bonus
            feathers, or find another word!
          </p>
          <div className="parkhunt-station-actions">
            <Link
              href={`/play?word=${encodeURIComponent(word)}`}
              className="btn btn-gold btn-lg btn-pulse"
            >
              <Sparkles aria-hidden className="h-5 w-5" />
              Play Letter Pop with {word}
            </Link>
            <Link href="/sort" className="btn btn-ghost">
              <RefreshCw aria-hidden className="h-5 w-5" />
              Find more words
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Finding — reveal the 20 words; child taps the eagle's word.
  return (
    <div className="parkhunt-station">
      <Confetti trigger={confettiKey} pieces={0} />
      <header className="parkhunt-station-hud">
        <span className="kicker">Station {stationId + 1}</span>
        <p className="parkhunt-station-find">
          Find <strong>{word}</strong> and tap it!
        </p>
      </header>
      <div className="parkhunt-grid">
        {shuffled.map((w) => (
          <button
            key={w}
            type="button"
            disabled={submitting}
            onClick={() => handleTap(w)}
            className={`parkhunt-word ${wrongTap === w ? "is-wrong" : ""}`}
            aria-label={`Word ${w}`}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}
