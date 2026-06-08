"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { Camera, Keyboard, Sparkles } from "lucide-react";
import { ding } from "@/lib/audio";

// V1 pivot: every QR is a portal to a random mission. The slug seeds the
// mission picker — same QR can be replayed and rolls a different mission.
// We accept anything that looks like a slug or a /quest/<slug> URL.
function extractSlug(rawValue: string): string | null {
  const value = rawValue.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    const match = url.pathname.match(/\/quest\/([^/?#]+)/);
    if (match?.[1]) return slugify(match[1]);
  } catch {
    /* not a URL */
  }
  const normalized = value.replace(/^quest:/i, "");
  return slugify(normalized);
}

function slugify(s: string): string | null {
  const out = s.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return out || null;
}

const SAMPLES = [
  { slug: "welcome", label: "Welcome scan" },
  { slug: "feather", label: "Feather portal" },
  { slug: "wind", label: "Wind portal" },
  { slug: "courage", label: "Courage portal" },
  { slug: "joy", label: "Joy portal" },
];

export function QrScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [status, setStatus] = useState("Aim at a Ms. Feather Pop QR.");

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
            const slug = extractSlug(result.getText());
            if (!slug) {
              setStatus("Couldn't read that QR — try again.");
              return;
            }
            ding(1100, 110);
            controlsRef.current?.stop();
            router.push(`/quest/${slug}`);
          },
        );

        if (mounted) {
          controlsRef.current = controls;
          setStatus("Camera ready · aim at a QR.");
        } else {
          controls.stop();
        }
      } catch {
        setStatus("Camera not available — try a code or sample below.");
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
    const slug = extractSlug(manualCode);
    if (!slug) {
      setStatus("Type any code or paste a quest link.");
      return;
    }
    router.push(`/quest/${slug}`);
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
              Scan a mission portal
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
              placeholder="e.g. feather"
            />
          </label>
          <button type="submit" className="btn btn-dark self-end">
            Go
          </button>
        </form>

        <div className="mt-5">
          <span className="kicker">Try a sample portal</span>
          <div className="row-list mt-2">
            {SAMPLES.map((s) => (
              <Link key={s.slug} href={`/quest/${s.slug}`} className="row">
                <span className="flex items-center gap-2">
                  <Sparkles
                    aria-hidden
                    className="h-4 w-4 text-[var(--magenta)]"
                  />
                  <strong>{s.label}</strong>
                </span>
                <span className="text-xs font-bold text-[var(--ink-soft)]">
                  /quest/{s.slug}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
