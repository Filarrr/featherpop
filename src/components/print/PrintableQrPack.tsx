"use client";

import Link from "next/link";
import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { appBaseUrl } from "@/lib/game-data";

/**
 * 5 printable station cards, one per page. Each card has:
 *  - Big station number
 *  - Large QR encoding the station's full app URL, so scanning with a
 *    normal phone camera opens the app straight at that station
 *  - Word list preview (so the parent can sanity-check before printing)
 *  - Tidy print stylesheet that hides nav + 1 page per station
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
            <span className="h-gradient">Park Hunt — 5 Station QRs</span>
          </h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            Print these on US Letter or A4 paper. Each station is its own
            page so you can cut, laminate, and hide them around the park.
            Word lists shown below are the current week&apos;s set —
            refreshes automatically every Monday.
          </p>
          <p className="mt-1 text-[var(--ink-soft)] text-sm">
            <strong>Week starting:</strong> {weekKey}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-gold"
            >
              <Printer aria-hidden className="h-5 w-5" />
              Print all 5 stations
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

      {stations.map((words, i) => {
        const stationNumber = i + 1;
        // Encode the FULL app URL so a normal phone camera (not just the
        // in-app scanner) opens the app straight at this station.
        const code = `${appBaseUrl}/park-hunt/station/${stationNumber}`;
        return (
          <article className="qr-card" key={stationNumber}>
            <header className="qr-card-head">
              <span className="qr-card-brand">Ms. Feather Pop · Park Hunt</span>
              <span className="qr-card-week">Week of {weekKey}</span>
            </header>
            <h2 className="qr-card-title">
              Station {stationNumber}
            </h2>
            <div className="qr-card-qr">
              <QRCodeSVG
                value={code}
                size={260}
                bgColor="#ffffff"
                fgColor="#1a0f3a"
                level="H"
                marginSize={2}
              />
              <p className="qr-card-payload">Station {stationNumber} · {code}</p>
            </div>
            <div className="qr-card-words">
              <h3>This station&apos;s 20 words</h3>
              <ol>
                {words.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ol>
            </div>
            <footer className="qr-card-foot">
              Scan with any phone camera — it opens Ms. Feather Pop at this station.
            </footer>
          </article>
        );
      })}
    </>
  );
}
