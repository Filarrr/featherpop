// Legacy local player store (compat layer)
// The app migrated primary progress to server-side Clerk metadata. Some
// client code (prints, rewards, legacy game logic) still expects the old
// local player API — provide a minimal backward-compatible subset here.

export type PlayerProgress = {
  totalFeatherPop: number;
};

export const defaultProgress: PlayerProgress = { totalFeatherPop: 0 };

export const progressKey = "ms-feather-pop-legacy-progress";

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
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function readProgress(): PlayerProgress {
  return readJson<PlayerProgress>(progressKey, defaultProgress);
}

export function saveProgress(p: PlayerProgress) {
  writeJson<PlayerProgress>(progressKey, p);
}

// Small convenience to read a legacy player profile (may be absent)
export function readProfile(): { nickname?: string } | null {
  return readJson<{ nickname?: string } | null>("ms-feather-player-profile", null);
}

export {};
