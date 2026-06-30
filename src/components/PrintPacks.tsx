"use client";

import Image from "next/image";
import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Challenge, getQuestUrl } from "@/lib/game-data";

export function PrintPacks({ challenges }: { challenges: Challenge[] }) {
  return (
    <div>
      <section className="no-print mb-6 grid gap-5 lg:grid-cols-[280px_1fr]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl">
          <Image
            src="/media/poster.jpeg"
            alt="Word Quest poster"
            fill
            sizes="280px"
            className="object-cover"
          />
        </div>
        <div className="card content-end">
          <span className="kicker">Parent home pack</span>
          <h1 className="h-display mt-2 text-4xl md:text-5xl">
            <span className="h-gradient">Printable Quest</span>
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
            Print these QR cards, scatter them around the room, and let your
            child scan each one to unlock a word challenge. Works with any
            phone camera.
          </p>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-primary mt-5 self-start"
          >
            <Printer aria-hidden className="h-5 w-5" />
            Print Pack
          </button>
        </div>
      </section>

      <div className="print-grid">
        {challenges.map((c) => (
          <article key={c.slug} className="print-card">
            <div className="flex items-start justify-between gap-2">
              <div className="text-left">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                  {c.qrLabel}
                </p>
                <h2 className="h-display text-2xl">Letter {c.mainLetter}</h2>
              </div>
              <span
                className="rounded-xl px-2 py-1 text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg, #ffe27a, var(--gold))",
                  color: "var(--ink)",
                }}
              >
                +{c.featherpopValue}
              </span>
            </div>

            <div className="qr-box">
              <QRCodeSVG
                value={getQuestUrl(c.slug)}
                size={168}
                level="M"
                includeMargin={false}
              />
            </div>

            <p className="h-display text-lg">{c.zone}</p>
            <p className="text-xs text-[var(--ink-soft)]">
              Scan to reveal {c.letters.length} letters and earn{" "}
              {c.featherpopValue} FeatherPop.
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
