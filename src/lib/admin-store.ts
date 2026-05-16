// Localstorage-backed CRUD for the MVP admin. Falls back to defaults when
// no overrides are present. Will be replaced by Supabase queries in v1.1.

import {
  Challenge,
  Reward,
  defaultChallenges,
  defaultRewards,
} from "./game-data";

const CHAL_KEY = "ms-feather-pop-admin-challenges";
const REW_KEY = "ms-feather-pop-admin-rewards";
const AUTH_KEY = "ms-feather-pop-admin-auth";
export const ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "featherpop";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

/* ---------- Challenges ---------- */

export function listChallenges(): Challenge[] {
  return read<Challenge[]>(CHAL_KEY, defaultChallenges);
}

export function getChallenge(slug: string): Challenge | undefined {
  return listChallenges().find((c) => c.slug === slug && c.active !== false);
}

export function saveChallenges(items: Challenge[]) {
  write(CHAL_KEY, items);
}

export function upsertChallenge(c: Challenge) {
  const all = listChallenges();
  const idx = all.findIndex((x) => x.id === c.id);
  if (idx >= 0) all[idx] = c;
  else all.push(c);
  saveChallenges(all);
  return all;
}

export function removeChallenge(id: string) {
  const all = listChallenges().filter((c) => c.id !== id);
  saveChallenges(all);
  return all;
}

/* ---------- Rewards ---------- */

export function listRewards(): Reward[] {
  return read<Reward[]>(REW_KEY, defaultRewards);
}

export function saveRewards(items: Reward[]) {
  write(REW_KEY, items);
}

export function upsertReward(r: Reward) {
  const all = listRewards();
  const idx = all.findIndex((x) => x.id === r.id);
  if (idx >= 0) all[idx] = r;
  else all.push(r);
  saveRewards(all);
  return all;
}

export function removeReward(id: string) {
  const all = listRewards().filter((r) => r.id !== id);
  saveRewards(all);
  return all;
}

/* ---------- Admin auth (very lightweight, MVP only) ---------- */

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(AUTH_KEY) === "1";
}

export function setAdminAuthed(v: boolean) {
  if (typeof window === "undefined") return;
  if (v) window.sessionStorage.setItem(AUTH_KEY, "1");
  else window.sessionStorage.removeItem(AUTH_KEY);
}

export function resetContent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CHAL_KEY);
  window.localStorage.removeItem(REW_KEY);
}
