import { resolveActiveChild } from "@/lib/active-child-server";
import { getCurrentTargetAction } from "@/lib/park-hunt-actions";
import { ParkHuntStage } from "@/components/park-hunt/ParkHuntStage";

export const metadata = { title: "Park Hunt" };
export const dynamic = "force-dynamic";

export default async function ParkHuntPage() {
  // Resolve the active child + the daily target ON THE SERVER so Clerk
  // auth + cookies are guaranteed available. The client component used
  // to call getCurrentTargetAction() from useEffect, which sometimes
  // raced against client-side cookie hydration and showed 'Pick a
  // profile first' even when the active-child chip was populated.
  const { activeChildId, active } = await resolveActiveChild();
  const initial = activeChildId
    ? await getCurrentTargetAction().catch(() => null)
    : null;

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
