"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import {
  Camera,
  Check,
  Keyboard,
  RefreshCw,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  birdWhoosh,
  childCheer,
  ding,
  eagleVoice,
  fanfare,
  featherDrop,
  pop,
  wordReveal,
  wrongDrop,
} from "@/lib/audio";
import { Confetti } from "@/components/Confetti";
import { CountUp } from "@/components/CountUp";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";
import { useActiveChild } from "@/lib/use-active-child";
import { awardFeatherPopAction } from "@/lib/child-progress-actions";

// Each QR placed in the park contains one of:
//   - A bare letter ("S")
//   - A URL/path with ?letter=S
//   - A URL/path ending in /letter/S
// The scanner pulls the letter out, and we fill the next unrevealed slot
// for that letter in the target word.
function extractLetter(rawValue: string): string | null {
  const v = rawValue.trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    const q = u.searchParams.get("letter");
    if (q) return clampLetter(q);
    const m = u.pathname.match(/\/letter\/([A-Za-z])/i);
    if (m?.[1]) return clampLetter(m[1]);
    const last = u.pathname.split("/").filter(Boolean).pop() ?? "";
    return clampLetter(last);
  } catch {
    return clampLetter(v);
  }
}
function clampLetter(s: string): string | null {
  const out = s.toUpperCase().replace(/[^A-Z]/g, "");
  return out.length >= 1 ? out[0] : null;
}

const SAMPLE_PORTALS = [
  { word: "SOAR",  label: "Soar portal" },
  { word: "WIND",  label: "Wind portal" },
  { word: "BRAVE", label: "Brave portal" },
  { word: "EAGLE", label: "Eagle portal" },
];

