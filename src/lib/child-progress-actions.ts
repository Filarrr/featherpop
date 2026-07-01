"use server";

// Child progress lives in Clerk privateMetadata.childProgress keyed by child
// id. All reads + writes go through these server actions.

import { revalidatePath } from "next/cache";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import {
  CRACK_LABELS,
  CRACK_MESSAGES,
  CRACK_THRESHOLDS,
  ChildProgress,
  ClaimVariantType,
  CompletedMissionEntry,
  EggColor,
  EggState,
  HatchedCharacter,
  HatchedEntry,
  defaultChildProgress,
} from "@/lib/child-profile";
import { Mission, getMission } from "@/lib/missions";
import { getActiveChildId } from "@/lib/active-child-server";
import {
  hashSeed,
  rngFromSeed,
  rollCard,
  rollColoring,
  rollMystery,
  rollPuzzle,
} from "@/lib/prize-library";

type ProgressMap = Record<string, ChildProgress>;

function readMap(meta: unknown): ProgressMap {
  if (!meta || typeof meta !== "object") return {};
  const v = (meta as Record<string, unknown>).childProgress;
  if (!v || typeof v !== "object") return {};
  return v as ProgressMap;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
}
function yesterdayISO(today: string): string {
  const [y, m, d] = today.split("-").map((n) => Number(n));
  const dt = new Date(y, m - 1, d - 1);
  return `${dt.getFullYear()}-${`${dt.getMonth() + 1}`.padStart(2, "0")}-${`${dt.getDate()}`.padStart(2, "0")}`;
}

async function writeMap(map: ProgressMap): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  await client.users.updateUserMetadata(userId, {
    privateMetadata: { ...user.privateMetadata, childProgress: map },
  });
}

export async function getChildProgressAction(
  childId: string,
): Promise<ChildProgress> {
  const user = await currentUser();
  if (!user) return defaultChildProgress;
  const map = readMap(user.privateMetadata);
  return map[childId] ?? defaultChildProgress;
}

/** Fetch progress for the currently-active child (cookie). */
export async function getActiveChildProgress(): Promise<ChildProgress | null> {
  const id = await getActiveChildId();
  if (!id) return null;
  return getChildProgressAction(id);
}

export async function applyMissionRewardAction(
  childId: string,
  missionId: string,
): Promise<ChildProgress> {
  const mission: Mission | undefined = getMission(missionId);
  if (!mission) throw new Error(`Unknown mission: ${missionId}`);

  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  const map = readMap(user.privateMetadata);
  const prev = map[childId] ?? defaultChildProgress;

  const feathers = { ...prev.feathers };
  feathers[mission.feather] = (feathers[mission.feather] ?? 0) + 1;

  const today = todayISO();
  let streakDays = prev.streakDays;
  if (prev.lastActiveDate === today) {
    // already counted today
  } else if (prev.lastActiveDate === yesterdayISO(today)) {
    streakDays = prev.streakDays + 1;
  } else {
    streakDays = 1;
  }

  const entry: CompletedMissionEntry = {
    id: mission.id,
    at: Date.now(),
    feather: mission.feather,
    featherPop: mission.featherPop,
  };
  const history = [entry, ...prev.history].slice(0, 50);

  const next: ChildProgress = {
    feathers,
    featherPop: prev.featherPop + mission.featherPop,
    totalMissions: prev.totalMissions + 1,
    history,
    streakDays,
    lastActiveDate: today,
  };

  await writeMap({ ...map, [childId]: next });
  revalidatePath("/", "layout");
  return next;
}

/**
 * Bonus-FeatherPop award (Letter Pop / Wordshake). Increments featherPop on
 * the active child's progress, no feather count change. Returns updated
 * progress, or null if no active child.
 */
