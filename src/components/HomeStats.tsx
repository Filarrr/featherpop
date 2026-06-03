"use client";

import Link from "next/link";
import { Flame, Feather, Trophy } from "lucide-react";
import { useActiveChild } from "@/lib/use-active-child";
import { totalFeathers } from "@/lib/child-profile";
import { FEATHER_META, FEATHER_ORDER, levelFor, nextLevel } from "@/lib/levels";

export function HomeStats({ nickname }: { nickname?: string }) {
  const { progress, activeChildId, ready } = useActiveChild();
  if (!ready) return null;

  const total = totalFeathers(progress);
  const level = levelFor(total);
  const next = nextLevel(total);
  const toNext = next ? Math.max(0, next.min - total) : 0;

  if (!activeChildId) {
    return (
      <div className="home-stats">
        <p>
          No child profile yet.{" "}
          <Link
            href="/account/profiles"
            style={{ color: "var(--gold)", fontWeight: 700 }}
          >
            Add one →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="home-stats">
      {nickname ? <strong className="home-stats-name">{nickname}</strong> : null}
      <div className="home-stats-row">
        <span className="level-pill">
          <Trophy aria-hidden className="h-4 w-4" />
          {level.title}
        </span>
        <span className="streak-pill">
          <Flame aria-hidden className="h-4 w-4" />
          {progress.streakDays}-day streak
        </span>
        <span className="feather-pill">
          <Feather aria-hidden className="h-4 w-4" />
          {total} feathers
        </span>
        <span className="pop-pill">{progress.featherPop} FeatherPop</span>
      </div>
      {next ? (
        <p className="home-stats-next">
          {toNext} more {toNext === 1 ? "feather" : "feathers"} → {next.title}
        </p>
      ) : (
        <p className="home-stats-next">Top level! Keep flying high.</p>
      )}
      <div className="home-feather-strip" aria-hidden>
        {FEATHER_ORDER.map((f) => {
          const m = FEATHER_META[f];
          const n = progress.feathers[f] ?? 0;
          return (
            <span
              key={f}
              className={`feather-chip ${n > 0 ? "is-on" : ""}`}
              style={{
                ["--feather-color" as string]: m.color,
                ["--feather-glow" as string]: m.glow,
              }}
              title={`${m.name}: ${n}`}
            >
              {n}
            </span>
          );
        })}
      </div>
    </div>
  );
}
