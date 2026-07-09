"use server";

// Source-of-truth child progress. Lives in Clerk privateMetadata.childProgress
// keyed by child id. Streams to a per-child localStorage cache on the client
// for instant render + offline fallback.

import { revalidatePath } from "next/cache";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import {
  ChildProgress,
  CompletedMissionEntry,
  defaultChildProgress,
  EggColor,
  HatchedCharacter,
  HatchedEntry,
  WORDS_TO_HATCH,
  CRACK_THRESHOLDS,
  CRACK_LABELS,
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

export async function saveChildProgressAction(
  childId: string,
  p: ChildProgress,
): Promise<void> {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  const map = readMap(user.privateMetadata);
  await writeMap({ ...map, [childId]: p });
  revalidatePath("/");
  revalidatePath("/feathers");
  revalidatePath("/missions");
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
    // already counted today — keep streak
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
  revalidatePath("/");
  revalidatePath("/feathers");
  revalidatePath("/missions");
  return next;
}

export async function deleteChildProgressAction(childId: string): Promise<void> {
  const user = await currentUser();
  if (!user) return;
  const map = readMap(user.privateMetadata);
  if (!(childId in map)) return;
  const { [childId]: _drop, ...rest } = map;
  void _drop;
  await writeMap(rest);
  revalidatePath("/");
  revalidatePath("/feathers");
  revalidatePath("/missions");
}

// ─── Egg + word tracking ────────────────────────────────────────────────────

const EGG_COLORS: EggColor[] = ["purple", "blue", "pink", "gold", "rainbow", "silver"];
const COMMON_CHARS: HatchedCharacter[] = ["baby-eagle", "baby-peacock", "baby-bunny", "baby-butterfly"];
const RARE_CHARS: HatchedCharacter[] = ["rainbow-peacock", "feather-dragon", "sparkle-unicorn"];

function pickEggColor(): EggColor {
  return EGG_COLORS[Math.floor(Math.random() * EGG_COLORS.length)];
}
function pickCharacter(): HatchedCharacter {
  const r = Math.random();
  if (r < 0.05) return "golden-eagle";
  if (r < 0.30) return RARE_CHARS[Math.floor(Math.random() * RARE_CHARS.length)];
  return COMMON_CHARS[Math.floor(Math.random() * COMMON_CHARS.length)];
}

type CrackEvent = {
  level: number;
  label: string;
  message: string;
  color: EggColor;
  wordsInEgg: number;
};

/**
 * Increment the active child's word count. Returns any egg crack / hatch
 * event that was triggered so the caller can show the reveal overlay.
 * Pass `word` to store it in the child's 3 braggable recent words.
 */
export async function recordWordsFoundAction(
  count: number,
  word?: string,
): Promise<{
  wordsFound: number;
  hatched?: HatchedEntry | null;
  crackJustCrossed?: CrackEvent | null;
} | null> {
  const childId = await getActiveChildId();
  if (!childId) return null;
  const user = await currentUser();
  if (!user) return null;

  const map = readMap(user.privateMetadata);
  const prev = map[childId] ?? defaultChildProgress;

  const prevWords = prev.wordsFound ?? 0;
  const newWords = prevWords + count;

  const egg = prev.egg ?? { color: pickEggColor(), wordsAtStart: 0 };
  const prevInEgg = Math.max(0, prevWords - egg.wordsAtStart);
  const newInEgg  = Math.max(0, newWords  - egg.wordsAtStart);

  let hatched: HatchedEntry | null = null;
  let crackJustCrossed: CrackEvent | null = null;
  let currentEgg = egg;
  let newHatched = prev.hatched ?? [];

  if (newInEgg >= WORDS_TO_HATCH && prevInEgg < WORDS_TO_HATCH) {
    const now = Date.now();
    const entry: HatchedEntry = {
      character: pickCharacter(),
      color: egg.color,
      wordsRead: newWords,
      at: now,
      hatchedAt: now,
    };
    newHatched = [entry, ...newHatched].slice(0, 20);
    hatched = entry;
    currentEgg = { color: pickEggColor(), wordsAtStart: newWords };
  } else {
    for (let i = CRACK_THRESHOLDS.length - 2; i >= 0; i--) {
      const threshold = CRACK_THRESHOLDS[i];
      if (newInEgg >= threshold && prevInEgg < threshold) {
        crackJustCrossed = {
          level: i,
          label: CRACK_LABELS[i].label,
          message: CRACK_LABELS[i].message,
          color: egg.color,
          wordsInEgg: newInEgg,
        };
        break;
      }
    }
  }

  const recentWords = word
    ? [word.toUpperCase().trim(), ...(prev.recentWords ?? [])].slice(0, 3)
    : prev.recentWords ?? [];

  const next: ChildProgress = {
    ...prev,
    wordsFound: newWords,
    egg: currentEgg,
    hatched: newHatched,
    recentWords,
  };

  await writeMap({ ...map, [childId]: next });
  revalidatePath("/");
  revalidatePath("/feathers");
  return { wordsFound: newWords, hatched, crackJustCrossed };
}

/**
 * Seed the active child's word count to a specific number (testing only).
 * Sets wordsFound so that `targetWords` words are inside the current egg.
 */
export async function seedWordsAction(
  targetWords: number,
): Promise<{ ok: boolean; wordsInEgg: number } | null> {
  const childId = await getActiveChildId();
  if (!childId) return null;
  const user = await currentUser();
  if (!user) return null;

  const map = readMap(user.privateMetadata);
  const prev = map[childId] ?? defaultChildProgress;
  const egg = prev.egg ?? { color: pickEggColor(), wordsAtStart: 0 };
  const newWordsFound = egg.wordsAtStart + Math.max(0, targetWords);
  const wordsInEgg = Math.max(0, newWordsFound - egg.wordsAtStart);

  await writeMap({
    ...map,
    [childId]: { ...prev, wordsFound: newWordsFound, egg },
  });
  revalidatePath("/");
  return { ok: true, wordsInEgg };
}

/**
 * Admin seed — add feathers or set word count for a specific child.
 */
export async function adminSeedAction(args: {
  childId: string;
  type: "feathers" | "words";
  amount: number;
}): Promise<{ ok: true; newValue: number } | { ok: false; error: string }> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const map = readMap(user.privateMetadata);
  const prev = map[args.childId] ?? defaultChildProgress;

  if (args.type === "feathers") {
    const newPop = Math.min(10000, (prev.featherPop ?? 0) + args.amount);
    await writeMap({ ...map, [args.childId]: { ...prev, featherPop: newPop } });
    revalidatePath("/");
    return { ok: true, newValue: newPop };
  }

  // type === "words": seed `amount` words into the current egg
  const egg = prev.egg ?? { color: pickEggColor(), wordsAtStart: 0 };
  const newWordsFound = egg.wordsAtStart + Math.max(0, args.amount);
  const wordsInEgg = Math.max(0, newWordsFound - egg.wordsAtStart);
  await writeMap({
    ...map,
    [args.childId]: { ...prev, wordsFound: newWordsFound, egg },
  });
  revalidatePath("/");
  return { ok: true, newValue: wordsInEgg };
}

