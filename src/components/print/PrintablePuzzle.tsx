"use client";

import Link from "next/link";
import { Printer } from "lucide-react";
import { WordSearch } from "@/components/prizes/WordSearch";

export function PrintablePuzzle({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) {
  return (
    <>
      <section className="no-print mx-auto max-w-2xl p-4">
        <div className="card">
          <span className="kicker">Printable · Puzzle</span>
          <h1 className="h-display mt-2 text-3xl">
            <span className="h-gradient">{title}</span>
          </h1>
          <p className="mt-2 text-[var(--ink-soft)]">{description}</p>
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
            <WordSearch id={id} size={420} />
          </div>
        </div>
      </section>

      <section className="print-only">
        <div className="print-page-card">
          <WordSearch id={id} size={720} />
        </div>
      </section>
    </>
  );
}
