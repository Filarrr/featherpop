"use client";

import { useActiveChild } from "@/lib/use-active-child";
import { totalFeathers } from "@/lib/child-profile";
import { FEATHER_META, FEATHER_ORDER, levelFor, nextLevel } from "@/lib/levels";

export function FeatherCollection() {
  const { progress, ready, activeChildId } = useActiveChild();
  if (!ready) return null;

  const total = totalFeathers(progress);
  const level = levelFor(total);
  const next = nextLevel(total);
  const pct = next
    ? Math.min(100, Math.round(((total - level.min) / (next.min - level.min)) * 100))
    : 100;

  return (
    <div className="feather-collection">
      <header className="feather-collection-head">
        <span className="kicker">Your feathers</span>
        <h1 className="h-display text-3xl">
          {total} of {FEATHER_ORDER.length * 5} collected
        </h1>
        <p className="text-[var(--ink-soft)]">
          Level: <strong>{level.title}</strong>
          {next ? (
            <>
              {" "}
              · Next: {next.title} ({next.min - total} more)
            </>
          ) : null}
        </p>
        <div className="level-progress" aria-hidden>
          <span style={{ width: `${pct}%` }} />
        </div>
      </header>

      {!activeChildId ? (
        <p className="text-[var(--ink-soft)]">
          Pick a child profile to start a feather collection.
        </p>
      ) : (
        <div className="feather-grid">
          {FEATHER_ORDER.map((f) => {
            const m = FEATHER_META[f];
            const n = progress.feathers[f] ?? 0;
            const unlocked = n > 0;
            return (
              <article
                key={f}
                className={`feather-tile ${unlocked ? "" : "is-locked"}`}
                style={{
                  ["--feather-color" as string]: m.color,
                  ["--feather-glow" as string]: m.glow,
                }}
              >
                <div className="feather-tile-orb" aria-hidden />
                <h3>{m.name}</h3>
                <p>{m.description}</p>
                <span className="feather-tile-count">×{n}</span>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
