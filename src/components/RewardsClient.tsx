"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Lock, Sparkles, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActiveChild } from "@/lib/use-active-child";
import { useMembership } from "@/lib/use-membership";
import { claimRewardAction } from "@/lib/child-progress-actions";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";
import { RewardArt } from "@/components/rewards/RewardArt";
import { EggWidget } from "@/components/eggs/EggWidget";
import { MailingListForm } from "@/components/MailingListForm";
import { childCheer, fanfare, pop, wordReveal } from "@/lib/audio";

type Tier = "pink" | "blue" | "purple" | "orange";

interface ShopReward {
  id: string;
  title: string;
  tagline: string;
  cost: number;
  tier: Tier;
}

const REWARDS: ShopReward[] = [
  {
    id: "coloring",
    title: "Surprise Coloring Page",
    tagline: "Print + color today",
    cost: 100,
    tier: "pink",
  },
  {
    id: "puzzle",
    title: "Surprise Puzzle",
    tagline: "A brand-new brain teaser",
    cost: 100,
    tier: "blue",
  },
  {
    id: "character",
    title: "Surprise Character Card",
    tagline: "Collect them all",
    cost: 150,
    tier: "purple",
  },
  {
    id: "mystery",
    title: "Mystery Reward",
    tagline: "What's inside…?",
    cost: 250,
    tier: "orange",
  },
];

const ULTIMATE_PRIZES = [
  { emoji: "🏆", label: "Golden Feather Badge" },
  { emoji: "🥚", label: "Golden Egg" },
  { emoji: "🦅", label: "Eagle Coloring Pack" },
  { emoji: "📜", label: "Achievement Certificate" },
];

