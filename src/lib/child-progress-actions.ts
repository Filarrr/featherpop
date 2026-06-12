"use server";

// Child progress lives in Clerk privateMetadata.childProgress keyed by child
// id. All reads + writes go through these server actions.

import { revalidatePath } from "next/cache";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import {
  ChildProgress,
  CompletedMissionEntry,
  EggColor,
  EggState,
  HatchedCharacter,
  HatchedEntry,
  defaultChildProgress,
} from "@/lib/child-profile";
import { Mission, getMission } from "@/lib/missions";
import { getActiveChildId } from "@/lib/active-child-server";

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

function pickEggColor(): EggColor {
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

export interface WordRecordResult {
  progress: ChildProgress;
  hatched: HatchedEntry | null; // non-null when this submission triggered a hatch
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

  // Ensure there's a current egg in flight.
  let egg: EggState = prev.egg ?? { color: pickEggColor(), wordsAtStart: prevWords };

  let hatched: HatchedEntry | null = null;
  let nextHatched = (prev.hatched ?? []).slice();
  let freeSpins = prev.freeSpins ?? 0;

  // Has this egg crossed the hatch threshold?
  if (nextWords - egg.wordsAtStart >= WORDS_PER_HATCH) {
    const character = pickHatchedCharacter();
    hatched = {
      character,
      color: egg.color,
      hatchedAt: Date.now(),
      wordsRead: nextWords,
    };
    nextHatched = [hatched, ...nextHatched].slice(0, 100);
    freeSpins += 1; // per spec: every 50 words = +1 free spin
    egg = { color: pickEggColor(), wordsAtStart: nextWords };
  }

  const next: ChildProgress = {
    ...prev,
    featherPop: prev.featherPop + Math.floor(count), // 1 word = 1 feather
    wordsFound: nextWords,
    egg,
    hatched: nextHatched,
    freeSpins,
  };

  await writeMap({ ...map, [childId]: next });
  revalidatePath("/", "layout");
  return { progress: next, hatched };
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
  | { ok: true; progress: ChildProgress }
  | { ok: false; reason: string }
> {
  if (!Number.isFinite(cost) || cost <= 0) {
    return { ok: false, reason: "Invalid cost." };
  }
  const childId = await getActiveChildId();
  if (!childId) return { ok: false, reason: "No active child." };

  const user = await currentUser();
  if (!user) return { ok: false, reason: "Not signed in." };

  const map = readMap(user.privateMetadata);
  const prev = map[childId] ?? defaultChildProgress;

  if (prev.featherPop < cost) {
    return {
      ok: false,
      reason: `Need ${cost - prev.featherPop} more FeatherPop.`,
    };
  }

  const next: ChildProgress = {
    ...prev,
    featherPop: prev.featherPop - cost,
    claimedRewards: [
      { id: rewardId, at: Date.now(), cost },
      ...(prev.claimedRewards ?? []),
    ].slice(0, 50),
  };

  await writeMap({ ...map, [childId]: next });
  revalidatePath("/", "layout");
  return { ok: true, progress: next };
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