// Compatibility helpers for older imports (kept to avoid breaking last push)
export async function awardFeatherPopAction(amount: number) {
  const childId = await getActiveChildId();
  if (!childId) throw new Error("No active child");
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  const map = readMap(user.privateMetadata);
  const prev = map[childId] ?? defaultChildProgress;
  const newPop = Math.min(1000000, (prev.featherPop ?? 0) + amount);
  const next = { ...prev, featherPop: newPop };
  await writeMap({ ...map, [childId]: next });
  revalidatePath("/");
  return next;
}

async function claimDaily(kind: "music" | "video") {
  const childId = await getActiveChildId();
  if (!childId) return { awarded: false, reason: "No active child" };
  const user = await currentUser();
  if (!user) return { awarded: false, reason: "Unauthorized" };
  const map = readMap(user.privateMetadata);
  const prev = map[childId] ?? defaultChildProgress;
  const today = todayISO();
  const key = kind === "music" ? "lastMusicBonusDate" : "lastVideoBonusDate";
  // @ts-ignore - storing legacy keys inside the progress object is intentional here
  if ((prev as any)[key] === today) return { awarded: false, reason: "Already claimed today." };
  const next = { ...prev, featherPop: (prev.featherPop ?? 0) + 5, /* @ts-ignore */ [key]: today };
  await writeMap({ ...map, [childId]: next });
  revalidatePath("/");
  return { awarded: true };
}

