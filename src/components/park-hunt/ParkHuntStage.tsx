"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Home, RefreshCw, Sparkles } from "lucide-react";
import {
  getCurrentTargetAction,
  rotateTargetAction,
} from "@/lib/park-hunt-actions";
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

interface TargetState {
  word: string;
  stationId: number; // 0-5 internally; +1 to display
  foundToday: number;
}

export function ParkHuntStage({
  initialTarget,
  hasActiveChild,
  activeNickname,
}: {
  initialTarget: TargetState | null;
  hasActiveChild: boolean;
  activeNickname: string | null;
}) {
  const router = useRouter();
  // Start with the server-resolved target — no client fetch race.
  const [target, setTarget] = useState<TargetState | null>(initialTarget);
  const [loading, setLoading] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const playedIntroRef = useRef(false);

  // If somehow we have an active child but no target (e.g. the server
  // call errored), retry from the client as a fallback.
  useEffect(() => {
    if (target || !hasActiveChild) return;
    let cancelled = false;
    (async () => {
      const res = await getCurrentTargetAction().catch(() => null);
      if (cancelled || !res) return;
      setTarget({
        word: res.word,
        stationId: res.stationId,
        foundToday: res.foundToday ?? 0,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [target, hasActiveChild]);

  // Play the eagle audio once after the target loads.
  useEffect(() => {
    if (!target || playedIntroRef.current) return;
    playedIntroRef.current = true;
    setConfettiKey((k) => k + 1);
    pop();
    window.setTimeout(() => wordReveal(), 200);
    window.setTimeout(() => fanfare(), 700);
    // Park Hunt intro sequence — two voice clips back-to-back:
    //   1) 'Can you help me find this word in the park?' (~4.4s)
    //   2) 'Yes! Feather tag up and let's find the word!' (~3s)
    // The eagle's 'Strudelay!' signature call already plays at the
    // end of the Feather Sort handoff — here we want the kid to
    // hear the mission line, not another Strudelay.
    window.setTimeout(() => eagleHandsWord(), 1300);
    window.setTimeout(() => eagleCheers(), 6200);
    window.setTimeout(() => childCheer(), 9600);
  }, [target]);

  async function rotate() {
    pop();
    setLoading(true);
    const res = await rotateTargetAction();
    if (res) {
      setTarget({
        word: res.word,
        stationId: res.stationId,
        foundToday: res.foundToday ?? 0,
      });
      playedIntroRef.current = false;
    }
    setLoading(false);
  }

  function goScan() {
    pop();
    router.push("/scan");
  }

  if (loading && !target) {
    return (
      <div className="parkhunt-stage parkhunt-loading">
        <p>Calling the eagle…</p>
      </div>
    );
  }

  // Only show the 'pick a profile' empty-state when we definitely don't
  // have one — server already checked the cookie + Clerk auth.
  if (!target && !hasActiveChild) {
    return (
      <div className="parkhunt-stage">
        <div className="parkhunt-empty">
          <h2 className="h-display text-3xl">
            <span className="h-gradient">Pick a child profile first</span>
          </h2>
          <p>Park Hunt remembers each child&apos;s weekly target word.</p>
          <Link href="/account/profiles" className="btn btn-gold btn-lg">
            Choose a profile
          </Link>
        </div>
      </div>
    );
  }

  if (!target) {
    // We have an active child but the server didn't return a target yet
    // (network blip during the page render). Show a soft loading state
    // and let the client-side fallback effect retry.
    return (
      <div className="parkhunt-stage parkhunt-loading">
        <p>Calling the eagle for {activeNickname ?? "your hunter"}…</p>
      </div>
    );
  }

  return (
    <div className="parkhunt-stage">
      <Confetti trigger={confettiKey} pieces={50} />

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
        <h1 className="parkhunt-target-word">{target.word}</h1>

        <ol className="parkhunt-steps">
          <li>
            <strong>1.</strong> Walk around the park to the numbered QR stations.
          </li>
          <li>
            <strong>2.</strong> Scan each station&apos;s QR code with your phone.
          </li>
          <li>
            <strong>3.</strong> Find the station that lists{" "}
            <strong>{target.word}</strong> — scan it and you pass!
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
          <button
            type="button"
            onClick={rotate}
            className="btn btn-ghost"
            disabled={loading}
          >
            <RefreshCw aria-hidden className="h-5 w-5" />
            New word
          </button>
          <Link href="/" className="btn btn-ghost">
            <Home aria-hidden className="h-5 w-5" />
            Home
          </Link>
        </div>

        {target.foundToday > 0 ? (
          <p className="parkhunt-stage-count">
            Found <strong>{target.foundToday}</strong>{" "}
            {target.foundToday === 1 ? "word" : "words"} today. Keep going!
          </p>
        ) : null}
      </div>
    </div>
  );
}
