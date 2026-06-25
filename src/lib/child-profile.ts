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
  // Highest crack milestone already celebrated (0..4). Used so the
  // cracking overlay only fires when the kid crosses a NEW threshold,
  // not on every word past it.
  cracksShown?: number;
}

/** The 5 crack milestones (in words past wordsAtStart). 50 = hatch. */
export const CRACK_THRESHOLDS = [10, 20, 30, 40, 50] as const;
/** Sequence-of-events labels shown at each milestone. */
export const CRACK_LABELS = [
  "Small Crack",
  "Medium Crack",
  "Large Crack",
  "Almost Open!",
  "Hatching!",
] as const;
/** Encouragement copy at each crack — from Ms. Feather Pop herself. */
export const CRACK_MESSAGES = [
  "Great job, Feather Friend! Your egg is beginning to crack!",
  "Wonderful! The crack is growing bigger!",
  "Keep going! Your egg is getting closer!",
  "Almost there! One more push and it will hatch!",
  "It's hatching! Look who's coming out!",
] as const;

export interface HatchedEntry {
  character: HatchedCharacter;
  color: EggColor;
  hatchedAt: number;
  wordsRead: number;
}

/** What kind of underlying asset a reward claim resolved to. */
export type ClaimVariantType =
  | "card"      // collectible character card
  | "coloring"  // printable coloring page
  | "puzzle"    // printable / interactive puzzle
  | "feathers"  // bonus feather drop (mystery box)
  | "spin"      // bonus free spin (mystery box)
  | "egg";      // golden egg (mystery box — rare)

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
  // Claimed reward log. variantId + variantType are populated by the new
  // prize roll (card, coloring page, puzzle, mystery payload). Older
  // claims pre-dating the roll have only id/at/cost — handled gracefully
  // by /prize/[at] (falls back to a generic 'thanks for claiming' page).
  claimedRewards?: {
    id: string;
    at: number;
    cost: number;
    variantId?: string;
    variantType?: ClaimVariantType;
    // For mystery: what the box actually contained (card id, coloring id, etc.)
    mysteryPayload?: { kind: ClaimVariantType; variantId: string; bonusFeathers?: number; bonusSpins?: number };
  }[];

  // Character-card deck — cardId → number of copies owned.
  ownedCards?: Record<string, number>;
  // Coloring page IDs the kid has unlocked (printable).
  ownedColoring?: string[];
  // Puzzle IDs the kid has unlocked (printable / interactive).
  ownedPuzzles?: string[];

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
