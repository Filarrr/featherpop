"use server";

// Child progress lives in Clerk privateMetadata.childProgress keyed by child
// id. All reads + writes go through these server actions.

import { revalidatePath } from "next/cache";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import {
  ChildProgress,
  CompletedMissionEntry,
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
