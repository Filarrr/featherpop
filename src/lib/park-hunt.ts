// Park Hunt session model — deterministic weekly station partitioning.
//
// Each week the app generates a fresh 120-word set, split into 6 stations
// of 20. The split is DETERMINISTIC per week so every child sees the same
// word lists at the same station all week — which is important because the
// physical QR codes don't change.
//
// Targets are per-child, picked from the week's 120 words.

import { PARK_HUNT_BANK } from "./park-hunt-words";

export const STATION_COUNT = 6;
export const WORDS_PER_STATION = 20;
export const TOTAL_DAILY_WORDS = STATION_COUNT * WORDS_PER_STATION; // 120

export const STATION_THEMES = [
  { label: "Magic Station", color: "linear-gradient(135deg, #9b5cff, #6b2aff)" },
  { label: "Eagle Station", color: "linear-gradient(135deg, #34d1ff, #2271ff)" },
  { label: "Pop Station", color: "linear-gradient(135deg, #ff6b93, #ff3a96)" },
  { label: "Mirror Station", color: "linear-gradient(135deg, #ffd14a, #ff9f3a)" },
  { label: "Miss. Nelly Station", color: "linear-gradient(135deg, #34e3a4, #1ea672)" },
  { label: "Spider Isle Station", color: "linear-gradient(135deg, #ff8a4d, #ff4d8d)" },
];

export function getStationLabel(stationIndex: number): string {
  return STATION_THEMES[stationIndex]?.label ?? `Station ${stationIndex + 1}`;
}

/** YYYY-MM-DD in the user's local time. (Kept for per-day stats / bonuses.) */
export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Week key — ISO-week-ish: Monday is day 1, Sunday is day 7. Returns
 * the YYYY-MM-DD of the Monday that starts this week. The station
 * word lists rotate ON THIS KEY, so every Monday the words refresh.
 */
export function weekKey(now: Date = new Date()): string {
  const d = new Date(now);
  // Anchor to noon UTC to avoid DST jumps changing the day.
  d.setHours(12, 0, 0, 0);
  // JS getDay() returns 0..6 with Sunday=0. Convert to ISO 1..7 with Mon=1.
  const dow = ((d.getDay() + 6) % 7) + 1;
  d.setDate(d.getDate() - (dow - 1));
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
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

export interface WeeklyStations {
  week: string; // YYYY-MM-DD of Monday that starts this week
  // stations[0] = words for station 1, etc.
  stations: string[][];
  // every word in the week's set, in order [station1..., station2..., ...]
  allWords: string[];
}

/**
 * Deterministically generate this week's 6 station word lists. Same
 * answer every time on the same week — Monday-to-Sunday rotation.
 * (Per client spec: words refresh weekly, not daily.)
 */
export function weeklyStations(
  week: string = weekKey(),
  bank: readonly string[] = PARK_HUNT_BANK,
): WeeklyStations {
  const source = bank.length > 0 ? bank : PARK_HUNT_BANK;
  const seed = hashString(`mfp-parkhunt-week-${week}`);
  const rand = mulberry32(seed);
  const shuffled = shuffleSeeded(source.slice(), rand);
  if (shuffled.length < TOTAL_DAILY_WORDS) {
    while (shuffled.length < TOTAL_DAILY_WORDS) {
      shuffled.push(shuffled[shuffled.length % source.length]);
    }
  }
  const picked = shuffled.slice(0, TOTAL_DAILY_WORDS);
  const stations: string[][] = [];
  for (let i = 0; i < STATION_COUNT; i++) {
    stations.push(picked.slice(i * WORDS_PER_STATION, (i + 1) * WORDS_PER_STATION));
  }
  return { week, stations, allWords: picked };
}

/** Backwards-compatible alias — older callers still import `dailyStations`. */
export const dailyStations = (
  key: string = weekKey(),
  bank: readonly string[] = PARK_HUNT_BANK,
) => {
  const w = weeklyStations(key, bank);
  return { date: w.week, stations: w.stations, allWords: w.allWords };
};

/** Given a target word, which station (0–5) contains it this week? */
export function stationOfWord(
  word: string,
  week: string = weekKey(),
  bank: readonly string[] = PARK_HUNT_BANK,
): number {
  const w = word.toUpperCase();
  const { stations } = weeklyStations(week, bank);
  for (let i = 0; i < stations.length; i++) {
    if (stations[i].includes(w)) return i;
  }
  return -1;
}

/**
 * Pick a per-session target word for a child. The TARGET varies day-to-day
 * per-child (so 'today's word' rotates) but is picked from the WEEK's
 * 100-word pool (which only refreshes Mondays).
 */
export function pickTargetForChild(
  childId: string,
  date: string = todayKey(),
  bank: readonly string[] = PARK_HUNT_BANK,
): { word: string; stationId: number } {
  const week = weekKey(new Date(date));
  const seed = hashString(`mfp-parkhunt-target-${childId}-${date}`);
  const rand = mulberry32(seed);
  const { allWords } = weeklyStations(week, bank);
  const word = allWords[Math.floor(rand() * allWords.length)];
  return { word, stationId: stationOfWord(word, week, bank) };
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
  bank: readonly string[] = PARK_HUNT_BANK,
): { word: string; stationId: number } {
  const week = weekKey(new Date(date));
  const seed = hashString(`mfp-parkhunt-target-${childId}-${date}-${excludeWord ?? "0"}-${Date.now()}`);
  const rand = mulberry32(seed);
  const { allWords } = weeklyStations(week, bank);
  let word = allWords[Math.floor(rand() * allWords.length)];
  let safety = 12;
  while (excludeWord && word === excludeWord && safety-- > 0) {
    word = allWords[Math.floor(rand() * allWords.length)];
  }
  return { word, stationId: stationOfWord(word, week, bank) };
}
