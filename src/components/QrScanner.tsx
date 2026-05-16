"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { Camera, ChevronDown, ChevronUp, Keyboard, Ticket } from "lucide-react";
import { listChallenges } from "@/lib/admin-store";
import { Challenge } from "@/lib/game-data";
import { ding } from "@/lib/audio";

function extractSlug(rawValue: string, challenges: Challenge[]) {
  const value = rawValue.trim();
  try {
    const url = new URL(value);
    const match = url.pathname.match(/\/quest\/([^/]+)/);
    if (match?.[1]) return match[1];
  } catch {
    /* not a URL, continue */
  }
  const normalized = value.replace(/^quest:/i, "").toLowerCase();
  const direct = challenges.find(
    (c) =>
      c.slug.toLowerCase() === normalized ||
      c.qrLabel.toLowerCase() === normalized,
  );
  return direct?.slug ?? normalized;
}

export function QrScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [status, setStatus] = useState("Aim at a Word Quest QR.");
  const [showSamples, setShowSamples] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    setChallenges(listChallenges().filter((c) => c.active !== false));
  }, []);

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
            const all = listChallenges();
            const slug = extractSlug(result.getText(), all);
            const found = all.find((c) => c.slug === slug);
            if (!found) {
              setStatus("That QR isn't part of this Word Quest pack.");
              return;
            }
            ding(1100, 110);
            controlsRef.current?.stop();
            router.push(`/quest/${found.slug}`);
          },
        );

        if (mounted) {
          controlsRef.current = controls;
          setStatus("Camera ready · aim at a QR.");
        } else {
          controls.stop();
        }
      } catch {
        setStatus("Camera not available — try a sample below.");
        setShowSamples(true);
      }
    }

    start();
    return () => {
      mounted = false;
      controlsRef.current?.stop();
    };
  }, [router]);

  function submitManual(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const slug = extractSlug(manualCode, challenges);
    const found = challenges.find((c) => c.slug === slug);
    if (!found) {
      setStatus("No challenge found for that code.");
      return;
    }
    router.push(`/quest/${found.slug}`);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="card">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <span className="kicker">
              <Camera aria-hidden className="h-4 w-4" />
              Scanner
            </span>
            <h1 className="h-display mt-2 text-3xl md:text-4xl">
              Find a Word Quest code
            </h1>
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
            <span className="kicker">Manual code</span>
            <h2 className="h-display mt-1 text-xl">Type a code instead</h2>
          </div>
        </div>

        <form
          className="mt-4 grid grid-cols-[1fr_auto] gap-2"
          onSubmit={submitManual}
        >
          <label className="field">
            <span className="sr-only">Code</span>
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. book"
            />
          </label>
          <button type="submit" className="btn btn-dark self-end">
            Go
          </button>
        </form>

        <button
          type="button"
          onClick={() => setShowSamples((v) => !v)}
          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--purple)]"
        >
          {showSamples ? "Hide" : "Show"} sample codes
          {showSamples ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {showSamples ? (
          <div className="row-list mt-3">
            {challenges.map((c) => (
              <Link key={c.slug} href={`/quest/${c.slug}`} className="row">
                <span className="flex items-center gap-2">
                  <Ticket
                    aria-hidden
                    className="h-4 w-4 text-[var(--magenta)]"
                  />
                  <strong>{c.targetWord}</strong>
                  <span className="text-xs text-[var(--ink-soft)]">
                    · {c.zone}
                  </span>
                </span>
                <span className="text-xs font-bold text-[var(--ink-soft)]">
                  {c.qrLabel}
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
