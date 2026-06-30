import { redirect } from "next/navigation";
import { isCorrectStationAction } from "@/lib/park-hunt-actions";
import { STATION_COUNT } from "@/lib/park-hunt";
import { StationGrid } from "@/components/park-hunt/StationGrid";

export const metadata = { title: "Park Hunt — Station" };
export const dynamic = "force-dynamic";

export default async function StationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const raw = parseInt(id, 10);
  if (!Number.isFinite(raw) || raw < 1 || raw > STATION_COUNT) redirect("/park-hunt");
  const stationId = raw - 1; // 0-indexed internally

  const check = await isCorrectStationAction(stationId);

  return (
    <main className="page parkhunt-page">
      <StationGrid
        stationId={stationId}
        hasTarget={check.hasTarget}
        matchesStation={check.matches}
        targetWord={check.targetWord}
      />
    </main>
  );
}