export async function awardFeatherPopAction(
  amount: number,
): Promise<ChildProgress | null> {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const childId = await getActiveChildId();
  if (!childId) return null;

  const user = await currentUser();
  if (!user) return null;
  const map = readMap(user.privateMetadata);
  const prev = map[childId] ?? defaultChildProgress;

  const next: ChildProgress = {
    ...prev,
    featherPop: prev.featherPop + Math.floor(amount),
  };
  await writeMap({ ...map, [childId]: next });
  revalidatePath("/", "layout");
  return next;
}

/**
 * Record a finished Letter Pop round's score for the active child and keep
 * the per-child high score. Returns the (possibly new) best plus whether this
 * round beat it, so the game can show a "NEW HIGH SCORE!" banner.
 */
export async function recordLetterPopScoreAction(
  score: number,
): Promise<{ best: number; isNewBest: boolean } | null> {
  if (!Number.isFinite(score) || score < 0) return null;
  const childId = await getActiveChildId();
  if (!childId) return null;
  const user = await currentUser();
  if (!user) return null;

  const map = readMap(user.privateMetadata);
  const prev = map[childId] ?? defaultChildProgress;
  const s = Math.floor(score);
  const prevBest = prev.letterPopBest ?? 0;
  const isNewBest = s > prevBest;
  const next: ChildProgress = {
    ...prev,
    letterPopBest: isNewBest ? s : prevBest,
    letterPopRounds: (prev.letterPopRounds ?? 0) + 1,
  };
  await writeMap({ ...map, [childId]: next });
  revalidatePath("/", "layout");
  return { best: next.letterPopBest ?? s, isNewBest };
}

/**
 * Dev / testing seed — drops a chunk of FeatherPop straight onto the
 * active child without simulating gameplay. Capped at 10,000 per call
 * so a stuck-key on the admin button can't runaway the wallet.
 *
 * Returns the updated total so the admin UI can confirm the bump.
 */
export async function seedFeathersAction(
  amount: number,
): Promise<{ ok: true; featherPop: number } | { ok: false; reason: string }> {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, reason: "Invalid amount." };
  }
  const capped = Math.min(10000, Math.floor(amount));
  const childId = await getActiveChildId();
  if (!childId) return { ok: false, reason: "No active child." };
  const user = await currentUser();
  if (!user) return { ok: false, reason: "Not signed in." };

  const map = readMap(user.privateMetadata);
  const prev = map[childId] ?? defaultChildProgress;
  const next: ChildProgress = {
    ...prev,
    featherPop: prev.featherPop + capped,
  };
  await writeMap({ ...map, [childId]: next });
  revalidatePath("/", "layout");
  return { ok: true, featherPop: next.featherPop };
}

// ============================================================
// Word-found + Egg system
// ============================================================

const EGG_COLORS: EggColor[] = ["purple", "blue", "pink", "gold", "rainbow", "silver"];
// Roll: 14% golden-eagle (the ultra-rare per the spec), 6% sparkle-unicorn,
// 10% feather-dragon, 10% rainbow-peacock, balance split across commons.
const HATCH_WEIGHTS: Array<[HatchedCharacter, number]> = [
  ["baby-eagle", 22],
  ["baby-peacock", 18],
  ["baby-bunny", 18],
  ["baby-butterfly", 18],
  ["rainbow-peacock", 8],
  ["feather-dragon", 8],
  ["sparkle-unicorn", 5],
  ["golden-eagle", 3], // ULTRA-rare. Per client: kids keep coming back for this.
];

/**
 * Per the client spec: the first egg is Purple, the second is Gold, the
 * third is Rainbow, then random afterwards. The sequence guarantees a
 * predictable on-ramp for new kids (the rare-feeling colors hit early)
 * before opening up to the full set.
 */
function pickEggColorForSequence(eggIndex: number): EggColor {
  if (eggIndex === 0) return "purple";
  if (eggIndex === 1) return "gold";
  if (eggIndex === 2) return "rainbow";
  return EGG_COLORS[Math.floor(Math.random() * EGG_COLORS.length)];
}

