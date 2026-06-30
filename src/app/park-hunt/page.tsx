import { auth, currentUser } from "@clerk/nextjs/server";
import { resolveActiveChild } from "@/lib/active-child-server";
import { todayKey } from "@/lib/park-hunt";
import { ParkHuntStage } from "@/components/park-hunt/ParkHuntStage";

export const metadata = { title: "Park Hunt" };
export const dynamic = "force-dynamic";

interface StoredTarget {
  date: string;
  word: string;
  stationId: number;
  foundToday?: number;
}

/**
 * READ-ONLY. Just return today's stored eagle word, if any.
 *
 * The eagle word is assigned by ONE place — Feather Match's
 * assignEagleWordAction. This page must NOT assign or write a target,
 * otherwise it races that write and can clobber the word the child just
 * earned (the "saw calm, scanned, got helper" bug). No word yet → null,
 * and ParkHuntStage tells the child to play Feather Match.
 */
async function resolveInitialTarget(
  childId: string | null,
): Promise<StoredTarget | null> {
  try {
    if (!childId) return null;
    const { userId } = await auth();
    if (!userId) return null;
    const user = await currentUser();
    if (!user) return null;

    const meta = (user.privateMetadata ?? {}) as Record<string, unknown>;
    const map = (meta.parkHunt ?? {}) as Record<string, StoredTarget>;
    const date = todayKey();
    const existing = map[childId];

    if (existing && existing.date === date) {
      return existing;
    }
    return null;
  } catch {
    return null;
  }
}

export default async function ParkHuntPage() {
  const { activeChildId, active } = await resolveActiveChild().catch(() => ({
    activeChildId: null,
    active: null,
    children: [],
  }));
  const initial = await resolveInitialTarget(activeChildId);

  return (
    <main className="page parkhunt-page">
      <ParkHuntStage
        initialTarget={
          initial
            ? {
                word: initial.word,
                stationId: initial.stationId,
                foundToday: initial.foundToday ?? 0,
              }
            : null
        }
        hasActiveChild={Boolean(activeChildId)}
        activeNickname={active?.nickname ?? null}
      />
    </main>
  );
}
