"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { Camera, Home, Sparkles } from "lucide-react";
import { ding } from "@/lib/audio";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";
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
  const [status, setStatus] = useState(
    "Point your camera at a station QR code.",
  );
  const [cameraOk, setCameraOk] = useState(true);

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
            controlsRef.current?.stop();
            router.push(`/park-hunt/station/${stationId + 1}`);
          },
        );
        if (mounted) controlsRef.current = controls;
        else controls.stop();
      } catch {
        setCameraOk(false);
        setStatus(
          "We couldn't open the camera. Allow camera access, then reload.",
        );
      }
    }

    start();
    return () => {
      mounted = false;
      controlsRef.current?.stop();
    };
  }, [router]);

  return (
    <div className="parkhunt">
      <header className="parkhunt-head">
        <span className="kicker">
          <Sparkles aria-hidden className="h-4 w-4" />
          Park Hunt
        </span>
        <h1 className="h-display parkhunt-title">
          <span className="h-gradient">Scan a station QR</span>
        </h1>
        <p className="parkhunt-subtitle">
          Walk around the park and scan the numbered QR stations. When you
          scan the station that lists the eagle&apos;s word, you pass!
        </p>
      </header>

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
            <MsFeatherPopAvatar pose="hint" size={120} />
          </div>
          <ol className="parkhunt-steps">
            <li>
              <strong>1.</strong> Find a numbered QR station in the park.
            </li>
            <li>
              <strong>2.</strong> Scan it with the camera.
            </li>
            <li>
              <strong>3.</strong> If the eagle&apos;s word is on that station,
              you win a feather!
            </li>
          </ol>
          {!cameraOk ? (
            <Link href="/park-hunt" className="btn btn-gold">
              <Camera aria-hidden className="h-5 w-5" />
              Back to the Eagle
            </Link>
          ) : null}
          <Link href="/" className="btn btn-ghost">
            <Home aria-hidden className="h-5 w-5" />
            Home
          </Link>
        </aside>
      </div>
    </div>
  );
}
