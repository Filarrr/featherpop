"use client";

import Link from "next/link";
import {
  BookOpen,
  Egg,
  Feather,
  Music,
  Sparkles,
  Star,
  Video,
} from "lucide-react";
import { useActiveChild } from "@/lib/use-active-child";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";

interface BadgeMeta {
  threshold: number;
  name: string;
  color: string;
  bg: string;
}

const BADGES: BadgeMeta[] = [
  { threshold: 100,  name: "Word Explorer",  color: "#34e3a4", bg: "rgba(52, 227, 164, 0.15)" },
  { threshold: 250,  name: "Rising Reader",  color: "#4cc4ff", bg: "rgba(76, 196, 255, 0.15)" },
  { threshold: 500,  name: "Super Finder",   color: "#a76bff", bg: "rgba(167, 107, 255, 0.15)" },
  { threshold: 750,  name: "Word Champion",  color: "#ff7ab8", bg: "rgba(255, 122, 184, 0.15)" },
  { threshold: 1000, name: "Golden Feather", color: "#ffd14a", bg: "rgba(255, 209, 74, 0.18)" },
];

const GOLDEN_FEATHER_GOAL = 1000;

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}`;
}

export function ProgressClient() {
  const { progress, active } = useActiveChild();
  const wordsFound = progress.wordsFound ?? 0;
  const featherPop = progress.featherPop;
  const eggsHatched = progress.hatched?.length ?? 0;
  const freeSpins = progress.freeSpins ?? 0;
  const videosWatched = progress.videosWatched ?? 0;
  const songsUnlocked = progress.songsUnlocked ?? 0;

  // The Golden Feather progress bar tracks THIS MONTH (per the client
  // spec: '1000 Words in a Month'). If the stored monthKey doesn't match
  // today's calendar month, we show 0 — the server-side recorder will
  // reset on the next word.
  const mk = currentMonthKey();
  const inSameMonth = progress.monthKey === mk;
  const monthlyWords = inSameMonth ? progress.wordsThisMonth ?? 0 : 0;
  const earnedThisMonth = (progress.goldenFeatherMonths ?? []).includes(mk);

  const goldenPct = Math.min(100, Math.round((monthlyWords / GOLDEN_FEATHER_GOAL) * 100));
  const wordsToGo = Math.max(0, GOLDEN_FEATHER_GOAL - monthlyWords);

  return (
    <div className="progress-page">
      <header className="progress-header">
        <Link href="/" aria-label="Back" className="prizes-back">
          <span aria-hidden>←</span>
        </Link>
        <div className="progress-header-mid">
          <h1 className="progress-title">My Progress</h1>
          <p className="progress-subtitle">
            {active ? `Keep learning the Fly Way, ${active.nickname}!` : "Keep learning the Fly Way!"}
          </p>
        </div>
        <div className="progress-header-avatar" aria-hidden>
          <MsFeatherPopAvatar pose="cheer" size={92} />
        </div>
      </header>

      {/* Golden Feather progress bar — the hero card */}
      <section className="progress-golden">
        <span className="progress-golden-feather" aria-hidden>🪶</span>
        <div className="progress-golden-body">
          <p className="progress-golden-title">~ Golden Feather Progress ~</p>
          <div className="progress-golden-bar" aria-hidden>
            <span style={{ width: `${goldenPct}%` }} />
          </div>
          <p className="progress-golden-count">
            <strong>{monthlyWords}</strong> <small>/ {GOLDEN_FEATHER_GOAL}</small>
          </p>
          <p className="progress-golden-label">Words Found This Month</p>
          <p className="progress-golden-msg">
            {earnedThisMonth ? (
              <>
                🎉 You earned the Golden Feather this month!{" "}
                <Link
                  href="/print/golden-feather"
                  style={{ color: "var(--magenta)", fontWeight: 800 }}
                >
                  Print certificate →
                </Link>
              </>
            ) : wordsToGo === 0 ? (
              "🎉 You earned the Golden Feather!"
            ) : (
              <>
                You're getting closer to earning the{" "}
                <strong>Golden Feather!</strong> Keep going!
              </>
            )}
          </p>
        </div>
        <div className="progress-golden-side">
          <span className="progress-golden-badge" aria-hidden>🪶</span>
          <p>
            {earnedThisMonth
              ? "Earned!"
              : wordsToGo === 0
                ? "Unlocked!"
                : `${wordsToGo} words to go!`}
          </p>
        </div>
      </section>

      {/* Stats grid — 6 cards in a 3×2 grid (per her ref) */}
      <section className="progress-stats">
        <StatCard
          icon={<BookOpen aria-hidden className="h-6 w-6" />}
          label="Words Found"
          value={wordsFound}
          tag={wordsFound > 0 ? "Keep it up!" : "Find your first!"}
          color="#a76bff"
          bg="rgba(167, 107, 255, 0.15)"
        />
        <StatCard
          icon={<Feather aria-hidden className="h-6 w-6" />}
          label="Feathers Earned"
          value={featherPop}
          tag={featherPop > 100 ? "You're soaring!" : "Keep collecting!"}
          color="#4cc4ff"
          bg="rgba(76, 196, 255, 0.15)"
        />
        <StatCard
          icon={<Egg aria-hidden className="h-6 w-6" />}
          label="Eggs Hatched"
          value={eggsHatched}
          tag={eggsHatched > 0 ? "Amazing!" : "Hatch your first!"}
          color="#34e3a4"
          bg="rgba(52, 227, 164, 0.15)"
        />
        <StatCard
          icon={<Star aria-hidden className="h-6 w-6" />}
          label="Spins Earned"
          value={freeSpins}
          tag={freeSpins > 0 ? "Spin and win!" : "Coming soon!"}
          color="#ff7ab8"
          bg="rgba(255, 122, 184, 0.15)"
        />
        <StatCard
          icon={<Video aria-hidden className="h-6 w-6" />}
          label="Videos Watched"
          value={videosWatched}
          tag="Keep watching!"
          color="#ff9a3a"
          bg="rgba(255, 154, 58, 0.15)"
        />
        <StatCard
          icon={<Music aria-hidden className="h-6 w-6" />}
          label="Songs Unlocked"
          value={songsUnlocked}
          tag="You love music!"
          color="#5ee0c8"
          bg="rgba(94, 224, 200, 0.18)"
        />
      </section>

      {/* Badges Earned — 5 tiles in a row */}
      <section className="progress-badges">
        <h2 className="progress-badges-title">
          <span aria-hidden>~</span> BADGES EARNED <span aria-hidden>~</span>
        </h2>
        <div className="progress-badges-row">
          {BADGES.map((b) => {
            const earned = wordsFound >= b.threshold;
            return (
              <article
                key={b.threshold}
                className={`progress-badge ${earned ? "is-earned" : "is-locked"}`}
                style={{
                  ["--badge-color" as string]: b.color,
                  ["--badge-bg" as string]: b.bg,
                }}
              >
                <div className="progress-badge-medal" aria-hidden>
                  <Sparkles aria-hidden className="h-6 w-6" />
                </div>
                <span className="progress-badge-count">{b.threshold}</span>
                <span className="progress-badge-name">{b.name}</span>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tag,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tag: string;
  color: string;
  bg: string;
}) {
  return (
    <article
      className="progress-stat-card"
      style={{
        ["--stat-color" as string]: color,
        ["--stat-bg" as string]: bg,
      }}
    >
      <div className="progress-stat-icon">{icon}</div>
      <span className="progress-stat-label">{label}</span>
      <span className="progress-stat-value">{value}</span>
      <span className="progress-stat-tag">{tag}</span>
    </article>
  );
}