function pickHatchedCharacter(): HatchedCharacter {
  const total = HATCH_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [c, w] of HATCH_WEIGHTS) {
    if (r < w) return c;
    r -= w;
  }
  return "baby-eagle";
}

const WORDS_PER_HATCH = 50;
const GOLDEN_FEATHER_GOAL = 1000;
const GOLDEN_FEATHER_BONUS = 500; // +500 feathers when achieved

function monthKey(now: Date = new Date()): string {
  return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, "0")}`;
}
function dayKey(now: Date = new Date()): string {
  return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, "0")}-${`${now.getDate()}`.padStart(2, "0")}`;
}

export interface WordRecordResult {
  progress: ChildProgress;
  hatched: HatchedEntry | null; // non-null when this submission triggered a hatch
  goldenFeatherJustEarned: boolean; // true if this record crossed 1000 this month
  // Highest crack milestone CROSSED on this call (0..4). The 5th index
  // (50 words = hatch) is also represented by `hatched` being non-null.
  // When crackJustCrossed is null, the call advanced the egg but didn't
  // hit a new milestone — the cracking overlay should stay quiet.
  crackJustCrossed: {
    level: number; // 0..4 (4 = hatch)
    label: string;
    message: string;
    color: EggColor;
    wordsInEgg: number; // (nextWords - egg.wordsAtStart)
  } | null;
}

/**
 * Record N words found by the active child. Awards N FeatherPop (the
 * client spec: 1 word = 1 feather), increments wordsFound, advances the
 * egg, and if the egg crosses the hatch threshold, rolls a character and
 * spawns a fresh random-color egg.
 */
export async function recordWordsFoundAction(count: number): Promise<WordRecordResult | null> {
  if (!Number.isFinite(count) || count <= 0) return null;
  const childId = await getActiveChildId();
  if (!childId) return null;

  const user = await currentUser();
  if (!user) return null;
  const map = readMap(user.privateMetadata);
  const prev = map[childId] ?? defaultChildProgress;

  const prevWords = prev.wordsFound ?? 0;
  const nextWords = prevWords + Math.floor(count);

  // Ensure there's a current egg in flight. eggIndex = how many eggs
  // have been started so far; drives the purple → gold → rainbow → random
  // sequence at the top of the file.
  const eggsHatchedSoFar = (prev.hatched ?? []).length;
  let egg: EggState = prev.egg ?? {
    color: pickEggColorForSequence(eggsHatchedSoFar),
    wordsAtStart: prevWords,
    cracksShown: 0,
  };

  let hatched: HatchedEntry | null = null;
  let nextHatched = (prev.hatched ?? []).slice();
  let freeSpins = prev.freeSpins ?? 0;
  let crackJustCrossed: WordRecordResult["crackJustCrossed"] = null;

  // Compute crack level the egg is AT after this call. 0..4 — 4 means
  // the 50-word hatch threshold was crossed.
  const wordsInEgg = nextWords - egg.wordsAtStart;
  const cracksShown = egg.cracksShown ?? 0;
  let newCrackLevel = cracksShown;
  for (let i = 0; i < CRACK_THRESHOLDS.length; i++) {
    if (wordsInEgg >= CRACK_THRESHOLDS[i]) newCrackLevel = i + 1;
  }

  // Did we cross a new milestone? Surface the highest one we crossed
  // so the overlay can animate it once.
  if (newCrackLevel > cracksShown) {
    const idx = newCrackLevel - 1; // 0..4
    crackJustCrossed = {
      level: idx,
      label: CRACK_LABELS[idx],
      message: CRACK_MESSAGES[idx],
      color: egg.color,
      wordsInEgg: Math.min(wordsInEgg, WORDS_PER_HATCH),
    };
  }

  // Hatch if we hit 50 words. The hatch reveal takes precedence over
  // the crack overlay — the client surfaces it via the existing
  // EggHatchReveal path while the crack overlay is suppressed when
  // hatched is non-null.
  if (wordsInEgg >= WORDS_PER_HATCH) {
    const character = pickHatchedCharacter();
    hatched = {
      character,
      color: egg.color,
      hatchedAt: Date.now(),
      wordsRead: nextWords,
    };
    nextHatched = [hatched, ...nextHatched].slice(0, 100);
    freeSpins += 1; // per spec: every 50 words = +1 free spin
    egg = {
      color: pickEggColorForSequence(eggsHatchedSoFar + 1),
      wordsAtStart: nextWords,
      cracksShown: 0,
    };
  } else {
    egg = { ...egg, cracksShown: newCrackLevel };
  }

  // Monthly Golden Feather tracker — reset to count on month rollover,
  // otherwise add to existing.
  const mk = monthKey();
  const sameMonth = prev.monthKey === mk;
  const prevMonthly = sameMonth ? prev.wordsThisMonth ?? 0 : 0;
  const wordsThisMonth = prevMonthly + Math.floor(count);
  const alreadyEarnedThisMonth = (prev.goldenFeatherMonths ?? []).includes(mk);
  const goldenFeatherJustEarned =
    wordsThisMonth >= GOLDEN_FEATHER_GOAL && !alreadyEarnedThisMonth;

  const next: ChildProgress = {
    ...prev,
    featherPop:
      prev.featherPop +
      Math.floor(count) + // 1 word = 1 feather
      (goldenFeatherJustEarned ? GOLDEN_FEATHER_BONUS : 0),
    wordsFound: nextWords,
    wordsThisMonth,
    monthKey: mk,
    goldenFeatherMonths: goldenFeatherJustEarned
      ? [mk, ...(prev.goldenFeatherMonths ?? [])]
      : prev.goldenFeatherMonths,
    egg,
    hatched: nextHatched,
    freeSpins,
  };

  await writeMap({ ...map, [childId]: next });
  revalidatePath("/", "layout");
  return { progress: next, hatched, goldenFeatherJustEarned, crackJustCrossed };
}

