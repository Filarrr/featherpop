"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Crown,
  Gift,
  Lock,
  Printer,
  Sparkles,
  Trophy,
} from "lucide-react";
import { listRewards } from "@/lib/admin-store";
import { Reward } from "@/lib/game-data";
import { useMembership } from "@/lib/use-membership";
import { useActiveChild } from "@/lib/use-active-child";
import { PrizeArt } from "@/components/rewards/PrizeArt";
import { CountUp } from "@/components/CountUp";
import { Confetti } from "@/components/Confetti";
import { childCheer, fanfare, pop, wordReveal } from "@/lib/audio";

type Tier = "bronze" | "silver" | "gold" | "diamond";

function tierFor(featherpop: number, memberOnly?: boolean): Tier {
  if (memberOnly) return "diamond";
  if (featherpop <= 6) return "bronze";
  if (featherpop <= 15) return "silver";
  return "gold";
}
const TIER_META: Record<
  Tier,
  { label: string; color: string; ring: string }
> = {
  bronze: {
    label: "Bronze",
    color: "#c98a52",
    ring: "linear-gradient(135deg, #f0c897, #c98a52, #8a4a1e)",
  },
  silver: {
    label: "Silver",
    color: "#a3acc5",
    ring: "linear-gradient(135deg, #f3f5fb, #b9c3df, #7a87a8)",
  },
  gold: {
    label: "Gold",
    color: "#f0a900",
    ring: "linear-gradient(135deg, #fff8b0, #ffd14a, #c98a00)",
  },
  diamond: {
    label: "Members Only",
    color: "#b13bff",
    ring: "linear-gradient(135deg, #ffd6f0, #b13bff, #6a2dff)",
  },
};

