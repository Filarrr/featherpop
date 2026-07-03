"use client";

import Link from "next/link";
import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { appBaseUrl } from "@/lib/game-data";

/**
 * 6 printable station cards, one per page. Each card is a clean, kid-friendly
 * sign: brand, big station name, the QR (encoding the station's app URL so any
 * phone camera opens it), and a little feather flourish. The words are NOT
 * printed — they live in the app and rotate weekly; the physical sign never
 * changes.
 */
export function PrintableQrPack({
  stations,
  weekKey,
}: {
  stations: string[][];
  weekKey: string;
}) {
  return (
    <>
      <section className="no-print mx-auto max-w-2xl p-4">
        <div className="card">
          <span className="kicker">Members · Printable</span>
          <h1 className="h-display mt-2 text-3xl">
            <span className="h-gradient">Park Hunt — 6 Station QRs</span>
          </h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            Print these on US Letter or A4 paper. Each station is its own page,
            so you can cut, laminate, and place them around the park. Print
            once — the words behind each QR refresh automatically every Monday,
            so you never reprint.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-gold"
            >
              <Printer aria-hidden className="h-5 w-5" />
              Print all 6 stations
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
        // Encode the FULL app URL so a normal phone camera (not just the
        // in-app scanner) opens the app straight at this station.
        const code = `${appBaseUrl}/park-hunt/station/${stationNumber}`;
        return (
          <article className="qr-card" key={stationNumber}>
            <header className="qr-card-head">
              <span className="qr-card-brand">🪶 Ms. Feather Pop</span>
              <span className="qr-card-kicker">Park Hunt</span>
            </header>

            <div className="qr-card-body">
              <p className="qr-card-station-label">Station</p>
              <h2 className="qr-card-title">{stationNumber}</h2>

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

              <p className="qr-card-scan">📷 Scan me to start the hunt!</p>
            </div>

            <footer className="qr-card-foot">
              <span className="qr-card-feathers" aria-hidden>
                🪶 🪶 🪶
              </span>
              <span>Scan with any phone camera to play.</span>
            </footer>
          </article>
        );
      })}
    </>
  );
}
