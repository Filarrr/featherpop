// Park Hunt session model — deterministic daily station partitioning.
//
// Each day the app generates a fresh 120-word set, split into 6 stations
// of 20. The split is DETERMINISTIC per (date, dayKey) so every child sees
// the same word lists on the same day at the same station — which is
// important because the physical QR codes don't change.
//
// Targets are per-child, picked from the day's 120 words.

import { PARK_HUNT_BANK } from "./park-hunt-words";

export const STATION_COUNT = 6;
export const WORDS_PER_STATION = 20;
export const TOTAL_DAILY_WORDS = STATION_COUNT * WORDS_PER_STATION; // 120

/** YYYY-MM-DD in the user's local time. */
export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Stable 32-bit hash → seeds the shuffler so each day is reproducible. */
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/** mulberry32 PRNG — tiny, fast, deterministic. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleSeeded<T>(arr: T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface DailyStations {
  date: string;
  // stations[0] = words for station 1, etc.
  stations: string[][];
  // every word in the day's set, in order [station1..., station2..., ...]
  allWords: string[];
}

/**
 * Deterministically generate today's 6 station word lists. Will produce
 * the same answer every time it's called on the same date, on any device.
 */
export function dailyStations(date: string = todayKey()): DailyStations {
  const seed = hashString(`mfp-parkhunt-${date}`);
  const rand = mulberry32(seed);
  const shuffled = shuffleSeeded(PARK_HUNT_BANK, rand);
  if (shuffled.length < TOTAL_DAILY_WORDS) {
    // Bank smaller than 120 — pad by cycling. (Shouldn't happen with the
    // current bank, but a defensive fallback.)
    while (shuffled.length < TOTAL_DAILY_WORDS) {
      shuffled.push(shuffled[shuffled.length % PARK_HUNT_BANK.length]);
    }
  }
  const picked = shuffled.slice(0, TOTAL_DAILY_WORDS);
  const stations: string[][] = [];
  for (let i = 0; i < STATION_COUNT; i++) {
    stations.push(picked.slice(i * WORDS_PER_STATION, (i + 1) * WORDS_PER_STATION));
  }
  return { date, stations, allWords: picked };
}

/** Given a target word, which station (0–5) contains it today? */
export function stationOfWord(word: string, date: string = todayKey()): number {
  const w = word.toUpperCase();
  const { stations } = dailyStations(date);
  for (let i = 0; i < stations.length; i++) {
    if (stations[i].includes(w)) return i;
  }
  return -1;
}

/**
 * Pick a per-session target word for a child. Uses a child-id-seeded RNG
 * so different children get different targets on the same day, but the
 * same child gets the same target if they reload before scanning.
 */
export function pickTargetForChild(
  childId: string,
  date: string = todayKey(),
): { word: string; stationId: number } {
  const seed = hashString(`mfp-parkhunt-target-${childId}-${date}`);
  const rand = mulberry32(seed);
  const { allWords } = dailyStations(date);
  const word = allWords[Math.floor(rand() * allWords.length)];
  return { word, stationId: stationOfWord(word, date) };
}

/**
 * Sanity check used by the QR scanner.
 * Accepts: 'parkhunt-station-3', 'mfp-station-3', 'station3', 'station-3',
 * URL with ?station=3, or any path ending in /station/3.
 */
export function parseStationCode(raw: string): number | null {
  const trimmed = raw.trim().toLowerCase();
  const m =
    trimmed.match(/station[-_/]?(\d)/) ??
    trimmed.match(/^(\d)$/);
  if (m && m[1]) {
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= STATION_COUNT) return n - 1;
  }
  try {
    const u = new URL(
      trimmed.startsWith("http") ? trimmed : `https://x/${trimmed}`,
    );
    const q = u.searchParams.get("station");
    if (q) {
      const n = parseInt(q, 10);
      if (n >= 1 && n <= STATION_COUNT) return n - 1;
    }
    const m2 = u.pathname.match(/station[\/=-]?(\d)/i);
    if (m2 && m2[1]) {
      const n = parseInt(m2[1], 10);
      if (n >= 1 && n <= STATION_COUNT) return n - 1;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Pick a FRESH target for a child (different from their previous one) —
 * called after a correct find when the kid wants another round.
 */
export function nextTargetForChild(
  childId: string,
  date: string,
  excludeWord?: string,
): { word: string; stationId: number } {
  const seed = hashString(`mfp-parkhunt-target-${childId}-${date}-${excludeWord ?? "0"}-${Date.now()}`);
  const rand = mulberry32(seed);
  const { allWords } = dailyStations(date);
  let word = allWords[Math.floor(rand() * allWords.length)];
  let safety = 12;
  while (excludeWord && word === excludeWord && safety-- > 0) {
    word = allWords[Math.floor(rand() * allWords.length)];
  }
  return { word, stationId: stationOfWord(word, date) };
}
