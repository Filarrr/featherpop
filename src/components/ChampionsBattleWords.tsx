"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useActiveChild } from "@/lib/use-active-child";
import { CountUp } from "./CountUp";

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}`;
}

/**
 * Champions Battle Words — a glowing circle showing how many words the child
 * has found THIS MONTH. It's a bragging badge for subscribers: kids compare
 * counts with their friends. Free users see a locked teaser that upsells
 * membership.
 */
export function ChampionsBattleWords({ member }: { member: boolean }) {
  const { progress, activeChildId } = useActiveChild();
  const inSameMonth = progress.monthKey === currentMonthKey();
  const monthlyWords = inSameMonth ? progress.wordsThisMonth ?? 0 : 0;

  if (!activeChildId) return null;

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
          <b>{monthlyWords.toLocaleString()}</b> words this month — can you get
          more words than your friends?
        </p>
      </span>
    </div>
  );
}
