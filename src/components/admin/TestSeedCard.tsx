"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Beaker, Feather } from "lucide-react";
import { seedFeathersAction } from "@/lib/child-progress-actions";

/**
 * Admin test helpers. Quick-add buttons that bump FeatherPop on the
 * active child so the parent can exercise the rewards / spin / membership
 * flows without grinding word counts.
 */
export function TestSeedCard() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function bump(n: number) {
    startTransition(async () => {
      const res = await seedFeathersAction(n);
      if (res.ok) {
        setMsg(`+${n} added → total ${res.featherPop} FeatherPop`);
        router.refresh();
      } else {
        setMsg(res.reason);
      }
    });
  }

  return (
    <section className="admin-section">
      <header className="admin-section-head">
        <span className="kicker">
          <Beaker aria-hidden className="h-4 w-4" />
          Testing helpers
        </span>
        <h2 className="h-display text-2xl">Seed FeatherPop</h2>
        <p className="text-[var(--ink-soft)]">
          Adds FeatherPop straight onto the active child. Skips word-count,
          egg progress, and Golden Feather tracking — pure wallet bump so
          you can exercise the rewards shop without grinding.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {[100, 250, 500, 1000].map((n) => (
          <button
            key={n}
            type="button"
            disabled={pending}
            onClick={() => bump(n)}
            className="btn btn-gold"
          >
            <Feather aria-hidden className="h-4 w-4" />
            +{n}
          </button>
        ))}
      </div>
      {msg ? (
        <p className="mt-2 text-sm text-[var(--ink-soft)]" role="status">
          {msg}
        </p>
      ) : null}
    </section>
  );
}