/**
 * Atomically deduct featherPop and record a claimed reward. Returns
 * { ok: false, reason } if the child has insufficient funds or no
 * active session.
 */
export async function claimRewardAction(
  rewardId: string,
  cost: number,
): Promise<
  | { ok: true; progress: ChildProgress; claimAt: number }
  | { ok: false; reason: string }
> {
  if (!Number.isFinite(cost) || cost <= 0) {
    return { ok: false, reason: "Invalid cost." };
  }
  const childId = await getActiveChildId();
  if (!childId) return { ok: false, reason: "No active child." };

  const user = await currentUser();
  if (!user) return { ok: false, reason: "Not signed in." };

  // Rewards are a membership benefit — free families can browse but not claim.
  const membership = (user.publicMetadata?.membership ?? {}) as {
    status?: string;
  };
  const isMember =
    membership.status === "active" || membership.status === "trialing";
  if (!isMember) {
    return { ok: false, reason: "Subscribe to unlock rewards." };
  }

  const map = readMap(user.privateMetadata);
  const prev = map[childId] ?? defaultChildProgress;

  if (prev.featherPop < cost) {
    return {
      ok: false,
      reason: `Need ${cost - prev.featherPop} more FeatherPop.`,
    };
  }

  // Roll the actual underlying prize and persist its variant id, so
  // the /prize/[at] viewer can render exactly what the kid won.
  const at = Date.now();
  const seed = hashSeed(`${childId}-${rewardId}-${at}`);
  const rand = rngFromSeed(seed);

  let variantType: ClaimVariantType | undefined;
  let variantId: string | undefined;
  let mysteryPayload:
    | { kind: ClaimVariantType; variantId: string; bonusFeathers?: number; bonusSpins?: number }
    | undefined;

  let ownedCards = { ...(prev.ownedCards ?? {}) };
  let ownedColoring = [...(prev.ownedColoring ?? [])];
  let ownedPuzzles = [...(prev.ownedPuzzles ?? [])];
  let bonusFeathersFromMystery = 0;
  let bonusSpinsFromMystery = 0;

  if (rewardId === "character") {
    const card = rollCard(rand);
    variantType = "card";
    variantId = card.id;
    ownedCards[card.id] = (ownedCards[card.id] ?? 0) + 1;
  } else if (rewardId === "coloring") {
    const page = rollColoring(prev.ownedColoring, rand);
    variantType = "coloring";
    variantId = page.id;
    if (!ownedColoring.includes(page.id)) ownedColoring.push(page.id);
  } else if (rewardId === "puzzle") {
    const puzzle = rollPuzzle(prev.ownedPuzzles, rand);
    variantType = "puzzle";
    variantId = puzzle.id;
    if (!ownedPuzzles.includes(puzzle.id)) ownedPuzzles.push(puzzle.id);
  } else if (rewardId === "mystery") {
    const { outcome, resolvedVariantId } = rollMystery(prev.ownedColoring, prev.ownedPuzzles, rand);
    variantType = outcome.kind;
    variantId = resolvedVariantId;
    mysteryPayload = {
      kind: outcome.kind,
      variantId: resolvedVariantId,
      bonusFeathers: outcome.bonusFeathers,
      bonusSpins: outcome.bonusSpins,
    };
    if (outcome.kind === "card") {
      ownedCards[resolvedVariantId] = (ownedCards[resolvedVariantId] ?? 0) + 1;
    } else if (outcome.kind === "coloring") {
      if (!ownedColoring.includes(resolvedVariantId)) ownedColoring.push(resolvedVariantId);
    } else if (outcome.kind === "puzzle") {
      if (!ownedPuzzles.includes(resolvedVariantId)) ownedPuzzles.push(resolvedVariantId);
    } else if (outcome.kind === "feathers" && outcome.bonusFeathers) {
      bonusFeathersFromMystery = outcome.bonusFeathers;
    } else if (outcome.kind === "spin" && outcome.bonusSpins) {
      bonusSpinsFromMystery = outcome.bonusSpins;
    }
    // 'egg' is recorded but the egg-progression system handles the actual
    // hatch state elsewhere — store the claim entry and let the kid see
    // it on the prize page.
  }

  const next: ChildProgress = {
    ...prev,
    featherPop: prev.featherPop - cost + bonusFeathersFromMystery,
    freeSpins: (prev.freeSpins ?? 0) + bonusSpinsFromMystery,
    ownedCards,
    ownedColoring,
    ownedPuzzles,
    claimedRewards: [
      { id: rewardId, at, cost, variantType, variantId, mysteryPayload },
      ...(prev.claimedRewards ?? []),
    ].slice(0, 100),
  };

  await writeMap({ ...map, [childId]: next });
  revalidatePath("/", "layout");
  return { ok: true, progress: next, claimAt: at };
}