export async function claimMusicBonusAction() {
  return claimDaily("music");
}

export async function claimVideoBonusAction() {
  return claimDaily("video");
}

// More compatibility helpers expected by older client/server codepaths.
export type SpinPrize = string;

export async function getGoldenFeatherMonthsAction(): Promise<string[]> {
  // Return an empty list for now — legacy print page handles empty gracefully.
  return [];
}

export async function listSpinPrizesAction(): Promise<{ id: string; label: string; emoji: string }[]> {
  // Minimal prize set to keep the spin wheel UI functional.
  return [
    { id: "feathers-100", label: "100 FeatherPop", emoji: "🪶" },
    { id: "feathers-250", label: "250 FeatherPop", emoji: "✨" },
    { id: "mystery-box", label: "Mystery prize", emoji: "🎁" },
  ];
}

export async function seedFeathersAction(amount: number): Promise<{ ok: true; featherPop: number } | { ok: false; reason: string }> {
  const childId = await getActiveChildId();
  if (!childId) return { ok: false, reason: "No active child" };
  const user = await currentUser();
  if (!user) return { ok: false, reason: "Unauthorized" };
  const map = readMap(user.privateMetadata);
  const prev = map[childId] ?? defaultChildProgress;
  const newPop = Math.min(1000000, (prev.featherPop ?? 0) + amount);
  await writeMap({ ...map, [childId]: { ...prev, featherPop: newPop } });
  revalidatePath("/");
  return { ok: true, featherPop: newPop };
}

export async function spinWheelAction(): Promise<{
  ok: true;
  prize: { id: string; label: string; emoji: string };
  claimAt: number | null;
} | { ok: false; reason: string }> {
  const prizes = await listSpinPrizesAction();
  if (prizes.length === 0) return { ok: false, reason: "No prizes" };
  const childId = await getActiveChildId();
  if (!childId) return { ok: false, reason: "No active child" };
  const user = await currentUser();
  if (!user) return { ok: false, reason: "Unauthorized" };

  const map = readMap(user.privateMetadata);
  const prev = map[childId] ?? defaultChildProgress;
  const freeSpins = (prev as any).freeSpins ?? 1;
  if (freeSpins <= 0) return { ok: false, reason: "No spins available" };

  const prize = prizes[0];
  // For simple compatibility: award a featherPop prize when id starts with 'feathers-'.
  let claimAt: number | null = null;
  const next: ChildProgress = { ...prev };
  if (prize.id.startsWith("feathers-")) {
    const amt = Number(prize.id.split("-")[1]) || 0;
    next.featherPop = (prev.featherPop ?? 0) + amt;
    claimAt = Date.now();
  } else {
    // Non-feather prize — mark for claiming by creating a timestamp-based claim id.
    claimAt = Date.now();
  }
  // decrement free spins if present
  (next as any).freeSpins = Math.max(0, (prev as any).freeSpins ?? 1 - 1);

  await writeMap({ ...map, [childId]: next });
  revalidatePath("/");
  return { ok: true, prize: { id: prize.id, label: prize.label, emoji: prize.emoji }, claimAt };
}
