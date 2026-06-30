"use client";

import Link from "next/link";
import { Printer } from "lucide-react";
import { ColoringScene } from "@/components/prizes/ColoringScene";
import { COLORING_COLORED_EXAMPLE } from "@/lib/prize-library";

export function PrintableColoring({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) {
  // The rainbow wings page ships with a fully-coloured example to inspire.
  const coloredExample = id === "rainbow-wings" ? COLORING_COLORED_EXAMPLE : null;
  return (
    <>
      <section className="no-print mx-auto max-w-2xl p-4">
        <div className="card">
          <span className="kicker">Printable · Coloring</span>
          <h1 className="h-display mt-2 text-3xl">
            <span className="h-gradient">{title}</span>
          </h1>
          <p className="mt-2 text-[var(--ink-soft)]">{description}</p>
          <p className="mt-2 text-[var(--ink-soft)] text-sm">
            🔍 Each scene has a tiny hidden feather — see if your kid can find
            it while coloring.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-gold btn-lg"
              onClick={() => window.print()}
            >
              <Printer aria-hidden className="h-5 w-5" />
              Print
            </button>
            <Link href="/rewards" className="btn btn-ghost">
              Back to prizes
            </Link>
          </div>
          <div className="mt-5 mx-auto" style={{ maxWidth: 420 }}>
            <ColoringScene id={id} size={420} />
          </div>
          {coloredExample ? (
            <div className="mt-4 mx-auto text-center" style={{ maxWidth: 280 }}>
              <span className="kicker">All colored in!</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coloredExample}
                alt="Example of the page colored in"
                style={{ width: "100%", height: "auto", borderRadius: 16, marginTop: 8 }}
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="print-only">
        <div className="print-page-card">
          <ColoringScene id={id} size={720} />
        </div>
      </section>
    </>
  );
}