/* -------------------- Monthly Golden Feather + daily bonuses -------------------- */
/**
 * Increment the active child's monthly word counter. Resets to 1 on month
 * rollover. If this push crosses the 1000 threshold AND we haven't already
 * awarded the badge for this month, award +500 feathers + record the month
 * in goldenFeatherMonths.
 *
 * Returns whether the Golden Feather was earned RIGHT NOW so the UI can
 * show the celebration.
 */
export async function tickMonthlyWordsAction(): Promise<{
  wordsThisMonth: number;
  monthKey: string;
  goldenFeatherJustEarned: boolean;
} | null> {
  const childId = await getActiveChildId();
  if (!childId) return null;
  const user = await currentUser();
  if (!user) return null;

  const map = readMap(user.privateMetadata);
  const prev = map[childId] ?? defaultChildProgress;
  const mk = monthKey();

  const inSameMonth = prev.monthKey === mk;
  const wordsThisMonth = (inSameMonth ? prev.wordsThisMonth ?? 0 : 0) + 1;
  const alreadyEarned = (prev.goldenFeatherMonths ?? []).includes(mk);
  const goldenFeatherJustEarned =
    wordsThisMonth >= GOLDEN_FEATHER_GOAL && !alreadyEarned;

  const next: ChildProgress = {
    ...prev,
    wordsThisMonth,
    monthKey: mk,
    goldenFeatherMonths: goldenFeatherJustEarned
      ? [mk, ...(prev.goldenFeatherMonths ?? [])]
      : prev.goldenFeatherMonths,
    featherPop: prev.featherPop + (goldenFeatherJustEarned ? GOLDEN_FEATHER_BONUS : 0),
  };
  await writeMap({ ...map, [childId]: next });
  revalidatePath("/progress", "page");
  if (goldenFeatherJustEarned) revalidatePath("/", "layout");
  return { wordsThisMonth, monthKey: mk, goldenFeatherJustEarned };
}

