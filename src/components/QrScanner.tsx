"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { Camera, Keyboard, Sparkles } from "lucide-react";
import { ding } from "@/lib/audio";

// Park Hunt flow: every QR detected in the park reveals a word for Letter
// Pop. The QR content can be:
//   - A word (e.g. "WIND") — used directly
//   - A URL with ?word=XYZ — extracted
//   - A /play/<word> path — extracted
// Anything else is sanitized into A-Z letters and used as-is.
function extractWord(rawValue: string): string | null {
  const value = rawValue.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    const wq = url.searchParams.get("word");
    if (wq) return sanitize(wq);
    const m = url.pathname.match(/\/play\/([^/?#]+)/i);
    if (m?.[1]) return sanitize(m[1]);
    // bare path segment
    const last = url.pathname.split("/").filter(Boolean).pop();
    if (last) return sanitize(last);
  } catch {
    /* not a URL — treat as bare text */
  }
  return sanitize(value);
}

function sanitize(s: string): string | null {
  const out = s.toUpperCase().replace(/[^A-Z]/g, "");
  return out.length >= 2 && out.length <= 12 ? out : null;
}

const SAMPLES = [
  { word: "WIND",  label: "Wind portal" },
  { word: "STAR",  label: "Star portal" },
  { word: "BRAVE", label: "Brave portal" },
  { word: "EAGLE", label: "Eagle portal" },
  { word: "JOY",   label: "Joy portal" },
];

export function QrScanner() {
  const router = useRouter();
  const params = useSearchParams();
  const incomingWord = sanitize(params.get("word") ?? "");
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [manualCode, setManualCode] = useState(incomingWord ?? "");
  const [status, setStatus] = useState(
    incomingWord
      ? `Find the letters for "${incomingWord}" at the park — scan any QR!`
      : "Aim at a QR code at the park.",
  );

  function goPlay(word: string) {
    router.push(`/play?word=${encodeURIComponent(word)}`);
  }

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
            // Prefer the word baked into the URL (the one the eagle gave).
            // If none was passed, use the word extracted from the QR.
            const detected = extractWord(result.getText());
            const word = incomingWord ?? detected;
            if (!word) {
              setStatus("Couldn't read that QR — try another one.");
              return;
            }
            ding(1100, 110);
            controlsRef.current?.stop();
            goPlay(word);
          },
        );

        if (mounted) {
          controlsRef.current = controls;
          setStatus(
            incomingWord
              ? `Find "${incomingWord}" at the park — scan any QR to unlock it!`
              : "Camera ready · aim at a QR.",
          );
        } else {
          controls.stop();
        }
      } catch {
        setStatus("Camera not available — try a sample or type a word below.");
      }
    }

    start();
    return () => {
      mounted = false;
      controlsRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingWord]);

  function submitManual(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const word = sanitize(manualCode);
    if (!word) {
      setStatus("Type a word with 2–12 letters.");
      return;
    }
    goPlay(word);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="card">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <span className="kicker">
              <Camera aria-hidden className="h-4 w-4" />
              Park Hunt
            </span>
            <h1 className="h-display mt-2 text-3xl md:text-4xl">
              {incomingWord ? (
                <>
                  Find <span className="h-gradient">{incomingWord}</span> at the park
                </>
              ) : (
                <>Scan a Park QR</>
              )}
            </h1>
            <p className="mt-2 text-[var(--ink-soft)]">
              {incomingWord
                ? "Scan any Ms. Feather Pop QR you find — when you do, Letter Pop opens with this word as the goal."
                : "Each QR at the park hides a word. Scan one to start a Letter Pop round!"}
            </p>
          </div>
        </div>

        <div className="scanner-frame">
          <video ref={videoRef} muted playsInline />
          <div className="scanner-reticle" />
        </div>
        <p className="mt-3 text-center font-semibold text-[var(--ink-soft)]">
          {status}
        </p>
      </section>

      <aside className="card">
        <div className="flex items-center gap-3">
          <div
            className="grid h-11 w-11 place-items-center rounded-2xl text-white"
            style={{ background: "var(--magenta)" }}
          >
            <Keyboard aria-hidden className="h-5 w-5" />
          </div>
          <div>
            <span className="kicker">No camera?</span>
            <h2 className="h-display mt-1 text-xl">Type a word instead</h2>
          </div>
        </div>

        <form
          className="mt-4 grid grid-cols-[1fr_auto] gap-2"
          onSubmit={submitManual}
        >
          <label className="field">
            <span className="sr-only">Word</span>
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="e.g. WIND"
              maxLength={12}
            />
          </label>
          <button type="submit" className="btn btn-dark self-end">
            Play
          </button>
        </form>

        <div className="mt-5">
          <span className="kicker">Try a sample portal</span>
          <div className="row-list mt-2">
            {SAMPLES.map((s) => (
              <Link
                key={s.word}
                href={`/play?word=${s.word}`}
                className="row"
              >
                <span className="flex items-center gap-2">
                  <Sparkles
                    aria-hidden
                    className="h-4 w-4 text-[var(--magenta)]"
                  />
                  <strong>{s.label}</strong>
                </span>
                <span className="text-xs font-bold text-[var(--ink-soft)]">
                  {s.word}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
