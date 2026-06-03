// Daily quest counter for free-tier rate limiting. Stored in localStorage
// because the rest of player state is local-only; members bypass entirely.

const KEY = "ms-feather-pop-daily-quests";
export const FREE_DAILY_QUEST_LIMIT = 3;

type DailyState = { date: string; count: number };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function readDaily(): DailyState {
  if (typeof window === "undefined") return { date: today(), count: 0 };
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as DailyState) : null;
    if (!parsed || parsed.date !== today()) return { date: today(), count: 0 };
    return parsed;
  } catch {
    return { date: today(), count: 0 };
  }
}

export function incrementDaily(): DailyState {
  const cur = readDaily();
  const next: DailyState = { date: today(), count: cur.count + 1 };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }
  return next;
}

export function dailyRemaining(isMember: boolean): number {
  if (isMember) return Infinity;
  return Math.max(0, FREE_DAILY_QUEST_LIMIT - readDaily().count);
}
