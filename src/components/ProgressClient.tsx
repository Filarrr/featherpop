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
import { Medal } from "@/components/progress/Medal";

type MedalTier = "explorer" | "reader" | "finder" | "champion" | "golden";

interface BadgeMeta {
  threshold: number;
  name: string;
  tier: MedalTier;
}

const BADGES: BadgeMeta[] = [
  { threshold: 100,  name: "Word Explorer",  tier: "explorer" },
  { threshold: 250,  name: "Rising Reader",  tier: "reader" },
  { threshold: 500,  name: "Super Finder",   tier: "finder" },
  { threshold: 750,  name: "Word Champion",  tier: "champion" },
  { threshold: 1000, name: "Golden Feather", tier: "golden" },
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

  const mk = currentMonthKey();
  const inSameMonth = progress.monthKey === mk;
  const monthlyWords = inSameMonth ? progress.wordsThisMonth ?? 0 : 0;
  const earnedThisMonth = (progress.goldenFeatherMonths ?? []).includes(mk);

  const goldenPct = Math.min(100, Math.round((monthlyWords / GOLDEN_FEATHER_GOAL) * 100));
  const wordsToGo = Math.max(0, GOLDEN_FEATHER_GOAL - monthlyWords);

  return (
    <div className="progress-page-v2">
      <header className="progress-header-v2">
        <Link href="/" aria-label="Back" className="prizes-back-v2">
          <span aria-hidden>←</span>
        </Link>
        <div className="progress-header-mid-v2">
          <span className="prizes-eyebrow">
            <Sparkles aria-hidden className="h-4 w-4" />
            My Progress
          </span>
          <h1 className="progress-title-v2">
            {active ? `Keep flying, ${active.nickname}!` : "Keep flying!"}
          </h1>
          <p className="progress-subtitle-v2">
            Learn the <strong>Fly Way</strong> one feather at a time.
          </p>
        </div>
        <div className="progress-header-avatar-v2" aria-hidden>
          <MsFeatherPopAvatar pose="cheer" size={108} />
        </div>
      </header>

      {/* Golden Feather hero stage */}
      <section className="progress-golden-v2">
        <div className="progress-golden-glow" aria-hidden />
        <div className="progress-golden-stage" aria-hidden>
          <GoldenFeatherIcon size={140} />
        </div>
        <div className="progress-golden-body-v2">
          <span className="progress-golden-eyebrow">
            <Sparkles aria-hidden className="h-3 w-3" />
            Golden Feather Progress
          </span>
          <p className="progress-golden-count-v2">
            <strong>{monthlyWords.toLocaleString()}</strong>
            <small>/ {GOLDEN_FEATHER_GOAL.toLocaleString()}</small>
          </p>
          <p className="progress-golden-label-v2">Words this month</p>
          <div className="progress-golden-bar-v2" role="progressbar" aria-valuemin={0} aria-valuemax={GOLDEN_FEATHER_GOAL} aria-valuenow={monthlyWords}>
            <span style={{ width: `${goldenPct}%` }}>
              <span className="progress-golden-bar-shine" aria-hidden />
            </span>
          </div>
          <p className="progress-golden-msg-v2">
            {earnedThisMonth ? (
              <>
                🎉 You earned the Golden Feather this month!{" "}
                <Link href="/print/golden-feather" className="progress-golden-link">
                  Print certificate →
                </Link>
              </>
            ) : wordsToGo === 0 ? (
              "🎉 You earned the Golden Feather!"
            ) : (
              <>
                <strong>{wordsToGo.toLocaleString()}</strong> words to the{" "}
                <strong className="progress-golden-msg-strong">Golden Feather!</strong>
              </>
            )}
          </p>
        </div>
      </section>

      {/* Stats grid */}
      <section className="progress-stats-v2">
        <StatCard
          icon={<BookOpen aria-hidden className="h-6 w-6" />}
          label="Words Found"
          value={wordsFound}
          tag={wordsFound > 0 ? "Keep it up!" : "Find your first!"}
          tone="purple"
        />
        <StatCard
          icon={<Feather aria-hidden className="h-6 w-6" />}
          label="Feathers"
          value={featherPop}
          tag={featherPop > 100 ? "You're soaring!" : "Keep collecting!"}
          tone="blue"
        />
        <StatCard
          icon={<Egg aria-hidden className="h-6 w-6" />}
          label="Eggs Hatched"
          value={eggsHatched}
          tag={eggsHatched > 0 ? "Amazing!" : "Read 50 words!"}
          tone="green"
        />
        <StatCard
          icon={<Star aria-hidden className="h-6 w-6" />}
          label="Free Spins"
          value={freeSpins}
          tag={freeSpins > 0 ? "Spin & win!" : "Hatch to earn!"}
          tone="pink"
        />
        <StatCard
          icon={<Video aria-hidden className="h-6 w-6" />}
          label="Videos Watched"
          value={videosWatched}
          tag="Keep watching!"
          tone="orange"
        />
        <StatCard
          icon={<Music aria-hidden className="h-6 w-6" />}
          label="Songs Unlocked"
          value={songsUnlocked}
          tag="Sing along!"
          tone="teal"
        />
      </section>

      {/* Badges row — medal-style */}
      <section className="progress-badges-v2">
        <header className="progress-badges-head">
          <span className="progress-badges-eyebrow">
            <Sparkles aria-hidden className="h-4 w-4" />
            Badges Earned
          </span>
          <h2>Your Trophy Wall</h2>
          <p>
            Find more words to unlock the next medal. The Golden Feather is the
            ultimate prize.
          </p>
        </header>
        <div className="progress-badges-row-v2">
          {BADGES.map((b) => {
            const earned = wordsFound >= b.threshold;
            return (
              <article
                key={b.threshold}
                className={`progress-badge-v2 tier-${b.tier} ${
                  earned ? "is-earned" : "is-locked"
                }`}
              >
                <Medal tier={b.tier} earned={earned} />
                <div className="progress-badge-meta">
                  <span className="progress-badge-count-v2">
                    {b.threshold.toLocaleString()} <small>words</small>
                  </span>
                  <span className="progress-badge-name-v2">{b.name}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  tag: string;
  tone: "purple" | "blue" | "green" | "pink" | "orange" | "teal";
}

function StatCard({ icon, label, value, tag, tone }: StatCardProps) {
  return (
    <article className={`progress-stat-card-v2 tone-${tone}`}>
      <div className="progress-stat-icon-v2">
        <span className="progress-stat-icon-halo" aria-hidden />
        {icon}
      </div>
      <span className="progress-stat-value-v2">{value.toLocaleString()}</span>
      <span className="progress-stat-label-v2">{label}</span>
      <span className="progress-stat-tag-v2">{tag}</span>
    </article>
  );
}

function GoldenFeatherIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 200 220" width={size} height={(size * 220) / 200} aria-hidden>
      <defs>
        <linearGradient id="pgf-feather" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff8b0" />
          <stop offset="0.5" stopColor="#ffd14a" />
          <stop offset="1" stopColor="#f0a900" />
        </linearGradient>
        <linearGradient id="pgf-shine" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.7} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
          <stop offset="1" stopColor="#fff" stopOpacity={0.35} />
        </linearGradient>
      </defs>
      <g transform="translate(100 28)">
        <path
          d="M 0 0 C 38 28, 48 64, 36 124 C 32 144, 18 158, 0 168 C -18 158, -32 144, -36 124 C -48 64, -38 28, 0 0 Z"
          fill="url(#pgf-feather)"
          stroke="#a86800"
          strokeWidth="2"
        />
        <path
          d="M 0 0 C 38 28, 48 64, 36 124 C 32 144, 18 158, 0 168 C -18 158, -32 144, -36 124 C -48 64, -38 28, 0 0 Z"
          fill="url(#pgf-shine)"
        />
        <path d="M 0 4 L 0 162" stroke="#a86800" strokeWidth="2" />
        {Array.from({ length: 9 }).map((_, i) => {
          const y = 18 + i * 16;
          return (
            <g key={i}>
              <path
                d={`M 0 ${y} Q -16 ${y + 6} -28 ${y + 16}`}
                stroke="#a86800"
                strokeWidth="1.2"
                fill="none"
                opacity={0.55}
              />
              <path
                d={`M 0 ${y} Q 16 ${y + 6} 28 ${y + 16}`}
                stroke="#a86800"
                strokeWidth="1.2"
                fill="none"
                opacity={0.55}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
