"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { Home, Loader2, Sparkles } from "lucide-react";
import { ding } from "@/lib/audio";
import { parseStationCode } from "@/lib/park-hunt";

/**
 * Park Hunt station scanner.
 *
 * The kid walks the park and scans the numbered QR stations. Each station
 * QR encodes the station URL ( .../park-hunt/station/N ) or a bare
 * `parkhunt-station-N` code. We pull the station number out and route into
 * the station page, which checks whether the eagle's word lives there.
 *
 * There is deliberately NO manual override, demo word, or "we found them
 * all" shortcut — the whole point is the real-world hunt, so the only way
 * to pass is to scan the correct physical QR.
 */
export function QrScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const routedRef = useRef(false);
  const [status, setStatus] = useState("Starting the camera…");
  const [cameraOk, setCameraOk] = useState(true);
  const [starting, setStarting] = useState(true);
  // True once a valid station QR is read and we're navigating — gives the
  // kid immediate feedback even when the network is slow.
  const [navigating, setNavigating] = useState(false);

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
            if (!result || routedRef.current) return;
            const raw = result.getText();
            const stationId = parseStationCode(raw);
            if (stationId === null) {
              setStatus("That isn't a Park Hunt station QR — try another.");
              return;
            }
            routedRef.current = true;
            ding(1320, 110);
            setNavigating(true);
            setStatus(`Opening Station ${stationId + 1}…`);
            controlsRef.current?.stop();
            router.push(`/park-hunt/station/${stationId + 1}`);
          },
        );
        if (mounted) {
          controlsRef.current = controls;
          setStarting(false);
          setStatus("Point your camera at a station QR code.");
        } else {
          controls.stop();
        }
      } catch {
        if (!mounted) return;
        setCameraOk(false);
        setStarting(false);
        setStatus("We couldn't open the camera. Allow camera access, then reload.");
      }
    }

    start();
    return () => {
      mounted = false;
      controlsRef.current?.stop();
    };
  }, [router]);

  return (
    <div className="scan-page">
      <header className="scan-head">
        <span className="kicker">
          <Sparkles aria-hidden className="h-4 w-4" />
          Park Hunt
        </span>
        <h1 className="h-display scan-title">
          <span className="h-gradient">Scan a station QR</span>
        </h1>
        <p className="scan-subtitle">
          Walk around the park and scan the numbered QR stations. When you
          scan the station that lists the eagle&apos;s word, you pass!
        </p>
      </header>

      <section className="scan-camera">
        <div className="scan-frame">
          <video ref={videoRef} muted playsInline />
          <div className="scanner-reticle" />
          {(starting || navigating) && (
            <div className="scan-busy">
              <Loader2 aria-hidden className="scan-spinner h-8 w-8" />
              <span>{navigating ? "Opening station…" : "Starting camera…"}</span>
            </div>
          )}
        </div>
        <p className="scan-status" aria-live="polite">
          {status}
        </p>
      </section>

      <ol className="scan-steps">
        <li>
          <strong>1.</strong> Find a numbered QR station in the park.
        </li>
        <li>
          <strong>2.</strong> Scan it with the camera.
        </li>
        <li>
          <strong>3.</strong> If the eagle&apos;s word is on that station, you
          win a feather!
        </li>
      </ol>

      <div className="scan-actions">
        {!cameraOk ? (
          <Link href="/park-hunt" className="btn btn-gold btn-lg">
            Back to the Eagle
          </Link>
        ) : null}
        <Link href="/" className="btn btn-ghost">
          <Home aria-hidden className="h-5 w-5" />
          Home
        </Link>
      </div>
    </div>
  );
}