/**
 * Claim the once-per-day +5 feather bonus for a video station. Idempotent
 * — calling again the same day no-ops. Returns whether the bonus was
 * actually awarded.
 */
export async function claimVideoBonusAction(): Promise<{
  awarded: boolean;
  reason?: string;
  featherPop: number;
}> {
  const childId = await getActiveChildId();
  if (!childId) return { awarded: false, reason: "No active child.", featherPop: 0 };
  const user = await currentUser();
  if (!user) return { awarded: false, reason: "Not signed in.", featherPop: 0 };

  const map = readMap(user.privateMetadata);
  const prev = map[childId] ?? defaultChildProgress;
  const dk = dayKey();
  const claimed = (prev.videoBonusDates ?? []).includes(dk);
  if (claimed) {
    return {
      awarded: false,
      reason: "Already claimed today",
      featherPop: prev.featherPop,
    };
  }
  const next: ChildProgress = {
    ...prev,
    featherPop: prev.featherPop + 5,
    videosWatched: (prev.videosWatched ?? 0) + 1,
    videoBonusDates: [dk, ...(prev.videoBonusDates ?? [])].slice(0, 60),
  };
  await writeMap({ ...map, [childId]: next });
  revalidatePath("/", "layout");
  return { awarded: true, featherPop: next.featherPop };
}

/** Same shape as claimVideoBonusAction but for music stations. */
export async function claimMusicBonusAction(): Promise<{
  awarded: boolean;
  reason?: string;
  featherPop: number;
}> {
  const childId = await getActiveChildId();
  if (!childId) return { awarded: false, reason: "No active child.", featherPop: 0 };
  const user = await currentUser();
  if (!user) return { awarded: false, reason: "Not signed in.", featherPop: 0 };

  const map = readMap(user.privateMetadata);
  const prev = map[childId] ?? defaultChildProgress;
  const dk = dayKey();
  const claimed = (prev.musicBonusDates ?? []).includes(dk);
  if (claimed) {
    return {
      awarded: false,
      reason: "Already claimed today",
      featherPop: prev.featherPop,
    };
  }
  const next: ChildProgress = {
    ...prev,
    featherPop: prev.featherPop + 5,
    songsUnlocked: (prev.songsUnlocked ?? 0) + 1,
    musicBonusDates: [dk, ...(prev.musicBonusDates ?? [])].slice(0, 60),
  };
  await writeMap({ ...map, [childId]: next });
  revalidatePath("/", "layout");
  return { awarded: true, featherPop: next.featherPop };
}

/**
 * Used by the certificate route: which months has this child earned a
 * Golden Feather in? Returns YYYY-MM strings, newest first.
 */
export async function getGoldenFeatherMonthsAction(): Promise<string[]> {
  const childId = await getActiveChildId();
  if (!childId) return [];
  const user = await currentUser();
  if (!user) return [];
  const map = readMap(user.privateMetadata);
  return map[childId]?.goldenFeatherMonths ?? [];
}

/* -------------------- Spin wheel -------------------- */

export type SpinPrize =
  | "feathers-5"
  | "feathers-10"
  | "feathers-20"
  | "coloring-page"
  | "puzzle"
  | "character-card"
  | "mystery";

