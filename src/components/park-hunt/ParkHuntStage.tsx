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
  eagleHandsWord,
  eagleVoice,
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

export function ParkHuntStage() {
  const router = useRouter();
  const [target, setTarget] = useState<TargetState | null>(null);
  const [loading, setLoading] = useState(true);
  const [confettiKey, setConfettiKey] = useState(0);
  const playedIntroRef = useRef(false);

  // Pull the current daily target on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getCurrentTargetAction();
      if (cancelled) return;
      if (res) {
        setTarget({
          word: res.word,
          stationId: res.stationId,
          foundToday: res.foundToday ?? 0,
        });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Play the eagle audio once after the target loads.
  useEffect(() => {
    if (!target || playedIntroRef.current) return;
    playedIntroRef.current = true;
    setConfettiKey((k) => k + 1);
    pop();
    window.setTimeout(() => wordReveal(), 200);
    window.setTimeout(() => fanfare(), 700);
    // Eagle's recorded voice: 'Can you help me find this word in the park?'
    // (≈4.4s clip). Fall-through to the Strudelay call after.
    window.setTimeout(() => eagleHandsWord(), 1300);
    window.setTimeout(() => eagleVoice(), 6200);
    window.setTimeout(() => childCheer(), 7400);
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
    router.push("/scan?mode=parkhunt");
  }

  if (loading && !target) {
    return (
      <div className="parkhunt-stage parkhunt-loading">
        <p>Calling the eagle…</p>
      </div>
    );
  }

  if (!target) {
    return (
      <div className="parkhunt-stage">
        <div className="parkhunt-empty">
          <h2 className="h-display text-3xl">
            <span className="h-gradient">Pick a child profile first</span>
          </h2>
          <p>Park Hunt remembers each child&apos;s daily target word.</p>
          <Link href="/account/profiles" className="btn btn-gold btn-lg">
            Choose a profile
          </Link>
        </div>
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
            <strong>1.</strong> Walk around the park and find the right QR station.
          </li>
          <li>
            <strong>2.</strong> Scan its QR code with your phone.
          </li>
          <li>
            <strong>3.</strong> You&apos;ll have <strong>60 seconds</strong> to
            tap <strong>{target.word}</strong> in the word list.
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
