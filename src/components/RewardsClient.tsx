"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, Gift, LockKeyhole, Trophy } from "lucide-react";
import { listRewards } from "@/lib/admin-store";
import { Reward } from "@/lib/game-data";
import {
  PlayerProgress,
  defaultProgress,
  readProgress,
} from "@/lib/player";

export function RewardsClient() {
  const [progress, setProgress] = useState<PlayerProgress>(defaultProgress);
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    setProgress(readProgress());
    setRewards(listRewards().filter((r) => r.active));
  }, []);

  return (
    <div className="grid gap-4">
      <div className="card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="kicker">Wallet</span>
            <h2 className="h-display mt-2 text-3xl">
              <span className="h-gradient">{progress.totalFeatherPop}</span>{" "}
              FeatherPop
            </h2>
          </div>
          <Link href="/scan" className="btn btn-primary btn-sm">
            <Camera aria-hidden className="h-4 w-4" />
            Earn more
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {rewards.map((r) => {
          const unlocked = progress.totalFeatherPop >= r.featherpopRequired;
          const remaining = Math.max(
            0,
            r.featherpopRequired - progress.totalFeatherPop,
          );
          const pct = Math.min(
            1,
            progress.totalFeatherPop / r.featherpopRequired,
          );
          return (
            <article
              key={r.id}
              className={`tier ${unlocked ? "is-unlocked" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className="grid h-11 w-11 place-items-center rounded-2xl text-white"
                  style={{
                    background: unlocked
                      ? "linear-gradient(135deg, var(--gold), #ff9f3a)"
                      : "linear-gradient(135deg, var(--purple), var(--magenta))",
                  }}
                >
                  {unlocked ? (
                    <Trophy aria-hidden className="h-5 w-5" />
                  ) : (
                    <LockKeyhole aria-hidden className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`tier-pill ${unlocked ? "unlocked" : "locked"}`}
                >
                  {unlocked ? "Unlocked" : `${remaining} to go`}
                </span>
              </div>

              <h3 className="h-display text-2xl">{r.name}</h3>
              <p className="text-sm text-[var(--ink-soft)]">{r.description}</p>

              <div className="progress-bar">
                <span style={{ transform: `scaleX(${pct})` }} />
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-[var(--ink-soft)]">
                <span>{r.featherpopRequired} FeatherPop required</span>
                <span className="inline-flex items-center gap-1">
                  <Gift className="h-3.5 w-3.5" /> {r.type}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
