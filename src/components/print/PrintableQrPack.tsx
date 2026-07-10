"use client";

import Link from "next/link";
import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { STATION_COUNT, STATION_THEMES } from "@/lib/park-hunt";
import { appBaseUrl } from "@/lib/game-data";

/**
 * "Where the Magic Begins" — 8 printable station signs, one per page. Each
 * sign walks children one step further through Pop's story: station name,
 * story tagline, the QR (encoding the station's app URL so any phone camera
 * opens it), and the "Scan • Play • Learn" motto. The words are NOT
 * printed — they live in the app and rotate weekly; the physical sign never
 * changes.
 */
export function PrintableQrPack({
  stations,
}: {
  stations: string[][];
}) {
  return (
    <>
      <section className="no-print mx-auto max-w-2xl p-4">
        <div className="card">
          <span className="kicker">Members · Printable</span>
          <h1 className="h-display mt-2 text-3xl">
            <span className="h-gradient">
              Where the Magic Begins — {STATION_COUNT} Station Signs
            </span>
          </h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            Print these on US Letter or A4 paper. Each station is its own page,
            so you can cut, laminate, and place them around the park in story
            order — children walk through Pop&apos;s adventure from the School
            Gate to the Celebration Circle. Print once — the words behind each
            QR refresh automatically every Monday, so you never reprint.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-gold"
            >
              <Printer aria-hidden className="h-5 w-5" />
              Print all {STATION_COUNT} stations
            </button>
            <Link href="/admin" className="btn btn-ghost">
              Back to admin
            </Link>
            <Link href="/" className="btn btn-ghost">
              Home
            </Link>
          </div>
        </div>
      </section>

      {stations.map((_words, i) => {
        const stationNumber = i + 1;
        const theme = STATION_THEMES[i];
        const stationName = theme?.label ?? `Station ${stationNumber}`;
        // Encode the FULL app URL so a normal phone camera (not just the
        // in-app scanner) opens the app straight at this station.
        const code = `${appBaseUrl}/park-hunt/station/${stationNumber}`;
        return (
          <article className="qr-card" key={stationNumber}>
            <header className="qr-card-head">
              <span className="qr-card-brand">🪶 Ms. Feather Pop</span>
              <span className="qr-card-kicker">Where the Magic Begins</span>
            </header>

            <div className="qr-card-body">
              <p className="qr-card-station-label">
                {theme?.emoji ? `${theme.emoji} ` : ""}Adventure Station{" "}
                {stationNumber} of {STATION_COUNT}
              </p>
              <h2 className="qr-card-title">{stationName}</h2>
              {theme?.tagline ? (
                <p
                  className="qr-card-station-sub"
                  style={{ fontStyle: "italic" }}
                >
                  &ldquo;{theme.tagline}&rdquo;
                </p>
              ) : null}

              <div className="qr-card-qr">
                <QRCodeSVG
                  value={code}
                  size={280}
                  bgColor="#ffffff"
                  fgColor="#1a0f3a"
                  level="H"
                  marginSize={2}
                />
              </div>

              <p className="qr-card-scan">📷 Scan • Play • Learn</p>
            </div>

            <footer className="qr-card-foot">
              <span className="qr-card-feathers" aria-hidden>
                🪶 🪶 🪶
              </span>
              <span>
                Finish this station to earn another feather on your journey!
              </span>
            </footer>
          </article>
        );
      })}
    </>
  );
}
