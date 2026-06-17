"use server";

// Per-child Park Hunt state. Today's target word + station are stored in
// Clerk privateMetadata.parkHunt[childId] so the kid keeps their target
// across page reloads and devices, but each child still gets an
// independent session.

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getActiveChildId } from "@/lib/active-child-server";
import {
  dailyStations,
  nextTargetForChild,
  pickTargetForChild,
  todayKey,
} from "@/lib/park-hunt";
import { recordWordsFoundAction } from "@/lib/child-progress-actions";

interface StoredTarget {
  date: string;
  word: string;
  stationId: number;
  // Number of words the child has correctly found TODAY (used to award
  // the once-per-day video/music bonus and to track daily progress
  // without polluting featherPop).
  foundToday?: number;
}

type ParkHuntMap = Record<string, StoredTarget>;

function readMap(meta: unknown): ParkHuntMap {
  if (!meta || typeof meta !== "object") return {};
  const v = (meta as Record<string, unknown>).parkHunt;
  if (!v || typeof v !== "object") return {};
  return v as ParkHuntMap;
}

async function writeMap(map: ParkHuntMap): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  await client.users.updateUserMetadata(userId, {
    privateMetadata: { ...user.privateMetadata, parkHunt: map },
  });
}

/**
 * Get (or freshly assign) today's target word for the active child.
 * Returns null if no active child cookie is set.
 */
export async function getCurrentTargetAction(): Promise<
  | {
      childId: string;
      date: string;
      word: string;
      stationId: number;
      foundToday: number;
    }
  | null
> {
  const childId = await getActiveChildId();
  if (!childId) return null;
  const user = await currentUser();
  if (!user) return null;

  const date = todayKey();
  const map = readMap(user.privateMetadata);
  const existing = map[childId];

  if (existing && existing.date === date) {
    return {
      childId,
      date: existing.date,
      word: existing.word,
      stationId: existing.stationId,
      foundToday: existing.foundToday ?? 0,
    };
  }

  // New day or new child — pick fresh.
  const next = pickTargetForChild(childId, date);
  const stored: StoredTarget = { date, word: next.word, stationId: next.stationId, foundToday: 0 };
  await writeMap({ ...map, [childId]: stored });
  return {
    childId,
    date: stored.date,
    word: stored.word,
    stationId: stored.stationId,
    foundToday: 0,
  };
}

/** Rotate to a fresh target (called after a correct find / "another round"). */
export async function rotateTargetAction(): Promise<
  | { childId: string; date: string; word: string; stationId: number; foundToday: number }
  | null
> {
  const childId = await getActiveChildId();
  if (!childId) return null;
  const user = await currentUser();
  if (!user) return null;

  const date = todayKey();
  const map = readMap(user.privateMetadata);
  const prev = map[childId]?.word;
  const next = nextTargetForChild(childId, date, prev);
  const foundToday = map[childId]?.date === date ? map[childId].foundToday ?? 0 : 0;
  const stored: StoredTarget = { date, word: next.word, stationId: next.stationId, foundToday };
  await writeMap({ ...map, [childId]: stored });
  revalidatePath("/park-hunt", "page");
  return {
    childId,
    date: stored.date,
    word: stored.word,
    stationId: stored.stationId,
    foundToday,
  };
}

/**
 * The child found the target word at the right station. Award 1 feather +
 * 1 word-count + egg progress, then rotate to a fresh target.
 *
 * Returns the new target (so the UI can move straight into "Find the next
 * word") plus any egg-hatch payload from recordWordsFound.
 */
export async function submitFoundWordAction(args: {
  word: string;
  stationId: number;
}): Promise<
  | {
      ok: true;
      next: { word: string; stationId: number };
      foundToday: number;
      hatched?: { name: string; rarity: string; id: string } | null;
    }
  | { ok: false; reason: string }
> {
  const childId = await getActiveChildId();
  if (!childId) return { ok: false, reason: "No active child." };
  const user = await currentUser();
  if (!user) return { ok: false, reason: "Not signed in." };

  const date = todayKey();
  const map = readMap(user.privateMetadata);
  const target = map[childId];
  if (!target || target.date !== date) {
    return { ok: false, reason: "No active target — start a new round." };
  }

  // Validate: word + stationId must match the current stored target.
  const submittedWord = args.word.toUpperCase();
  if (submittedWord !== target.word) {
    return { ok: false, reason: "Wrong word." };
  }
  if (args.stationId !== target.stationId) {
    return { ok: false, reason: "Wrong station — try another one." };
  }

  // Reward via the existing recordWordsFoundAction (handles +1 feather
  // base + word count + egg progress + level-up notifications). Any
  // hatched egg is returned so the UI can show the reveal.
  let hatchedPayload: { name: string; rarity: string; id: string } | null = null;
  try {
    const result = await recordWordsFoundAction(1);
    if (result?.hatched) {
      // HatchedEntry.character is a string id (e.g. 'baby-eagle'); the rich
      // metadata (display name + rarity) lives in the egg catalog. For now
      // surface the raw character id so the client can look it up.
      hatchedPayload = {
        name: result.hatched.character,
        rarity: result.hatched.color,
        id: result.hatched.character,
      };
    }
  } catch (err) {
    console.warn("[park-hunt] recordWordsFound failed", err);
  }

  // Rotate target for the next round.
  const next = nextTargetForChild(childId, date, target.word);
  const foundToday = (target.foundToday ?? 0) + 1;
  const stored: StoredTarget = {
    date,
    word: next.word,
    stationId: next.stationId,
    foundToday,
  };
  await writeMap({ ...map, [childId]: stored });
  revalidatePath("/park-hunt", "page");
  return {
    ok: true,
    next: { word: next.word, stationId: next.stationId },
    foundToday,
    hatched: hatchedPayload,
  };
}

/** Server-side helper for the station route: get the 20-word list for a station. */
export async function getStationWordsAction(stationId: number): Promise<string[]> {
  if (stationId < 0 || stationId >= 6) return [];
  return dailyStations().stations[stationId];
}

/** Verify a scanned station matches the active target. Doesn't mutate state. */
export async function isCorrectStationAction(stationId: number): Promise<{
  matches: boolean;
  targetStation: number | null;
  targetWord: string | null;
}> {
  const childId = await getActiveChildId();
  if (!childId) return { matches: false, targetStation: null, targetWord: null };
  const user = await currentUser();
  if (!user) return { matches: false, targetStation: null, targetWord: null };
  const date = todayKey();
  const map = readMap(user.privateMetadata);
  const target = map[childId];
  if (!target || target.date !== date) {
    // No active target yet — assign one.
    const fresh = pickTargetForChild(childId, date);
    return {
      matches: fresh.stationId === stationId,
      targetStation: fresh.stationId,
      targetWord: fresh.word,
    };
  }
  return {
    matches: target.stationId === stationId,
    targetStation: target.stationId,
    targetWord: target.word,
  };
}

