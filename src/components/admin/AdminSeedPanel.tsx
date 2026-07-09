"use client";

import { useState, useTransition } from "react";
import { Beaker, BookOpen, Feather } from "lucide-react";
import { adminSeedAction } from "@/lib/child-progress-actions";
import { WORDS_TO_HATCH } from "@/lib/child-profile";

export interface ChildSeedInfo {
  id: string;
  nickname: string;
  featherPop: number;
  wordsInEgg: number;
}

export function AdminSeedPanel({
  userId,
  children,
}: {
  userId: string;
  children: ChildSeedInfo[];
}) {
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState(children[0]?.id ?? "");
  const [msg, setMsg] = useState<string | null>(null);

  const selected = children.find((c) => c.id === selectedId);

  function seed(type: "feathers" | "words", amount: number) {
    if (!selectedId) return;
    setMsg(null);
    startTransition(async () => {
      const res = await adminSeedAction({ childId: selectedId, type, amount });
      if (res.ok) {
        setMsg(
          type === "feathers"
            ? `+${amount} added → ${res.newValue.toLocaleString()} total FeatherPop`
            : `Egg set to ${res.newValue}/${WORDS_TO_HATCH} words`,
        );
      } else {
        setMsg(`Error: ${res.error}`);
      }
    });
  }

  if (children.length === 0) {
    return (
      <div className="admin-seed-panel">
        <p className="text-sm text-[var(--ink-soft)]">No children on this account.</p>
      </div>
    );
  }

  return (
    <div className="admin-seed-panel">
      <span className="kicker mb-2">
        <Beaker aria-hidden className="h-3 w-3" />
        Seed
      </span>

      {children.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {children.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setSelectedId(c.id); setMsg(null); }}
              className={`btn btn-sm ${selectedId === c.id ? "btn-gold" : "btn-ghost"}`}
            >
              {c.nickname}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <p className="mb-2 text-xs text-[var(--ink-soft)]">
          {selected.nickname} · {selected.featherPop.toLocaleString()} FeatherPop ·{" "}
          {selected.wordsInEgg}/{WORDS_TO_HATCH} egg words
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-[var(--ink-soft)]">
          <Feather aria-hidden className="mr-0.5 inline h-3 w-3" />
          Feathers:
        </span>
        {[100, 250, 500, 1000].map((n) => (
          <button
            key={n}
            type="button"
            disabled={pending || !selectedId}
            onClick={() => seed("feathers", n)}
            className="btn btn-gold btn-sm"
          >
            +{n}
          </button>
        ))}

        <span className="ml-2 text-xs font-bold text-[var(--ink-soft)]">
          <BookOpen aria-hidden className="mr-0.5 inline h-3 w-3" />
          Words:
        </span>
        <button
          type="button"
          disabled={pending || !selectedId}
          onClick={() => seed("words", WORDS_TO_HATCH - 1)}
          className="btn btn-ghost btn-sm"
        >
          Near hatch ({WORDS_TO_HATCH - 1}/{WORDS_TO_HATCH})
        </button>
        <button
          type="button"
          disabled={pending || !selectedId}
          onClick={() => seed("words", 0)}
          className="btn btn-ghost btn-sm"
        >
          Reset egg
        </button>
      </div>

      {msg && (
        <p className="mt-2 text-sm font-bold" role="status">
          {msg}
        </p>
      )}
    </div>
  );
}
