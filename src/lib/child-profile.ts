// Child profile + per-child progress.
// Profiles (id/nickname/avatar) live in Clerk publicMetadata.children[].
// Progress (feathers / streak / completed missions) lives in localStorage,
// keyed by child id — fast writes, no per-mission API call.

import { Mission, FeatherType } from "./missions";
import { progressKey, saveProgress, readProgress } from "./player";

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

export interface ChildProgress {
  feathers: FeatherCounts;
  featherPop: number;
  totalMissions: number;
  history: CompletedMissionEntry[]; // newest first, capped at 50
  streakDays: number;
  lastActiveDate: string; // yyyy-mm-dd
}

export const defaultChildProgress: ChildProgress = {
  feathers: {},
  featherPop: 0,
  totalMissions: 0,
  history: [],
  streakDays: 0,
  lastActiveDate: "",
};

export const activeChildKey = "ms-feather-pop-active-child";
export function progressKeyForChild(childId: string) {
  return `ms-feather-pop-child-progress::${childId}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readActiveChildId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(activeChildKey);
}
export function setActiveChildId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(activeChildKey, id);
  else window.localStorage.removeItem(activeChildKey);
}

export function readChildProgress(childId: string): ChildProgress {
  return readJson<ChildProgress>(progressKeyForChild(childId), defaultChildProgress);
}
export function saveChildProgress(childId: string, p: ChildProgress) {
  writeJson(progressKeyForChild(childId), p);
}

export function totalFeathers(p: ChildProgress): number {
  return Object.values(p.feathers).reduce((s, n) => s + (n ?? 0), 0);
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function yesterdayISO(today: string): string {
  const [y, m, d] = today.split("-").map((n) => Number(n));
  const dt = new Date(y, m - 1, d - 1);
  const yy = dt.getFullYear();
  const mm = `${dt.getMonth() + 1}`.padStart(2, "0");
  const dd = `${dt.getDate()}`.padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function applyMissionReward(childId: string, mission: Mission): ChildProgress {
  const prev = readChildProgress(childId);
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
  saveChildProgress(childId, next);

  // Mirror FeatherPop balance into the legacy player.ts store so existing
  // RewardsClient / WalletClient / Letter Pop reward checks keep working.
  const legacy = readProgress();
  saveProgress({
    ...legacy,
    totalFeatherPop: legacy.totalFeatherPop + mission.featherPop,
  });

  return next;
}

export function recentMissionIds(childId: string, n = 6): string[] {
  return readChildProgress(childId)
    .history.slice(0, n)
    .map((e) => e.id);
}

// Re-export the progress key so callers (e.g. legacy mirror) have one source of truth.
export { progressKey as legacyProgressKey };
