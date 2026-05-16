// Lightweight client-side player state. The MVP intentionally avoids
// collecting parent emails or full names per the PRD privacy rules.

export type PlayerProfile = {
  nickname: string;
  createdAt: string;
};

export type PlayerProgress = {
  totalFeatherPop: number;
  completedChallengeSlugs: string[];
};

export const profileKey = "ms-feather-pop-profile";
export const progressKey = "ms-feather-pop-progress";

export const defaultProgress: PlayerProgress = {
  totalFeatherPop: 0,
  completedChallengeSlugs: [],
};

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

export const readProfile = () => readJson<PlayerProfile | null>(profileKey, null);
export const saveProfile = (p: PlayerProfile) => writeJson(profileKey, p);
export const readProgress = () => readJson<PlayerProgress>(progressKey, defaultProgress);
export const saveProgress = (p: PlayerProgress) => writeJson(progressKey, p);

export function completeChallenge(slug: string, value: number): PlayerProgress {
  const current = readProgress();
  if (current.completedChallengeSlugs.includes(slug)) return current;
  const next: PlayerProgress = {
    completedChallengeSlugs: [...current.completedChallengeSlugs, slug],
    totalFeatherPop: current.totalFeatherPop + value,
  };
  saveProgress(next);
  return next;
}

export function resetPlayerState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(profileKey);
  window.localStorage.removeItem(progressKey);
}
