"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Beaker } from "lucide-react";
import { seedWordsAction } from "@/lib/child-progress-actions";
import { WORDS_TO_HATCH } from "@/lib/child-profile";

/**
 * Temporary test tool — only renders when the URL has ?seed=1. Sets the active
 * child's egg progress so you can play a few more words and see the hatch.
 */
export function TestSeedWords() {
  const params = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  if (params.get("seed") !== "1") return null;

  function seed(n: number) {
    startTransition(async () => {
      const res = await seedWordsAction(n);
      if (res.ok) {
        setMsg(
          `Egg set to ${res.wordsInEgg}/${WORDS_TO_HATCH} words — play ${
            WORDS_TO_HATCH - res.wordsInEgg
          } more to hatch!`,
        );
        router.refresh();
      } else {
        setMsg(res.reason);
      }
    });
  }

  return (
    <section className="card mx-auto mb-4 max-w-lg">
      <span className="kicker">
        <Beaker aria-hidden className="mr-1 inline h-4 w-4" />
        Test tools
      </span>
      <h2 className="h-display mt-1 text-2xl">Seed egg words</h2>
      <p className="text-sm text-[var(--ink-soft)]">
        Sets the active child&apos;s egg progress so you can test hatching.
        Then play Letter Pop / Park Hunt to cross 50 and see the hatch.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          WORDS_TO_HATCH - 1,
          Math.max(0, WORDS_TO_HATCH - 5),
          0,
        ].map((n) => (
          <button
            key={n}
            type="button"
            disabled={pending}
            onClick={() => seed(n)}
            className="btn btn-gold"
          >
            Set to {n}
          </button>
        ))}
      </div>
      {msg ? (
        <p className="mt-2 text-sm font-bold" role="status">
          {msg}
        </p>
      ) : null}
    </section>
  );
}
