"use client";

import Link from "next/link";
import { Printer } from "lucide-react";

export function GoldenCertificateClient({
  nickname,
  month,
  hasEarned,
}: {
  nickname: string;
  month: string;
  hasEarned: boolean;
}) {
  return (
    <>
      {/* No-print toolbar */}
      <section className="no-print mx-auto max-w-2xl p-4">
        <div className="card">
          <span className="kicker">Printable</span>
          <h1 className="h-display mt-2 text-3xl">
            <span className="h-gradient">Golden Feather Certificate</span>
          </h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            {hasEarned
              ? `${nickname} earned the Golden Feather. Print this on US Letter or A4 paper — it's already sized to fit.`
              : `${nickname} hasn't earned the Golden Feather yet (1000 words in one month). Keep reading!`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-gold"
              disabled={!hasEarned}
            >
              <Printer aria-hidden className="h-5 w-5" />
              Print certificate
            </button>
            <Link href="/progress" className="btn btn-ghost">
              Back to My Progress
            </Link>
          </div>
        </div>
      </section>

      {/* The actual certificate (prints to one page) */}
      <article className="golden-cert">
        <div className="golden-cert-frame">
          <div className="golden-cert-corner top-left" aria-hidden />
          <div className="golden-cert-corner top-right" aria-hidden />
          <div className="golden-cert-corner bottom-left" aria-hidden />
          <div className="golden-cert-corner bottom-right" aria-hidden />

          <div className="golden-cert-medal" aria-hidden>
            <svg viewBox="0 0 200 240" width="180" height="216">
              <defs>
                <linearGradient id="gc-gold" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#fff8b0" />
                  <stop offset="0.4" stopColor="#ffd14a" />
                  <stop offset="1" stopColor="#a86800" />
                </linearGradient>
                <radialGradient id="gc-glow" cx="50%" cy="40%" r="55%">
                  <stop offset="0" stopColor="#fff" />
                  <stop offset="1" stopColor="#ffd14a" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Ribbons */}
              <path d="M 60 0 L 100 90 L 100 130 L 140 0 Z" fill="#a86bff" />
              <path d="M 60 0 L 100 90 L 100 130 L 70 130 Z" fill="#6a2dff" />
              <path d="M 140 0 L 100 90 L 100 130 L 130 130 Z" fill="#7e22ce" />
              {/* Medallion */}
              <circle cx="100" cy="160" r="72" fill="url(#gc-glow)" opacity="0.6" />
              <circle cx="100" cy="160" r="60" fill="url(#gc-gold)" stroke="#a86800" strokeWidth="2" />
              <circle cx="100" cy="160" r="52" fill="none" stroke="#a86800" strokeWidth="1" strokeDasharray="2 3" />
              {/* Feather glyph */}
              <g transform="translate(100 132)">
                <path
                  d="M 0 0 C 18 16, 24 38, 18 60 C 14 70, 6 76, 0 78 C -6 76, -14 70, -18 60 C -24 38, -18 16, 0 0 Z"
                  fill="#fff8b0"
                  stroke="#a86800"
                  strokeWidth="1.5"
                />
                <path d="M 0 8 L 0 72" stroke="#a86800" strokeWidth="1.5" />
                {[18, 28, 38, 50].map((y) => (
                  <g key={y}>
                    <path d={`M 0 ${y} Q -10 ${y + 2} -16 ${y + 6}`} stroke="#a86800" strokeWidth="1" fill="none" />
                    <path d={`M 0 ${y} Q 10 ${y + 2} 16 ${y + 6}`} stroke="#a86800" strokeWidth="1" fill="none" />
                  </g>
                ))}
              </g>
            </svg>
          </div>

          <p className="golden-cert-kicker">Ms. Feather Pop · Reading Adventures</p>
          <h2 className="golden-cert-title">Certificate of the Golden Feather</h2>
          <p className="golden-cert-presented">This certificate is presented to</p>
          <p className="golden-cert-name">{nickname}</p>
          <p className="golden-cert-body">
            for finding <strong>1,000 words</strong> in a single month
            <br />
            ({month}) — the rarest achievement in the flock.
          </p>
          <p className="golden-cert-tag">
            You read like a Feather Friend, you fly like a champion,
            <br />
            and your Golden Feather is forever yours.
          </p>

          <div className="golden-cert-sig">
            <div>
              <p className="line">Ms. Feather Pop</p>
              <p className="sublabel">Chief Feather Whisperer</p>
            </div>
            <div>
              <p className="line">{new Date().toLocaleDateString()}</p>
              <p className="sublabel">Date</p>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
