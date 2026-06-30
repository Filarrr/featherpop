import { resolveActiveChild } from "@/lib/active-child-server";
import { ParkHuntStage } from "@/components/park-hunt/ParkHuntStage";

export const metadata = { title: "Park Hunt" };
export const dynamic = "force-dynamic";

/**
 * The eagle's word is carried in the URL (?word=...), set by Feather Match.
 * No stored target, no metadata read/write here — that's what kept getting
 * clobbered. If there's no word, ParkHuntStage tells the child to play
 * Feather Match.
 */
export default async function ParkHuntPage({
  searchParams,
}: {
  searchParams: Promise<{ word?: string }>;
}) {
  const sp = await searchParams;
  const word = (sp.word ?? "").toUpperCase().replace(/[^A-Z]/g, "") || null;

  const { activeChildId, active } = await resolveActiveChild().catch(() => ({
    activeChildId: null,
    active: null,
    children: [],
  }));

  return (
    <main className="page parkhunt-page">
      <ParkHuntStage
        word={word}
        hasActiveChild={Boolean(activeChildId)}
        activeNickname={active?.nickname ?? null}
      />
    </main>
  );
}
