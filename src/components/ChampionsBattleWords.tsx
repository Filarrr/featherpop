"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Sparkles, X } from "lucide-react";
import { useActiveChild } from "@/lib/use-active-child";
import { CountUp } from "./CountUp";

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}`;
}

// Matches GOLDEN_FEATHER_GOAL in child-progress-actions.ts (server-only file).
const GOLDEN_FEATHER_GOAL = 1000;

function useMonthlyWords(): { monthlyWords: number; hasChild: boolean } {
  const { progress, activeChildId } = useActiveChild();
  const inSameMonth = progress.monthKey === currentMonthKey();
  return {
    monthlyWords:
      activeChildId && inSameMonth ? progress.wordsThisMonth ?? 0 : 0,
    hasChild: Boolean(activeChildId),
  };
}

/**
 * Champions Battle Words — a glowing circle showing how many words the child
 * has found THIS MONTH. It's a bragging badge for subscribers: kids compare
 * counts with their friends. Free users see a locked teaser that upsells
 * membership.
 */
export function ChampionsBattleWords({ member }: { member: boolean }) {
  const { monthlyWords, hasChild } = useMonthlyWords();

  if (!member) {
    return (
      <Link href="/membership" className="cbw cbw-locked">
        <span className="cbw-circle">
          <Lock aria-hidden className="h-6 w-6" />
        </span>
        <span className="cbw-copy">
          <strong>Champions Battle Words</strong>
          <p>Can you get more words than your friends? Join to start battling!</p>
        </span>
      </Link>
    );
  }

  return (
    <div className="cbw">
      <span className="cbw-circle" aria-hidden>
        <span className="cbw-feather">🪶</span>
        <span className="cbw-count">
          <CountUp to={monthlyWords} duration={800} />
        </span>
        <span className="cbw-unit">words</span>
      </span>
      <span className="cbw-copy">
        <strong>Champions Battle Words</strong>
        <p>
          {hasChild ? (
            <>
              <b>{monthlyWords.toLocaleString()}</b> words this month — can you
              get more words than your friends?
            </>
          ) : (
            <>Pick a child profile to start this month&apos;s word battle!</>
          )}
        </p>
      </span>
    </div>
  );
}

/**
 * Compact header version — a small glowing ring that opens the monthly
 * word-progress pop-up when tapped. Lives next to the feather balance in
 * the Prizes header.
 */
export function ChampionsBattleRing({ member }: { member: boolean }) {
  const [open, setOpen] = useState(false);
  const { monthlyWords, hasChild } = useMonthlyWords();
  const monthName = new Date().toLocaleString("en-US", { month: "long" });
  const pct = Math.min(100, Math.round((monthlyWords / GOLDEN_FEATHER_GOAL) * 100));

  return (
    <>
      <button
        type="button"
        className={`cbw-ring-btn ${member ? "" : "cbw-ring-btn-locked"}`}
        onClick={() => setOpen(true)}
        aria-label={`Champions Battle Words — ${monthlyWords} words in ${monthName}`}
        aria-haspopup="dialog"
      >
        {member ? (
          <>
            <span className="cbw-ring-feather" aria-hidden>🪶</span>
            <span className="cbw-ring-count">{monthlyWords.toLocaleString()}</span>
          </>
        ) : (
          <Lock aria-hidden className="h-5 w-5" />
        )}
      </button>

      {open ? (
        <div
          className="cbw-pop"
          role="dialog"
          aria-modal="true"
          aria-label="Champions Battle Words"
          onClick={() => setOpen(false)}
        >
          <div className="cbw-pop-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="cbw-pop-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X aria-hidden className="h-5 w-5" />
            </button>

            <span className="kicker">
              <Sparkles aria-hidden className="h-4 w-4" />
              Champions Battle Words
            </span>

            <div className="cbw-circle cbw-pop-circle" aria-hidden>
              <span className="cbw-feather">🪶</span>
              <span className="cbw-count">
                <CountUp to={monthlyWords} duration={800} />
              </span>
              <span className="cbw-unit">words</span>
            </div>

            <h2 className="cbw-pop-title">
              {monthlyWords.toLocaleString()} words in {monthName}!
            </h2>

            {member ? (
              hasChild ? (
                <>
                  <p className="cbw-pop-msg">
                    Show your friends — can you get more words than them this
                    month?
                  </p>
                  <div className="cbw-pop-bar" aria-hidden>
                    <span style={{ width: `${pct}%` }} />
                  </div>
                  <p className="cbw-pop-goal">
                    {monthlyWords >= GOLDEN_FEATHER_GOAL ? (
                      <>🏆 Golden Feather earned this month!</>
                    ) : (
                      <>
                        <strong>
                          {(GOLDEN_FEATHER_GOAL - monthlyWords).toLocaleString()}
                        </strong>{" "}
                        more words to the 🏆 Golden Feather!
                      </>
                    )}
                  </p>
                </>
              ) : (
                <p className="cbw-pop-msg">
                  Pick a child profile to start this month&apos;s word battle!
                </p>
              )
            ) : (
              <>
                <p className="cbw-pop-msg">
                  Can you get more words than your friends? Champions Battle
                  Words is a membership adventure.
                </p>
                <Link href="/membership" className="btn btn-gold btn-lg">
                  <Sparkles aria-hidden className="h-5 w-5" />
                  Join the battle
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
