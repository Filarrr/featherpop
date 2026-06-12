"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Gift,
  HelpCircle,
  Palette,
  Puzzle,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useActiveChild } from "@/lib/use-active-child";
import { claimRewardAction } from "@/lib/child-progress-actions";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";
import { childCheer, fanfare, pop, wordReveal } from "@/lib/audio";

interface ShopReward {
  id: string;
  title: string;
  cost: number;
  icon: typeof Palette;
  iconBg: string;
  buttonBg: string;
}

// Matches her spec exactly. Get-Reward action is wired in a follow-up
// pass (today it logs a placeholder; the deduction lives server-side).
const REWARDS: ShopReward[] = [
  {
    id: "coloring",
    title: "Surprise Coloring Page",
    cost: 100,
    icon: Palette,
    iconBg: "linear-gradient(135deg, #ffe7a0, #ffd14a)",
    buttonBg: "linear-gradient(135deg, var(--pink), var(--magenta))",
  },
  {
    id: "puzzle",
    title: "Surprise Puzzle",
    cost: 100,
    icon: Puzzle,
    iconBg: "linear-gradient(135deg, #cfe8ff, #7cd1ff)",
    buttonBg: "linear-gradient(135deg, var(--sky-4), #4cb6e0)",
  },
  {
    id: "character",
    title: "Surprise Character Card",
    cost: 150,
    icon: UserIcon,
    iconBg: "linear-gradient(135deg, #e2d2ff, #b13bff)",
    buttonBg: "linear-gradient(135deg, var(--purple), var(--magenta))",
  },
  {
    id: "mystery",
    title: "Mystery Reward",
    cost: 250,
    icon: HelpCircle,
    iconBg: "linear-gradient(135deg, #ffd6f0, #ff7ab8)",
    buttonBg: "linear-gradient(135deg, #ff9a3a, #ff6b3a)",
  },
];

export function RewardsClient() {
  const router = useRouter();
  const { progress, active } = useActiveChild();
  const featherPop = progress.featherPop;

  const [pending, setPending] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<ShopReward | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function claim(reward: ShopReward) {
    if (featherPop < reward.cost || pending) return;
    setPending(reward.id);
    setError(null);
    try {
      const result = await claimRewardAction(reward.id, reward.cost);
      if (!result.ok) {
        setError(result.reason);
        return;
      }
      pop();
      window.setTimeout(() => wordReveal(), 200);
      window.setTimeout(() => fanfare(), 700);
      window.setTimeout(() => childCheer(), 1200);
      setUnlocked(reward);
      router.refresh();
    } catch (err) {
      console.warn("[rewards] claim failed:", err);
      setError("Couldn't claim — try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="prizes-page">
      {/* Header — My Feathers count + Ms. Feather Pop avatar */}
      <header className="prizes-header">
        <Link href="/" aria-label="Back" className="prizes-back">
          <span aria-hidden>←</span>
        </Link>
        <div className="prizes-header-mid">
          <h1>My Feathers</h1>
          <div className="prizes-balance">
            <span className="prizes-balance-feather" aria-hidden>🪶</span>
            <strong>{featherPop}</strong>
            <small>Feathers</small>
          </div>
        </div>
        <div className="prizes-header-avatar" aria-hidden>
          <MsFeatherPopAvatar
            pose={active ? "cheer" : "wave"}
            size={92}
          />
        </div>
      </header>

      {/* Choose a Reward */}
      <section className="prizes-choose">
        <h2 className="prizes-choose-title">
          <span className="prizes-choose-icon" aria-hidden>🎁</span>
          Choose a Reward!
        </h2>
        <p className="prizes-choose-sub">
          Spend your <strong>feathers</strong> to get awesome surprises!
        </p>
      </section>

      {/* 4 reward cards */}
      <section className="prizes-grid">
        {REWARDS.map((r) => {
          const Icon = r.icon;
          const canAfford = featherPop >= r.cost;
          const remaining = Math.max(0, r.cost - featherPop);
          return (
            <article
              key={r.id}
              className={`prize-card ${canAfford ? "is-available" : "is-locked"}`}
            >
              <div className="prize-card-art" style={{ background: r.iconBg }}>
                <Icon aria-hidden className="prize-card-icon" />
                <span className="prize-card-stars" aria-hidden>✨</span>
              </div>
              <h3>{r.title}</h3>
              <p className="prize-card-cost">
                <span aria-hidden>🪶</span> <strong>{r.cost}</strong> Feathers
              </p>
              <button
                type="button"
                onClick={() => claim(r)}
                disabled={!canAfford || pending === r.id}
                className="prize-card-button"
                style={{ background: canAfford ? r.buttonBg : undefined }}
              >
                {pending === r.id
                  ? "Unlocking…"
                  : canAfford
                    ? "GET REWARD"
                    : `Need ${remaining} more`}
              </button>
            </article>
          );
        })}
      </section>

      {/* Ultimate Achievement — Golden Feather */}
      <section className="prizes-ultimate">
        <span className="prizes-ultimate-band">★ THE ULTIMATE ACHIEVEMENT ★</span>
        <div className="prizes-ultimate-grid">
          <div className="prizes-ultimate-trophy" aria-hidden>
            <span>🪶</span>
          </div>
          <div className="prizes-ultimate-body">
            <h3 className="prizes-ultimate-title">GOLDEN FEATHER</h3>
            <p className="prizes-ultimate-tag">The Rarest Reward of All!</p>
            <p className="prizes-ultimate-req">
              Complete <strong>1,000 words</strong> in a Month
            </p>
            <ul className="prizes-ultimate-items">
              <li>🏆<span>Golden Feather Badge</span></li>
              <li>🥚<span>Golden Egg</span></li>
              <li>🦅<span>Golden Eagle Coloring Pack</span></li>
              <li>📜<span>Achievement Certificate</span></li>
            </ul>
          </div>
          <div className="prizes-ultimate-side">
            <p>
              Only the most dedicated readers earn the Golden Feather!
            </p>
            <span className="prizes-ultimate-crown" aria-hidden>👑</span>
            <p className="prizes-ultimate-encourage">You can do it!</p>
          </div>
        </div>
      </section>

      {error ? (
        <p className="prize-claim-error" role="alert">{error}</p>
      ) : null}

      {unlocked ? (
        <div className="prize-unlock-modal" role="dialog">
          <div className="prize-unlock-card">
            <span className="kicker">
              <Sparkles aria-hidden className="h-4 w-4" />
              Reward unlocked!
            </span>
            <h2 className="h-display">
              <span className="h-gradient">{unlocked.title}</span>
            </h2>
            <p>Your surprise is on the way!</p>
            <button
              type="button"
              onClick={() => setUnlocked(null)}
              className="btn btn-gold btn-lg"
            >
              <Gift aria-hidden className="h-5 w-5" />
              Got it!
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