interface SpinPrizeMeta {
  id: SpinPrize;
  label: string;
  emoji: string;
  weight: number; // higher = more common
}

const SPIN_PRIZES: SpinPrizeMeta[] = [
  { id: "feathers-5",      label: "+5 FeatherPop",       emoji: "🪶", weight: 30 },
  { id: "feathers-10",     label: "+10 FeatherPop",      emoji: "✨", weight: 20 },
  { id: "feathers-20",     label: "+20 FeatherPop",      emoji: "💎", weight: 8  },
  { id: "coloring-page",   label: "Coloring page",       emoji: "🎨", weight: 15 },
  { id: "puzzle",          label: "Puzzle",              emoji: "🧩", weight: 12 },
  { id: "character-card",  label: "Character card",      emoji: "🃏", weight: 10 },
  { id: "mystery",         label: "Mystery reward",      emoji: "🎁", weight: 5  },
];

/** Publicly-readable list of prizes the wheel can land on. */
export async function listSpinPrizesAction(): Promise<
  Array<{ id: SpinPrize; label: string; emoji: string }>
> {
  return SPIN_PRIZES.map(({ id, label, emoji }) => ({ id, label, emoji }));
}

/**
 * Consume one free spin and award a random prize. Returns the prize
 * landed on, plus the updated FeatherPop balance (for the immediate
 * 'feathers-N' rewards) and the new spin balance.
 */
export async function spinWheelAction(): Promise<
  | {
      ok: true;
      prize: { id: SpinPrize; label: string; emoji: string };
      featherPop: number;
      freeSpinsRemaining: number;
    }
  | { ok: false; reason: string }
> {
  const childId = await getActiveChildId();
  if (!childId) return { ok: false, reason: "No active child." };
  const user = await currentUser();
  if (!user) return { ok: false, reason: "Not signed in." };

  const map = readMap(user.privateMetadata);
  const prev = map[childId] ?? defaultChildProgress;
  const freeSpins = prev.freeSpins ?? 0;
  if (freeSpins <= 0) {
    return {
      ok: false,
      reason: "No spins left — hatch an egg to earn one.",
    };
  }

  // Weighted random pick.
  const totalWeight = SPIN_PRIZES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * totalWeight;
  let landed = SPIN_PRIZES[0];
  for (const p of SPIN_PRIZES) {
    r -= p.weight;
    if (r <= 0) {
      landed = p;
      break;
    }
  }

  // Resolve the prize's effect.
  let featherDelta = 0;
  if (landed.id === "feathers-5") featherDelta = 5;
  else if (landed.id === "feathers-10") featherDelta = 10;
  else if (landed.id === "feathers-20") featherDelta = 20;
  // Non-feather prizes get queued as a claimedRewards entry so they
  // show in the wallet history (parent fulfils the physical/print
  // prize later).
  const claimedRewards =
    featherDelta === 0
      ? [
          {
            id: `spin-${landed.id}-${Date.now()}`,
            at: Date.now(),
            cost: 0,
          },
          ...(prev.claimedRewards ?? []),
        ].slice(0, 50)
      : prev.claimedRewards;

  const next: ChildProgress = {
    ...prev,
    freeSpins: freeSpins - 1,
    featherPop: prev.featherPop + featherDelta,
    claimedRewards,
  };
  await writeMap({ ...map, [childId]: next });
  revalidatePath("/", "layout");

  return {
    ok: true,
    prize: { id: landed.id, label: landed.label, emoji: landed.emoji },
    featherPop: next.featherPop,
    freeSpinsRemaining: next.freeSpins ?? 0,
  };
}

export async function deleteChildProgressAction(childId: string): Promise<void> {
  const user = await currentUser();
  if (!user) return;
  const map = readMap(user.privateMetadata);
  if (!(childId in map)) return;
  const { [childId]: _drop, ...rest } = map;
  void _drop;
  await writeMap(rest);
  revalidatePath("/", "layout");
}
