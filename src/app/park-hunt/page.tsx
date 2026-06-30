import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { resolveActiveChild } from "@/lib/active-child-server";
import {
  pickTargetForChild,
  todayKey,
} from "@/lib/park-hunt";
import { getGlobalWordBank } from "@/lib/global-content";
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
 * Inline the data resolution here (instead of calling
 * getCurrentTargetAction which is marked 'use server' + calls
 * revalidatePath). Calling a server action from a server component
 * render path with revalidatePath inside it has been causing the
 * Park Hunt page to crash on production — symptom: 'Find it at the
 * park' button navigates but the page never renders.
 *
 * NB: pass childId in explicitly. resolveActiveChild() auto-selects
 * the only-child even when no cookie is set; if we relied on
 * getActiveChildId() here we'd see the chip show the kid but the
 * target picker silently bail.
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

    // Lazy-assign a fresh target for today. (Write back so subsequent
    // page hits read the same target.)
    const bank = await getGlobalWordBank();
    const next = pickTargetForChild(childId, date, bank);
    const stored: StoredTarget = {
      date,
      word: next.word,
      stationId: next.stationId,
      foundToday: 0,
    };
    try {
      const client = await clerkClient();
      const u = await client.users.getUser(userId);
      await client.users.updateUserMetadata(userId, {
        privateMetadata: {
          ...u.privateMetadata,
          parkHunt: { ...map, [childId]: stored },
        },
      });
    } catch {
      // Don't fail the page on a metadata write blip — the client
      // fallback retry will store on next interaction.
    }
    return stored;
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
