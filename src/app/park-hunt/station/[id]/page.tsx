import { redirect } from "next/navigation";
import { STATION_COUNT, dailyStations, weekKey } from "@/lib/park-hunt";
import { getGlobalWordBank } from "@/lib/global-content";
import { readPlayGate } from "@/lib/play-limits";
import { StationGrid } from "@/components/park-hunt/StationGrid";

export const metadata = { title: "Park Hunt — Station" };
export const dynamic = "force-dynamic";

export default async function StationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ word?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const raw = parseInt(id, 10);
  if (!Number.isFinite(raw) || raw < 1 || raw > STATION_COUNT) {
    redirect("/park-hunt");
  }
  const stationId = raw - 1; // 0-indexed internally

  // The eagle's word comes from the URL — the single source of truth carried
  // all the way from Feather Match. We just check, live, whether it's in this
  // station's list.
  const word = (sp.word ?? "").toUpperCase().replace(/[^A-Z]/g, "") || null;
  const [bank, gate] = await Promise.all([
    getGlobalWordBank(),
    readPlayGate("parkhunt").catch(() => ({
      isMember: false,
      remaining: 3,
      locked: false,
    })),
  ]);
  const list = dailyStations(weekKey(), bank).stations[stationId] ?? [];
  const matches = Boolean(word) && list.includes(word as string);

  return (
    <main className="page parkhunt-page">
      <StationGrid
        stationId={stationId}
        word={word}
        matchesStation={matches}
        locked={gate.locked}
      />
    </main>
  );
}
