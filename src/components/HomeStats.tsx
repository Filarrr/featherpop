"use client";

import Link from "next/link";
import { Flame, Feather, Trophy, Sparkles } from "lucide-react";
import { useActiveChild } from "@/lib/use-active-child";
import { totalFeathers } from "@/lib/child-profile";
import { FEATHER_META, FEATHER_ORDER, levelFor, nextLevel } from "@/lib/levels";
import { CountUp } from "./CountUp";

export function HomeStats({ nickname }: { nickname?: string }) {
  const { progress, activeChildId } = useActiveChild();

  if (!activeChildId) {
    return (
      <div className="home-stats home-stats-empty">
        <Sparkles aria-hidden className="h-5 w-5" />
        <p>
          Pick a child to begin.{" "}
          <Link
            href="/account/profiles"
            style={{ color: "var(--gold)", fontWeight: 800 }}
          >
            Choose →
          </Link>
        </p>
      </div>
    );
  }

  const total = totalFeathers(progress);
  const level = levelFor(total);
  const next = nextLevel(total);
  const toNext = next ? Math.max(0, next.min - total) : 0;
  const pct = next
    ? Math.min(100, Math.round(((total - level.min) / Math.max(1, next.min - level.min)) * 100))
    : 100;

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
          <CountUp to={progress.streakDays} duration={600} />
          <span>-day streak</span>
        </span>
        <span className="feather-pill">
          <Feather aria-hidden className="h-4 w-4" />
          <CountUp to={total} duration={700} />
          <span>&nbsp;feathers</span>
        </span>
        <span className="pop-pill">
          <CountUp to={progress.featherPop} duration={700} />
          <span>&nbsp;FeatherPop</span>
        </span>
      </div>

      <div className="level-progress" aria-hidden>
        <span style={{ width: `${pct}%` }} />
      </div>
      {next ? (
        <p className="home-stats-next">
          {toNext} more {toNext === 1 ? "feather" : "feathers"} → <strong>{next.title}</strong>
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
