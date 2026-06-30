"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Home, Sparkles, Wand2 } from "lucide-react";
import {
  childCheer,
  eagleCheers,
  eagleHandsWord,
  fanfare,
  pop,
  wordReveal,
} from "@/lib/audio";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";
import { Confetti } from "@/components/Confetti";

/**
 * Shows the eagle's word (from the URL) and sends the child to the scanner,
 * carrying the word forward so it can never be lost or overwritten.
 */
export function ParkHuntStage({
  word,
  hasActiveChild,
  activeNickname,
}: {
  word: string | null;
  hasActiveChild: boolean;
  activeNickname: string | null;
}) {
  const router = useRouter();
  const playedIntroRef = useRef(false);

  // Eagle audio + confetti once when a word is present.
  useEffect(() => {
    if (!word || playedIntroRef.current) return;
    playedIntroRef.current = true;
    pop();
    window.setTimeout(() => wordReveal(), 200);
    window.setTimeout(() => fanfare(), 700);
    window.setTimeout(() => eagleHandsWord(), 1300);
    window.setTimeout(() => eagleCheers(), 6200);
    window.setTimeout(() => childCheer(), 9600);
  }, [word]);

  function goScan() {
    if (!word) return;
    pop();
    router.push(`/scan?word=${encodeURIComponent(word)}`);
  }

  // No word → tell them to play Feather Match (which hands out the word).
  if (!word) {
    return (
      <div className="parkhunt-stage">
        <div className="parkhunt-empty">
          <h2 className="h-display text-3xl">
            <span className="h-gradient">No word to hunt yet!</span>
          </h2>
          <p>
            Play <strong>Feather Match</strong> — the eagle will give{" "}
            {hasActiveChild ? (activeNickname ?? "you") : "you"} a word to find
            at the park.
          </p>
          <Link href="/sort" className="btn btn-gold btn-lg">
            <Wand2 aria-hidden className="h-5 w-5" />
            Play Feather Match
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="parkhunt-stage">
      <Confetti trigger={1} pieces={50} />

      <div className="parkhunt-stage-art">
        <div className="parkhunt-eagle">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/sort/bird-fly.png" alt="" />
        </div>
        <div className="parkhunt-mascot">
          <MsFeatherPopAvatar pose="cheer" size={140} />
        </div>
      </div>

      <div className="parkhunt-stage-card">
        <span className="kicker">
          <Sparkles aria-hidden className="h-4 w-4" />
          The Eagle&apos;s Word
        </span>
        <p className="parkhunt-target-label">Find this word at the park:</p>
        <h1 className="parkhunt-target-word">{word}</h1>

        <ol className="parkhunt-steps">
          <li>
            <strong>1.</strong> Walk around the park to the numbered QR stations.
          </li>
          <li>
            <strong>2.</strong> Scan each station&apos;s QR code with your phone.
          </li>
          <li>
            <strong>3.</strong> Find the station that lists <strong>{word}</strong>{" "}
            — scan it and you pass!
          </li>
        </ol>

        <div className="parkhunt-stage-actions">
          <button
            type="button"
            onClick={goScan}
            className="btn btn-gold btn-lg btn-pulse"
          >
            <Camera aria-hidden className="h-5 w-5" />
            Scan a station QR
          </button>
          <Link href="/" className="btn btn-ghost">
            <Home aria-hidden className="h-5 w-5" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
