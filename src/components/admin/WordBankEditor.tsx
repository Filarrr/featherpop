"use client";

import { useMemo, useState, useTransition } from "react";
import { Save } from "lucide-react";
import { saveGlobalWordBankAction } from "@/lib/global-content-actions";

/**
 * Owner editor for the global Park Hunt word bank. The bank is the pool the
 * weekly 5×20 station lists are drawn from. Edits apply to every family on
 * the next page load (and the printable QR pack updates to match).
 */
export function WordBankEditor({ initial }: { initial: string[] }) {
  const [text, setText] = useState(initial.join("\n"));
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  const words = useMemo(
    () =>
      Array.from(
        new Set(
          text
            .split(/[\s,]+/)
            .map((w) => w.toUpperCase().trim())
            .filter((w) => /^[A-Z]{2,12}$/.test(w)),
        ),
      ),
    [text],
  );

  function save() {
    setStatus("Saving…");
    startTransition(async () => {
      const res = await saveGlobalWordBankAction(words);
      setStatus(
        res.ok
          ? `Saved ${res.count} words for everyone ✓`
          : `Error: ${res.reason}`,
      );
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="card">
        <span className="kicker">Word bank · global</span>
        <h2 className="h-display mt-2 text-3xl">Park Hunt words</h2>
        <p className="text-sm text-[var(--ink-soft)]">
          One word per line (or separated by spaces/commas). 2–12 letters,
          A–Z only. These feed the weekly station lists for every family.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={20}
          spellCheck={false}
          className="mt-4 w-full rounded-2xl border p-3 font-mono text-sm"
          style={{ borderColor: "var(--line, #e5e0f0)" }}
          aria-label="Park Hunt word bank"
        />
      </section>

      <aside className="card content-start">
        <span className="kicker">Summary</span>
        <p className="mt-2 text-4xl font-black">
          {words.length}
          <span className="ml-2 text-base font-bold text-[var(--ink-soft)]">
            valid words
          </span>
        </p>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Need at least 160 to fill all 8 stations without repeats (minimum 20
          to save).
        </p>
        {words.length < 160 ? (
          <p className="mt-2 text-sm font-bold text-[var(--pink, #ff2d8e)]">
            ⚠ Fewer than 160 words — some stations will repeat words.
          </p>
        ) : null}
        {status ? (
          <p className="mt-3 text-sm font-bold" aria-live="polite">
            {status}
          </p>
        ) : null}
        <button
          type="button"
          onClick={save}
          disabled={pending || words.length < 20}
          className="btn btn-primary mt-4"
        >
          <Save aria-hidden className="h-4 w-4" />
          {pending ? "Saving…" : "Save for everyone"}
        </button>
      </aside>
    </div>
  );
}
