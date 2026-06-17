// Child profile + progress shapes. Source of truth is Clerk metadata
// (publicMetadata.children + privateMetadata.childProgress). No localStorage.

import { FeatherType } from "./missions";

export type FeatherCounts = Partial<Record<FeatherType, number>>;

export interface ChildProfile {
  id: string;
  nickname: string;
  avatar?: string;
  createdAt: number;
}

export interface CompletedMissionEntry {
  id: string;
  at: number;
  feather: FeatherType;
  featherPop: number;
}

// Magical Egg system. Each egg progresses with words found (10 per crack,
// 50 to hatch). On hatch a random character is rolled and added to the
// collection book, then a fresh egg starts.
export type EggColor = "purple" | "blue" | "pink" | "gold" | "rainbow" | "silver";
export type HatchedCharacter =
  | "baby-eagle"
  | "baby-peacock"
  | "baby-bunny"
  | "baby-butterfly"
  | "golden-eagle"
  | "rainbow-peacock"
  | "feather-dragon"
  | "sparkle-unicorn";

export interface EggState {
  color: EggColor;
  wordsAtStart: number; // wordsFound when this egg started
}

export interface HatchedEntry {
  character: HatchedCharacter;
  color: EggColor;
  hatchedAt: number;
  wordsRead: number;
}

export interface ChildProgress {
  feathers: FeatherCounts;
  featherPop: number;
  totalMissions: number;
  history: CompletedMissionEntry[]; // newest first, capped at 50
  streakDays: number;
  lastActiveDate: string; // yyyy-mm-dd

  // V2 (Word Hero / egg system) — optional so old saves keep working.
  wordsFound?: number;
  egg?: EggState;
  hatched?: HatchedEntry[];
  freeSpins?: number;
  videosWatched?: number;
  songsUnlocked?: number;
  claimedRewards?: { id: string; at: number; cost: number }[];

  // Monthly Golden Feather tracking. wordsThisMonth resets to 0 when the
  // current month rolls over (server-side). monthKey is the YYYY-MM the
  // counter belongs to; if it doesn't match today's, the counter resets
  // on next write.
  wordsThisMonth?: number;
  monthKey?: string;
  // Golden Feather earned in YYYY-MM. Persisted so the certificate route
  // can render it after the fact.
  goldenFeatherMonths?: string[];

  // Daily +5 video/music bonus gates — keyed by 'YYYY-MM-DD'. The presence
  // of today's key in either set means the bonus was claimed today.
  videoBonusDates?: string[];
  musicBonusDates?: string[];
}

export const defaultChildProgress: ChildProgress = {
  feathers: {},
  featherPop: 0,
  totalMissions: 0,
  history: [],
  streakDays: 0,
  lastActiveDate: "",
  wordsFound: 0,
  hatched: [],
  freeSpins: 0,
};

export function totalFeathers(p: ChildProgress): number {
  return Object.values(p.feathers).reduce((s, n) => s + (n ?? 0), 0);
}

export function recentMissionIds(p: ChildProgress, n = 6): string[] {
  return p.history.slice(0, n).map((e) => e.id);
}
