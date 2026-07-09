"use client";

import { useActiveChild } from "@/lib/use-active-child";

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}`;
}

export function ChampionWordsBadge() {
  const { progress } = useActiveChild();
  const monthKey = currentMonthKey();
  const currentMonth = progress.monthKey === monthKey;
  const monthlyWords = currentMonth ? progress.wordsThisMonth ?? 0 : 0;

  return (
    <div className="membership-hero-champion-card">
      <div className="membership-hero-champion-ring">
        <span className="membership-hero-champion-feather">🪶</span>
        <span className="membership-hero-champion-number">
          {monthlyWords.toLocaleString()}
        </span>
      </div>
      <div className="membership-hero-champion-copy">
        <strong>Champions Battle Words</strong>
        <p>Show your friends how many words you got this month.</p>
        <span>
          {currentMonth
            ? "Keep going to beat your friends!"
            : "Start a hunt to begin your monthly count."}
        </span>
      </div>
    </div>
  );
}
