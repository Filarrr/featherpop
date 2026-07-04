// Free-tier daily play limits. Each of the three games (Feather Match / Park
// Hunt / Letter Pop) can be played 3x/day for free; members are unlimited.
//
// Server-only shared logic used by both the read (page render) path and the
// write (consume-on-play) path.

import "server-only";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { getActiveChildId } from "@/lib/active-child-server";
import { isOwnerUser } from "@/lib/owner";
import type { ChildProgress } from "@/lib/child-profile";

export const FREE_DAILY_PLAYS = 3;
export type GameKey = "sort" | "parkhunt" | "letterpop";

export function playDayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function membershipActive(
  user: {
    publicMetadata?: Record<string, unknown> | null;
  } & Parameters<typeof isOwnerUser>[0],
): boolean {
  if (isOwnerUser(user)) return true;
  const m = (user.publicMetadata?.membership ?? {}) as { status?: string };
  return m.status === "active" || m.status === "trialing";
}

function progressMap(
  meta: unknown,
): Record<string, ChildProgress> {
  if (!meta || typeof meta !== "object") return {};
  const v = (meta as Record<string, unknown>).childProgress;
  if (!v || typeof v !== "object") return {};
  return v as Record<string, ChildProgress>;
}

export interface PlayGate {
  isMember: boolean;
  remaining: number; // plays left today (big number for members)
  locked: boolean; // free user who's used all plays
}

/** READ-ONLY gate for a game — safe to call during a server render. */
export async function readPlayGate(game: GameKey): Promise<PlayGate> {
  const user = await currentUser();
  if (!user) return { isMember: false, remaining: FREE_DAILY_PLAYS, locked: false };
  if (membershipActive(user)) {
    return { isMember: true, remaining: 999, locked: false };
  }
  const childId = await getActiveChildId();
  if (!childId) return { isMember: false, remaining: FREE_DAILY_PLAYS, locked: false };

  const map = progressMap(user.privateMetadata);
  const dp = map[childId]?.dailyPlays;
  const today = playDayKey();
  const count = dp && dp.date === today ? (dp[game] ?? 0) : 0;
  const remaining = Math.max(0, FREE_DAILY_PLAYS - count);
  return { isMember: false, remaining, locked: remaining <= 0 };
}

/**
 * Count one play of `game` for the active free child. Members are unlimited
 * (no write). Returns whether the play is allowed and how many remain.
 */
export async function tryConsumePlay(
  game: GameKey,
): Promise<{ allowed: boolean; remaining: number; isMember: boolean }> {
  const user = await currentUser();
  if (!user) return { allowed: true, remaining: FREE_DAILY_PLAYS, isMember: false };
  if (membershipActive(user)) {
    return { allowed: true, remaining: 999, isMember: true };
  }
  const childId = await getActiveChildId();
  if (!childId) return { allowed: true, remaining: FREE_DAILY_PLAYS, isMember: false };
  const { userId } = await auth();
  if (!userId) return { allowed: true, remaining: FREE_DAILY_PLAYS, isMember: false };

  const client = await clerkClient();
  const u = await client.users.getUser(userId);
  const map = progressMap(u.privateMetadata);
  const prev = map[childId] ?? ({} as ChildProgress);
  const today = playDayKey();
  const dp =
    prev.dailyPlays && prev.dailyPlays.date === today
      ? prev.dailyPlays
      : { date: today };
  const count = dp[game] ?? 0;
  if (count >= FREE_DAILY_PLAYS) {
    return { allowed: false, remaining: 0, isMember: false };
  }
  const nextProgress: ChildProgress = {
    ...prev,
    dailyPlays: { ...dp, date: today, [game]: count + 1 },
  };
  await client.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...u.privateMetadata,
      childProgress: { ...map, [childId]: nextProgress },
    },
  });
  return {
    allowed: true,
    remaining: Math.max(0, FREE_DAILY_PLAYS - (count + 1)),
    isMember: false,
  };
}
