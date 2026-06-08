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

export function totalFeathers(p: ChildProgress): number {
  return Object.values(p.feathers).reduce((s, n) => s + (n ?? 0), 0);
}

export function recentMissionIds(p: ChildProgress, n = 6): string[] {
  return p.history.slice(0, n).map((e) => e.id);
}
