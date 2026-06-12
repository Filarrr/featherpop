"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Feather,
  Home,
  RefreshCw,
  Sparkles,
  Star,
  Timer,
  X,
} from "lucide-react";
import { pickRound, validateWord, WordHeroRound } from "@/lib/word-hero";
import { useActiveChild } from "@/lib/use-active-child";
import {
  recordWordsFoundAction,
} from "@/lib/child-progress-actions";
import type { HatchedEntry } from "@/lib/child-profile";
import { EggHatchReveal } from "@/components/eggs/EggHatchReveal";
import {
  buzz,
  childCheer,
  childOoh,
  ding,
  fanfare,
  pop,
  urgentTick,
} from "@/lib/audio";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";
import { Confetti } from "@/components/Confetti";

const ROUND_SECONDS = 90;

type Phase = "intro" | "playing" | "done";

export function WordHero() {
  const router = useRouter();
  const { activeChildId } = useActiveChild();
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState<WordHeroRound>(() => pickRound());
  const [typed, setTyped] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const [hatched, setHatched] = useState<HatchedEntry | null>(null);
  const refreshTimerRef = useRef<number | null>(null);

  // Letter usage tracking: how many times each bank letter is already
  // claimed by `typed` letters. Letters with no remaining uses get
  // disabled in the bank.
  const usedCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of typed) counts.set(l, (counts.get(l) ?? 0) + 1);
    return counts;
  }, [typed]);
  const bankAvailability = useMemo(() => {
    // For each tile in the bank, "consume" it if the running count of that
    // letter seen so far is < the total used in `typed`. So if bank has TT
    // and child typed one T, the FIRST T tile is consumed and the second
    // stays available.
    const seen = new Map<string, number>();
    return round.bank.map((letter, index) => {
      const seenSoFar = seen.get(letter) ?? 0;
      seen.set(letter, seenSoFar + 1);
      const used = usedCounts.get(letter) ?? 0;
      return {
        letter,
        index,
        consumed: seenSoFar < used,
      };
    });
  }, [round.bank, usedCounts]);

  // Countdown.
  useEffect(() => {
    if (phase !== "playing") return;
    if (secondsLeft <= 0) {
      finishRound();
      return;
    }
    const t = window.setTimeout(() => {
      setSecondsLeft((s) => s - 1);
      if (secondsLeft <= 11) urgentTick();
    }, 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, secondsLeft]);

  function startGame() {
    setPhase("playing");
    setSecondsLeft(ROUND_SECONDS);
    setTyped([]);
    setFoundWords([]);
    pop();
  }

  function newRound() {
    setRound(pickRound());
    setTyped([]);
    setFoundWords([]);
    setSecondsLeft(ROUND_SECONDS);
    setPhase("playing");
    setStatus(null);
    pop();
  }

  function tapLetter(i: number) {
    const slot = bankAvailability[i];
    if (slot.consumed) return;
    setTyped((t) => [...t, slot.letter]);
    ding(660 + typed.length * 40, 60);
  }

  function backspace() {
    setTyped((t) => t.slice(0, -1));
  }

  function clearTyped() {
    setTyped([]);
  }

  async function submitWord() {
    const word = typed.join("");
    const check = validateWord(word, round, foundWords);
    if (!check.ok) {
      buzz();
      setStatus({ msg: check.reason ?? "Try again!", ok: false });
      window.setTimeout(() => setStatus(null), 2200);
      return;
    }
    // Valid!
    setFoundWords((arr) => [word, ...arr]);
    setTyped([]);
    setStatus({ msg: `Great! +1 Feather for "${word}"`, ok: true });
    setConfettiKey((k) => k + 1);
    pop();
    if (word.length >= 5) childCheer();
    else childOoh();
    window.setTimeout(() => setStatus(null), 1800);

    // Record the word found — 1 FeatherPop + 1 word toward the egg.
    void (async () => {
      try {
        const res = await recordWordsFoundAction(1);
        if (!res) {
          console.warn("[word-hero] recordWordsFound returned null");
          return;
        }
        if (res.hatched) {
          // Egg hatched! Show the reveal overlay.
          setHatched(res.hatched);
        }
      } catch (err) {
        console.warn("[word-hero] recordWordsFound failed:", err);
      }
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }
      refreshTimerRef.current = window.setTimeout(() => {
        router.refresh();
        refreshTimerRef.current = null;
      }, 1200);
    })();
  }

  function finishRound() {
    setPhase("done");
    fanfare();
    window.setTimeout(() => router.refresh(), 800);
  }

  // Cleanup on unmount: force pending refresh.
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
        router.refresh();
      }
    };
  }, [router]);

  const mm = Math.floor(secondsLeft / 60);
  const ss = (secondsLeft % 60).toString().padStart(2, "0");
  const urgent = phase === "playing" && secondsLeft <= 10;

  if (phase === "intro") {
    return (
      <div className="word-hero-intro">
        <div className="word-hero-intro-card">
          <span className="kicker">
            <Sparkles aria-hidden className="h-4 w-4" />
            Word Hero
          </span>
          <h1 className="h-display word-hero-intro-title">
            <span className="h-gradient">Make words from the letters!</span>
          </h1>
          <p>
            The eagle gives you a target letter and a bank of letters.
            Build as many words as you can that <strong>start with the target letter</strong>.
            Each real word = <strong>+1 Feather</strong>!
          </p>
          <button
            type="button"
            onClick={startGame}
            className="play-button word-hero-intro-play"
            aria-label="Play Word Hero"
          >
            <span className="play-button-ring" aria-hidden />
            <span className="play-button-ring play-button-ring-2" aria-hidden />
            <span className="play-button-text">PLAY</span>
          </button>
          <Link href="/" className="btn btn-ghost btn-sm">
            <Home aria-hidden className="h-4 w-4" />
            Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="word-hero" role="application">
      <Confetti trigger={confettiKey} pieces={36} />

      <header className="word-hero-hud">
        <span className="kicker">
          <Sparkles aria-hidden className="h-4 w-4" />
          Word Hero
        </span>
        <div className="word-hero-hud-right">
          <span className={`sort-timer ${urgent ? "is-urgent" : ""}`}>
            <Timer aria-hidden className="h-4 w-4" />
            {mm}:{ss}
          </span>
          <span className="word-hero-score">
            <Feather aria-hidden className="h-4 w-4" />
            {foundWords.length}
          </span>
        </div>
      </header>

      <section className="word-hero-stage">
        <div className="word-hero-target" aria-label={`Target letter ${round.targetLetter}`}>
          <span className="word-hero-target-glow" aria-hidden />
          <span className="word-hero-target-letter">{round.targetLetter}</span>
        </div>
        <p className="word-hero-tagline">
          Make as many words as you can that start with{" "}
          <strong>{round.targetLetter}</strong>!
        </p>

        <div className="word-hero-mascot" aria-hidden>
          <MsFeatherPopAvatar pose="cheer" size={120} />
        </div>

        <div className="word-hero-typed" aria-live="polite">
          {typed.length === 0 ? (
            <span className="word-hero-typed-empty">Tap letters below…</span>
          ) : (
            typed.map((l, i) => (
              <span key={i} className="word-hero-typed-tile">
                {l}
              </span>
            ))
          )}
        </div>

        <div className="word-hero-bank" role="group" aria-label="Letter bank">
          {bankAvailability.map((slot, i) => (
            <button
              key={i}
              type="button"
              className={`word-hero-letter ${slot.consumed ? "is-used" : ""}`}
              onClick={() => tapLetter(i)}
              disabled={slot.consumed}
              aria-label={`Letter ${slot.letter}`}
            >
              {slot.letter}
            </button>
          ))}
        </div>

        <div className="word-hero-actions">
          <button
            type="button"
            onClick={backspace}
            disabled={typed.length === 0}
            className="btn btn-ghost btn-sm"
          >
            <X aria-hidden className="h-4 w-4" />
            Back
          </button>
          <button
            type="button"
            onClick={clearTyped}
            disabled={typed.length === 0}
            className="btn btn-ghost btn-sm"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={submitWord}
            disabled={typed.length < 2}
            className="btn btn-gold btn-lg"
          >
            <Sparkles aria-hidden className="h-5 w-5" />
            Enter
          </button>
        </div>

        {status ? (
          <p
            className={`word-hero-status ${status.ok ? "is-ok" : "is-error"}`}
            role="status"
          >
            {status.msg}
          </p>
        ) : null}
      </section>

      <section className="word-hero-panels">
        <article className="word-hero-panel">
          <span className="kicker">Goal</span>
          <p>
            Create as many real words as possible that start with{" "}
            <strong>{round.targetLetter}</strong>.
          </p>
        </article>

        <article className="word-hero-panel word-hero-panel-words">
          <span className="kicker">
            <Feather aria-hidden className="h-4 w-4" />
            Your words ({foundWords.length})
          </span>
          {foundWords.length === 0 ? (
            <p className="word-hero-panel-empty">No words yet — get tapping!</p>
          ) : (
            <ul>
              {foundWords.map((w) => (
                <li key={w}>
                  <Sparkles aria-hidden className="h-3.5 w-3.5" />
                  {w}
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="word-hero-panel word-hero-panel-reward">
          <span className="kicker">Feather Star</span>
          <div className="word-hero-star">
            <Star aria-hidden className="h-12 w-12 fill-current" />
          </div>
          <p>
            Earn a Feather Star for every word you build. Spend them on prizes!
          </p>
        </article>
      </section>

      <p className="word-hero-footer">Be a Word Hero, Feather Friend!</p>

      {hatched ? (
        <EggHatchReveal hatched={hatched} onClose={() => setHatched(null)} />
      ) : null}

      {phase === "done" ? (
        <div className="word-hero-done" role="dialog" aria-labelledby="wh-done-title">
          <div className="word-hero-done-card">
            <h2 id="wh-done-title" className="h-display">
              <span className="h-gradient">Round complete!</span>
            </h2>
            <p>
              You found <strong>{foundWords.length}</strong> word
              {foundWords.length === 1 ? "" : "s"}!
            </p>
            <p className="word-hero-done-pop">
              <Feather aria-hidden className="h-5 w-5" />
              +{foundWords.length} Feathers earned
            </p>
            <div className="word-hero-actions">
              <button
                type="button"
                onClick={newRound}
                className="btn btn-gold btn-lg btn-pulse"
              >
                <RefreshCw aria-hidden className="h-5 w-5" />
                Play again
              </button>
              <Link href="/" className="btn btn-ghost">
                <Home aria-hidden className="h-4 w-4" />
                Home
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

