"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Camera, RefreshCcw, Sparkles, Wallet as WalletIcon } from "lucide-react";
import { listChallenges } from "@/lib/admin-store";
import { Challenge } from "@/lib/game-data";
import {
  PlayerProfile,
  PlayerProgress,
  defaultProgress,
  readProfile,
  readProgress,
  resetPlayerState,
} from "@/lib/player";

export function WalletClient() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [progress, setProgress] = useState<PlayerProgress>(defaultProgress);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    setProfile(readProfile());
    setProgress(readProgress());
    setChallenges(listChallenges());
  }, []);

  function reset() {
    if (!confirm("Reset this player's wallet and quest history?")) return;
    resetPlayerState();
    setProfile(null);
    setProgress(defaultProgress);
  }

  const completedCount = progress.completedChallengeSlugs.length;
  const total = challenges.length || 1;

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <section className="balance">
        <WalletIcon aria-hidden className="h-12 w-12 text-[var(--gold)]" />
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-white/70">
          FeatherPop wallet
        </p>
        <p className="number">{progress.totalFeatherPop}</p>
        <p className="mt-2 font-bold text-white/85">
          {profile
            ? `${profile.nickname}'s adventure`
            : "Tap Start the Quest from home to claim a pass."}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Link href="/scan" className="btn btn-gold btn-sm">
            <Camera aria-hidden className="h-4 w-4" />
            Earn more
          </Link>
          <Link href="/rewards" className="btn btn-ghost btn-sm">
            <Sparkles aria-hidden className="h-4 w-4" />
            Spend
          </Link>
        </div>
      </section>

      <section className="card">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="kicker">Quest progress</span>
            <h2 className="h-display mt-2 text-3xl">
              {completedCount} / {challenges.length} completed
            </h2>
          </div>
          <button onClick={reset} className="btn btn-ghost btn-sm">
            <RefreshCcw aria-hidden className="h-4 w-4" />
            Reset
          </button>
        </div>

        <div className="progress-bar mb-4">
          <span style={{ transform: `scaleX(${completedCount / total})` }} />
        </div>

        <div className="row-list">
          {challenges.map((c) => {
            const done = progress.completedChallengeSlugs.includes(c.slug);
            return (
              <Link
                key={c.slug}
                href={`/quest/${c.slug}`}
                className={`row ${done ? "is-done" : ""}`}
              >
                <span>
                  <strong className="text-base">{c.targetWord}</strong>
                  <span className="ml-2 text-xs text-[var(--ink-soft)]">
                    {c.zone}
                  </span>
                </span>
                <span className="flex items-center gap-2 text-sm font-bold">
                  +{c.featherpopValue}
                  {done ? (
                    <BadgeCheck className="h-5 w-5 text-[var(--mint)]" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-[var(--ink-soft)]" />
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