export function RewardsClient() {
  const { progress } = useActiveChild();
  const { isMember } = useMembership();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [unlockedShown, setUnlockedShown] = useState<Set<string>>(new Set());
  const [celebrating, setCelebrating] = useState<Reward | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const prevPopRef = useRef(progress.featherPop);

  useEffect(() => {
    setRewards(listRewards().filter((r) => r.active));
  }, []);

  const featherPop = progress.featherPop;

  // Sort by cost ascending so the "next prize" is always first un-earned.
  const sortedRewards = useMemo(
    () => rewards.slice().sort((a, b) => a.featherpopRequired - b.featherpopRequired),
    [rewards],
  );

  const earned = sortedRewards.filter(
    (r) => featherPop >= r.featherpopRequired && (!r.memberOnly || isMember),
  );
  const upcoming = sortedRewards.filter(
    (r) => featherPop < r.featherpopRequired || (r.memberOnly && !isMember),
  );
  const nextPrize = upcoming[0] ?? null;
  const remaining = nextPrize
    ? Math.max(0, nextPrize.featherpopRequired - featherPop)
    : 0;
  const nextPct = nextPrize
    ? Math.min(100, Math.round((featherPop / nextPrize.featherpopRequired) * 100))
    : 100;

  // Detect a newly-unlocked prize the moment FeatherPop crosses a threshold.
  // Show one celebration overlay, then mark the prize as "shown" so we don't
  // re-celebrate on every page render.
  useEffect(() => {
    const prev = prevPopRef.current;
    if (featherPop > prev) {
      const justUnlocked = sortedRewards.find(
        (r) =>
          prev < r.featherpopRequired &&
          featherPop >= r.featherpopRequired &&
          !r.memberOnly &&
          !unlockedShown.has(r.id),
      );
      if (justUnlocked) {
        setCelebrating(justUnlocked);
        setUnlockedShown((s) => new Set(s).add(justUnlocked.id));
        setConfettiKey((k) => k + 1);
        pop();
        window.setTimeout(() => wordReveal(), 220);
        window.setTimeout(() => fanfare(), 700);
        window.setTimeout(() => childCheer(), 1400);
        window.setTimeout(() => setCelebrating(null), 3600);
      }
    }
    prevPopRef.current = featherPop;
  }, [featherPop, sortedRewards, unlockedShown]);

  return (
    <div className="rewards-shell">
      <Confetti trigger={confettiKey} pieces={70} />

      {/* WALLET — clear, kid-readable balance */}
      <section className="rewards-wallet">
        <div className="rewards-wallet-inner">
          <span className="kicker">
            <Sparkles aria-hidden className="h-4 w-4" />
            FeatherPop wallet
          </span>
          <h2 className="rewards-wallet-balance">
            <CountUp to={featherPop} duration={900} />
            <small>FeatherPop</small>
          </h2>
          <p className="rewards-wallet-tag">
            Earned <strong>{earned.length}</strong> of {sortedRewards.length} prizes so far.
          </p>
          <Link href="/sort" className="btn btn-gold btn-sm">
            <Camera aria-hidden className="h-4 w-4" />
            Earn more
          </Link>
        </div>
      </section>

      {/* NEXT PRIZE HERO — countdown + big art + animated progress ring */}
      {nextPrize ? (
        <section
          className={`rewards-next ${nextPrize.memberOnly ? "is-member-locked" : ""}`}
        >
          <div className="rewards-next-shimmer" aria-hidden />
          <div className="rewards-next-grid">
            <div className="rewards-next-art-wrap">
              <div
                className="rewards-next-art"
                style={{ ["--tier-ring" as string]: TIER_META[tierFor(nextPrize.featherpopRequired, nextPrize.memberOnly)].ring }}
              >
                <PrizeArt id={nextPrize.id} locked size={160} />
              </div>
            </div>
            <div className="rewards-next-body">
              <span className="rewards-tier-pill">
                <TierIcon tier={tierFor(nextPrize.featherpopRequired, nextPrize.memberOnly)} />
                {TIER_META[tierFor(nextPrize.featherpopRequired, nextPrize.memberOnly)].label}
              </span>
              <h3 className="rewards-next-name">{nextPrize.name}</h3>
              <p className="rewards-next-desc">{nextPrize.description}</p>

              <div className="rewards-next-progress">
                <span style={{ width: `${nextPct}%` }} />
              </div>

              {nextPrize.memberOnly && !isMember ? (
                <p className="rewards-next-cta">
                  <strong>Members-only.</strong> Unlock the Diamond tier with a
                  Ms. Feather Pop membership.
                </p>
              ) : (
                <p className="rewards-next-cta">
                  <strong>{remaining}</strong> more FeatherPop and {nextPrize.name} is yours!
                </p>
              )}

              <div className="rewards-next-actions">
                {nextPrize.memberOnly && !isMember ? (
                  <Link href="/membership" className="btn btn-gold btn-lg btn-pulse">
                    <Crown aria-hidden className="h-5 w-5" />
                    Unlock with membership
                  </Link>
                ) : (
                  <Link href="/sort" className="btn btn-gold btn-lg btn-pulse">
                    <ArrowRight aria-hidden className="h-5 w-5" />
                    Earn more FeatherPop
                  </Link>
                )}
                <Link href="/scan" className="btn btn-sky">
                  <Camera aria-hidden className="h-4 w-4" />
                  Park Hunt
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* YOUR COLLECTION — earned prizes shelf */}
      {earned.length > 0 ? (
        <section className="rewards-collection">
          <header className="rewards-collection-head">
            <span className="kicker">
              <Trophy aria-hidden className="h-4 w-4" />
              Your collection
            </span>
            <h3 className="h-display text-2xl">
              {earned.length}{" "}
              {earned.length === 1 ? "prize" : "prizes"} unlocked
            </h3>
          </header>
          <div className="rewards-collection-shelf">
            {earned.map((r, i) => {
              const isNewest = i === earned.length - 1 && earned.length > 0;
              return (
                <article
                  key={r.id}
                  className={`rewards-collection-tile ${isNewest ? "is-newest" : ""}`}
                  style={{
                    ["--tier-ring" as string]: TIER_META[tierFor(r.featherpopRequired, r.memberOnly)].ring,
                  }}
                >
                  {isNewest ? (
                    <span className="rewards-new-ribbon" aria-hidden>
                      NEW!
                    </span>
                  ) : null}
                  <div className="rewards-collection-art">
                    <PrizeArt id={r.id} size={92} />
                  </div>
                  <strong>{r.name}</strong>
                  {r.printable ? (
                    <Link href={`/print/reward/${r.id}`} className="btn btn-ghost btn-sm">
                      <Printer aria-hidden className="h-3.5 w-3.5" />
                      Print
                    </Link>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* UPCOMING — tier-sectioned gallery of locked prizes */}
      {upcoming.length > 0 ? (
        <section className="rewards-upcoming">
          <header className="rewards-upcoming-head">
            <span className="kicker">
              <Gift aria-hidden className="h-4 w-4" />
              What's waiting
            </span>
            <h3 className="h-display text-2xl">Keep going — these are next</h3>
          </header>

          <div className="rewards-grid">
            {upcoming.map((r) => {
              const tier = tierFor(r.featherpopRequired, r.memberOnly);
              const memberGated = r.memberOnly && !isMember;
              const earnedGated = featherPop < r.featherpopRequired;
              const pct = Math.min(1, featherPop / r.featherpopRequired);
              return (
                <article
                  key={r.id}
                  className={`rewards-card ${tier === "diamond" ? "is-diamond" : ""}`}
                  style={{
                    ["--tier-ring" as string]: TIER_META[tier].ring,
                    ["--tier-color" as string]: TIER_META[tier].color,
                  }}
                >
                  <div className="rewards-card-art">
                    <PrizeArt id={r.id} locked size={120} />
                    {memberGated ? (
                      <span className="rewards-card-crown" aria-hidden>
                        <Crown aria-hidden className="h-4 w-4" />
                      </span>
                    ) : null}
                  </div>
                  <div className="rewards-card-body">
                    <span className="rewards-tier-pill">
                      <TierIcon tier={tier} />
                      {TIER_META[tier].label}
                    </span>
                    <h4 className="rewards-card-name">{r.name}</h4>
                    <p className="rewards-card-desc">{r.description}</p>
                    <div className="rewards-card-progress">
                      <span style={{ width: `${Math.round(pct * 100)}%` }} />
                    </div>
                    <p className="rewards-card-req">
                      {memberGated ? (
                        <>
                          <Lock aria-hidden className="h-3.5 w-3.5" />
                          Members only
                        </>
                      ) : earnedGated ? (
                        <>
                          <strong>{r.featherpopRequired - featherPop}</strong> more
                          FeatherPop to unlock
                        </>
                      ) : (
                        "Ready to claim"
                      )}
                    </p>
                    {memberGated ? (
                      <Link href="/membership" className="btn btn-gold btn-sm">
                        Get membership
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* MEMBERSHIP BANNER */}
      {!isMember ? (
        <section className="rewards-member-banner">
          <div className="rewards-member-rays" aria-hidden />
          <Crown aria-hidden className="rewards-member-crown" />
          <div className="rewards-member-body">
            <span className="kicker">
              <Sparkles aria-hidden className="h-4 w-4" />
              Membership
            </span>
            <h3 className="h-display text-2xl text-white">
              Unlock every Diamond prize
            </h3>
            <ul>
              <li>
                <Sparkles aria-hidden className="h-4 w-4" />
                Members-only Diamond tier prizes (badges, frames, certificates)
              </li>
              <li>
                <Printer aria-hidden className="h-4 w-4" />
                Printable certificates for every win
              </li>
              <li>
                <Trophy aria-hidden className="h-4 w-4" />
                Priority pre-orders on physical merch
              </li>
            </ul>
            <Link href="/membership" className="btn btn-gold btn-lg btn-pulse">
              <Crown aria-hidden className="h-5 w-5" />
              Try 3 days free
            </Link>
          </div>
        </section>
      ) : null}

      {/* UNLOCK CELEBRATION OVERLAY */}
      {celebrating ? (
        <div className="rewards-celebrate" aria-live="polite">
          <div className="rewards-celebrate-rays" />
          <div className="rewards-celebrate-card">
            <PrizeArt id={celebrating.id} size={180} />
            <span className="rewards-tier-pill">
              <Sparkles aria-hidden className="h-4 w-4" />
              Prize unlocked!
            </span>
            <h2 className="rewards-celebrate-name">{celebrating.name}</h2>
            <p>{celebrating.description}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TierIcon({ tier }: { tier: Tier }) {
  if (tier === "diamond")
    return <Crown aria-hidden className="h-3.5 w-3.5" />;
  if (tier === "gold")
    return <Trophy aria-hidden className="h-3.5 w-3.5" />;
  return <Sparkles aria-hidden className="h-3.5 w-3.5" />;
}