export function QrScanner() {
  const router = useRouter();
  const params = useSearchParams();
  const { activeChildId } = useActiveChild();
  const word = useMemo(() => {
    const w = (params.get("word") ?? "").toUpperCase().replace(/[^A-Z]/g, "");
    return w.length >= 2 && w.length <= 12 ? w : "SOAR";
  }, [params]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [found, setFound] = useState<boolean[]>(() => word.split("").map(() => false));
  const [manualLetter, setManualLetter] = useState("");
  const [status, setStatus] = useState(`Find ${word.length} letters at the park!`);
  const [recentLetter, setRecentLetter] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const [complete, setComplete] = useState(false);
  const [rewarded, setRewarded] = useState(false);

  const foundCount = found.filter(Boolean).length;

  // Reset state when word changes.
  useEffect(() => {
    setFound(word.split("").map(() => false));
    setComplete(false);
    setRewarded(false);
    setStatus(`Find ${word.length} letters at the park!`);
  }, [word]);

  function tryAccept(letter: string) {
    // Match the FIRST unfound slot whose target letter matches.
    const idx = word.split("").findIndex((l, i) => l === letter && !found[i]);
    if (idx === -1) {
      wrongDrop();
      setStatus(
        word.includes(letter)
          ? `Already found "${letter}". Look for another letter!`
          : `"${letter}" isn't in this word. Keep searching!`,
      );
      return false;
    }
    setFound((f) => {
      const next = f.slice();
      next[idx] = true;
      return next;
    });
    setRecentLetter(letter);
    setStatus(`Found "${letter}"! Keep going.`);
    setConfettiKey((k) => k + 1);
    featherDrop();
    window.setTimeout(() => childCheer(), 200);
    window.setTimeout(() => setRecentLetter(null), 1200);
    return true;
  }

  // Detect completion + award + cascade of celebrations.
  useEffect(() => {
    if (!complete && foundCount === word.length && word.length > 0) {
      setComplete(true);
      setStatus("You did it! Word complete!");
      // Layered audio cascade
      pop();
      window.setTimeout(() => wordReveal(), 100);
      window.setTimeout(() => birdWhoosh(), 350);
      window.setTimeout(() => fanfare(), 800);
      window.setTimeout(() => eagleVoice(), 1400);
      window.setTimeout(() => childCheer(), 2100);
      // Multi-burst confetti for visual scale.
      setConfettiKey((k) => k + 1);
      window.setTimeout(() => setConfettiKey((k) => k + 1), 400);
      window.setTimeout(() => setConfettiKey((k) => k + 1), 900);
      // Award FeatherPop equal to the word length.
      (async () => {
        try {
          if (activeChildId && !rewarded) {
            await awardFeatherPopAction(word.length);
            setRewarded(true);
          }
        } catch {
          /* ignore */
        }
      })();
    }
  }, [foundCount, word.length, complete, activeChildId, rewarded, word]);

  useEffect(() => {
    let mounted = true;
    const reader = new BrowserQRCodeReader();

    async function start() {
      if (!videoRef.current) return;
      try {
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (!result) return;
            const letter = extractLetter(result.getText());
            if (!letter) {
              setStatus("Couldn't read that QR — try another one.");
              return;
            }
            ding(1100, 90);
            tryAccept(letter);
          },
        );
        if (mounted) controlsRef.current = controls;
        else controls.stop();
      } catch {
        setStatus("Camera not available — try a letter below.");
      }
    }

    start();
    return () => {
      mounted = false;
      controlsRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);

  function submitManual(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const letter = clampLetter(manualLetter);
    if (!letter) {
      setStatus("Type a single letter.");
      return;
    }
    tryAccept(letter);
    setManualLetter("");
  }

  function resetHunt() {
    setFound(word.split("").map(() => false));
    setComplete(false);
    setRewarded(false);
    setRecentLetter(null);
    setStatus(`Find ${word.length} letters at the park!`);
  }

  function goLetterPop() {
    router.push(`/play?word=${encodeURIComponent(word)}`);
  }

  return (
    <div className="parkhunt">
      <Confetti trigger={confettiKey} pieces={50} />

      <header className="parkhunt-head">
        <span className="kicker">
          <Sparkles aria-hidden className="h-4 w-4" />
          Park Hunt
        </span>
        <h1 className="h-display parkhunt-title">
          <span className="h-gradient">Find the letters in the park</span>
        </h1>
        <p className="parkhunt-subtitle">
          The eagle dropped this word into the park. Look for the hidden Ms.
          Feather Pop letter QRs and scan them — each one fills in a slot
          below. Find them all to complete the word!
        </p>
      </header>

      {/* The HUGE word display — slot per letter, fills in as kids scan */}
      <section className="parkhunt-word" aria-label={`Target word ${word}`}>
        {word.split("").map((l, i) => {
          const isFound = found[i];
          const isRecent = recentLetter === l && isFound;
          return (
            <span
              key={i}
              className={`parkhunt-letter ${isFound ? "is-found" : ""} ${
                isRecent ? "is-recent" : ""
              }`}
              aria-label={isFound ? l : "missing letter"}
            >
              <span className="parkhunt-letter-glyph">{isFound ? l : "?"}</span>
              <span className="parkhunt-letter-base" aria-hidden />
            </span>
          );
        })}
      </section>

      <p
        className={`parkhunt-progress ${complete ? "is-complete" : ""}`}
        aria-live="polite"
      >
        {complete ? (
          <>
            <Trophy aria-hidden className="h-5 w-5" />
            Word complete — +{word.length} FeatherPop!
          </>
        ) : (
          <>
            Found <strong>{foundCount}</strong> of {word.length}
          </>
        )}
      </p>

      <div className="parkhunt-grid">
        <section className="parkhunt-scanner">
          <div className="scanner-frame parkhunt-scanner-frame">
            <video ref={videoRef} muted playsInline />
            <div className="scanner-reticle" />
          </div>
          <p className="parkhunt-status">{status}</p>
        </section>

        <aside className="parkhunt-side">
          <div className="parkhunt-mascot" aria-hidden>
            <MsFeatherPopAvatar
              pose={complete ? "cheer" : recentLetter ? "wow" : "hint"}
              size={120}
            />
          </div>

          {complete ? (
            <div className="parkhunt-celebrate">
              <h2 className="h-display text-2xl">
                <span className="h-gradient">Wonderful, explorer!</span>
              </h2>
              <p>You found every letter of <strong>{word}</strong>.</p>
              <div className="parkhunt-celebrate-actions">
                <button
                  type="button"
                  className="btn btn-gold btn-lg btn-pulse"
                  onClick={resetHunt}
                >
                  Hunt another word
                </button>
                <button
                  type="button"
                  className="btn btn-sky"
                  onClick={goLetterPop}
                >
                  Play Letter Pop with {word}
                </button>
                <Link href="/sort" className="btn btn-ghost">
                  <RefreshCw aria-hidden className="h-5 w-5" />
                  Back to Feather Match
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div>
                <span className="kicker">
                  <Keyboard aria-hidden className="h-4 w-4" />
                  No QRs in your park yet?
                </span>
                <p className="parkhunt-helper-text">
                  Type a letter you spotted to fill it in by hand.
                </p>
              </div>

              <form
                className="parkhunt-manual"
                onSubmit={submitManual}
                aria-label="Type a letter"
              >
                <label className="field">
                  <span className="sr-only">Letter</span>
                  <input
                    value={manualLetter}
                    onChange={(e) =>
                      setManualLetter(
                        e.target.value.toUpperCase().slice(0, 1),
                      )
                    }
                    placeholder="A"
                    maxLength={1}
                    inputMode="text"
                    autoCapitalize="characters"
                  />
                </label>
                <button type="submit" className="btn btn-dark">
                  Add
                </button>
              </form>

              <div className="parkhunt-samples">
                <span className="kicker">Demo portals</span>
                <p className="parkhunt-helper-text">
                  No park nearby? Try a sample word.
                </p>
                <div className="parkhunt-samples-row">
                  {SAMPLE_PORTALS.map((s) => (
                    <Link
                      key={s.word}
                      href={`/scan?word=${s.word}`}
                      className="parkhunt-sample"
                    >
                      <span>{s.label}</span>
                      <strong>{s.word}</strong>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* The "I'm done" checkpoint — for parents/guardians to mark the hunt
          complete if a QR went missing, etc. */}
      {!complete ? (
        <div className="parkhunt-skip">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setFound(word.split("").map(() => true));
            }}
            aria-label="Mark hunt as done (grown-up override)"
          >
            <Check aria-hidden className="h-4 w-4" />
            Grown-up: we found them all
          </button>
        </div>
      ) : null}

      {/* Full-stage celebration overlay on completion — eagle flies across,
          big WORD COMPLETE banner, +N FeatherPop floats up, mascot dances. */}
      {complete ? (
        <div className="parkhunt-celebration" aria-hidden>
          <div className="parkhunt-celebration-rays" />
          <div className="parkhunt-celebration-eagle">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/sort/bird-fly.png" alt="" />
          </div>
          <div className="parkhunt-celebration-content">
            <p className="parkhunt-celebration-kicker">
              <Sparkles aria-hidden className="h-5 w-5" />
              You found them all!
            </p>
            <h2 className="parkhunt-celebration-word">{word}</h2>
            <p className="parkhunt-celebration-pop">
              <span>+</span>
              <CountUp to={word.length} duration={1200} />
              <span>&nbsp;FeatherPop</span>
            </p>
          </div>
          <div className="parkhunt-celebration-sparkles">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} style={{ ["--i" as string]: i }} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