export function RewardsClient() {
  const router = useRouter();
  const { progress, active } = useActiveChild();
  const { isMember } = useMembership();
  const featherPop = progress.featherPop ?? 0;

  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function claim(reward: ShopReward) {
    // Rewards are a membership benefit — free families browse but can't claim.
    if (!isMember) {
      router.push("/membership?from=/rewards");
      return;
    }
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
      // Land on the prize celebration page so the kid sees what they
      // actually won (character card, coloring page, puzzle, or the
      // mystery box reveal). The claimAt timestamp keys into the
      // child's claimedRewards array on the server.
      router.push(`/prize/${result.claimAt}`);
      return;
    } catch (err) {
      console.warn("[rewards] claim failed:", err);
      setError("Couldn't claim — try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="prizes-page">
      <header className="prizes-header-v2">
        <Link href="/" aria-label="Back" className="prizes-back-v2">
          <span aria-hidden>←</span>
        </Link>
        <div className="prizes-header-mid-v2">
          <span className="prizes-eyebrow">
            <Sparkles aria-hidden className="h-4 w-4" />
            My Feathers
          </span>
          <div className="prizes-balance-v2">
            <span className="prizes-feather-emoji" aria-hidden>
              🪶
            </span>
            <strong>{featherPop.toLocaleString()}</strong>
            <small>Feathers</small>
          </div>
        </div>
        <div className="prizes-header-avatar-v2" aria-hidden>
          <MsFeatherPopAvatar pose={active ? "cheer" : "wave"} size={108} />
        </div>
      </header>

      {/* Magical egg — hatching lives here on the prizes page too. */}
      <section className="prizes-egg-section">
        <EggWidget />
      </section>

      {/* Collection book — so kids can revisit their character cards any
          time, not only right after a spin. */}
      <Link href="/collection" className="prizes-collection-link">
        <span className="prizes-collection-emoji" aria-hidden>🃏</span>
        <span className="prizes-collection-copy">
          <strong>My Collection</strong>
          <small>All the character cards you&apos;ve collected</small>
        </span>
        <ChevronRight aria-hidden className="h-5 w-5" />
      </Link>

      {!isMember ? (
        <Link href="/membership?from=/rewards" className="prizes-sub-banner">
          <Lock aria-hidden className="h-5 w-5" />
          <span>
            <strong>Rewards are for members.</strong> Subscribe for $9.99/month
            to claim prizes &amp; unlimited Park Hunt.
          </span>
          <ChevronRight aria-hidden className="h-5 w-5" />
        </Link>
      ) : null}

      <section className="prizes-choose-v2">
        <h1>
          <span className="prizes-gift-emoji" aria-hidden>
            🎁
          </span>
          Choose a Reward
        </h1>
        <p>
          Spend your <strong>feathers</strong> to unlock awesome surprises!
        </p>
      </section>

      <section className="prizes-grid-v2">
        {/* Spin Wheel — always accessible */}
        <Link href="/spin" className="prize-card-v2 tier-pink is-available prize-card-spin-link">
          <span className="prize-card-shine" aria-hidden />
          <div className="prize-card-art-v2" aria-hidden>
            <span style={{ fontSize: 64 }}>🎡</span>
          </div>
          <div className="prize-card-body">
            <h3>Spin Wheel</h3>
            <p className="prize-card-tagline">Use your free spins to win prizes!</p>
            <div className="prize-card-cost-v2">
              <Zap aria-hidden className="h-4 w-4" />
              <strong>Free</strong>
              <small>with hatched eggs</small>
            </div>
            <span className="prize-card-cta">
              <span>Go Spin!</span>
              <ChevronRight aria-hidden className="h-4 w-4" />
            </span>
          </div>
        </Link>

        {REWARDS.map((r) => {
          const canAfford = featherPop >= r.cost;
          const remaining = Math.max(0, r.cost - featherPop);
          return (
            <article
              key={r.id}
              className={`prize-card-v2 tier-${r.tier} ${
                canAfford ? "is-available" : "is-locked"
              }`}
            >
              <span className="prize-card-shine" aria-hidden />
              <div className="prize-card-art-v2">
                <RewardArt id={r.id} size={140} />
              </div>
              <div className="prize-card-body">
                <h3>{r.title}</h3>
                <p className="prize-card-tagline">{r.tagline}</p>
                <div className="prize-card-cost-v2">
                  <span aria-hidden>🪶</span>
                  <strong>{r.cost}</strong>
                  <small>Feathers</small>
                </div>
                <button
                  type="button"
                  onClick={() => claim(r)}
                  disabled={isMember && (!canAfford || pending === r.id)}
                  className="prize-card-cta"
                >
                  {!isMember ? (
                    <>
                      <Lock aria-hidden className="h-4 w-4" />
                      <span>Subscribe to unlock</span>
                    </>
                  ) : pending === r.id ? (
                    "Unlocking…"
                  ) : canAfford ? (
                    <>
                      <span>Get Reward</span>
                      <ChevronRight aria-hidden className="h-4 w-4" />
                    </>
                  ) : (
                    `Need ${remaining} more`
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="prizes-ultimate-v2">
        <span className="prizes-ultimate-band-v2">
          <Sparkles aria-hidden className="h-3 w-3" />
          THE ULTIMATE ACHIEVEMENT
          <Sparkles aria-hidden className="h-3 w-3" />
        </span>

        <div className="prizes-ultimate-hero">
          <div className="prizes-ultimate-spotlight" aria-hidden />
          <FeatherTrophy />
        </div>

        <h2 className="prizes-ultimate-title-v2">GOLDEN FEATHER</h2>
        <p className="prizes-ultimate-tag-v2">The Rarest Reward of All</p>
        <p className="prizes-ultimate-req-v2">
          Read <strong>1,000 words</strong> in one month
        </p>

        <div className="prizes-ultimate-grid-v2">
          {ULTIMATE_PRIZES.map((p) => (
            <div key={p.label} className="prizes-ultimate-tile">
              <span className="prizes-ultimate-tile-glyph" aria-hidden>
                {p.emoji}
              </span>
              <span>{p.label}</span>
            </div>
          ))}
        </div>

        <p className="prizes-ultimate-footer">
          Only the most dedicated readers earn the Golden Feather.{" "}
          <strong>You can do it!</strong>
        </p>
      </section>

      {/* Premium — Coming Soon. Surfaced here on the Prizes tab where families
          actually look, with the interest-list signup. */}
      <section className="prizes-premium">
        <span className="prizes-premium-band">
          <Sparkles aria-hidden className="h-3 w-3" />
          COMING SOON · PREMIUM $23.99/mo
        </span>
        <h2 className="prizes-premium-title">The VIP Experience</h2>
        <ul className="prizes-premium-list">
          <li><span aria-hidden>🎤</span> Meet &amp; greet Miss Feather Pop</li>
          <li><span aria-hidden>📸</span> Photos with Miss Feather Pop</li>
          <li><span aria-hidden>🎉</span> Live experiences</li>
          <li><span aria-hidden>🎁</span> Real prizes</li>
        </ul>
        <p className="prizes-premium-tag">
          Not on sale yet — join the list and we&apos;ll email you the moment
          it launches.
        </p>
        <MailingListForm />
      </section>

      {error ? (
        <p className="prize-claim-error" role="alert">
          {error}
        </p>
      ) : null}

    </div>
  );
}

function FeatherTrophy() {
  return (
    <svg viewBox="0 0 200 220" width={180} height={200} aria-hidden>
      <defs>
        <linearGradient id="ft-feather" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff8b0" />
          <stop offset="0.5" stopColor="#ffd14a" />
          <stop offset="1" stopColor="#f0a900" />
        </linearGradient>
        <linearGradient id="ft-shine" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.65} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
          <stop offset="1" stopColor="#fff" stopOpacity={0.35} />
        </linearGradient>
        <radialGradient id="ft-glow" cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor="#fff" stopOpacity={0.9} />
          <stop offset="0.5" stopColor="#ffd14a" stopOpacity={0.65} />
          <stop offset="1" stopColor="#ffd14a" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* Halo glow */}
      <circle cx="100" cy="110" r="95" fill="url(#ft-glow)" />
      {/* Feather body */}
      <g transform="translate(100 30)">
        <path
          d="M 0 0 C 38 28, 48 64, 36 124 C 32 144, 18 158, 0 168 C -18 158, -32 144, -36 124 C -48 64, -38 28, 0 0 Z"
          fill="url(#ft-feather)"
          stroke="#a86800"
          strokeWidth="2"
        />
        {/* Shine overlay */}
        <path
          d="M 0 0 C 38 28, 48 64, 36 124 C 32 144, 18 158, 0 168 C -18 158, -32 144, -36 124 C -48 64, -38 28, 0 0 Z"
          fill="url(#ft-shine)"
        />
        {/* Spine */}
        <path d="M 0 4 L 0 162" stroke="#a86800" strokeWidth="2" />
        {/* Barbs */}
        {Array.from({ length: 9 }).map((_, i) => {
          const y = 18 + i * 16;
          return (
            <g key={i}>
              <path
                d={`M 0 ${y} Q -16 ${y + 6} -28 ${y + 16}`}
                stroke="#a86800"
                strokeWidth="1.2"
                fill="none"
                opacity={0.6}
              />
              <path
                d={`M 0 ${y} Q 16 ${y + 6} 28 ${y + 16}`}
                stroke="#a86800"
                strokeWidth="1.2"
                fill="none"
                opacity={0.6}
              />
            </g>
          );
        })}
      </g>
      {/* Sparkles */}
      {[
        [40, 50, 4],
        [160, 60, 5],
        [30, 140, 4],
        [170, 140, 5],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path
            d={`M 0 ${-r} L ${r * 0.4} ${-r * 0.4} L ${r} 0 L ${r * 0.4} ${r * 0.4} L 0 ${r} L ${-r * 0.4} ${r * 0.4} L ${-r} 0 L ${-r * 0.4} ${-r * 0.4} Z`}
            fill="#fff"
          />
        </g>
      ))}
    </svg>
  );
}
