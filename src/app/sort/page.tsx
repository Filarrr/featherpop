import { FeatherSortGameClient } from "@/components/sort/FeatherSortGameClient";
import { PlayLimitGate } from "@/components/PlayLimitGate";
import { readPlayGate } from "@/lib/play-limits";

export const dynamic = "force-dynamic";
export const metadata = { title: "Feather Sort" };

export default async function SortPage() {
  const gate = await readPlayGate("sort").catch(() => ({
    isMember: false,
    remaining: 3,
    locked: false,
  }));
  return (
    <PlayLimitGate game="sort" gameLabel="Feather Match" initialLocked={gate.locked}>
      <main className="page sort-page">
        <FeatherSortGameClient />
      </main>
    </PlayLimitGate>
  );
}
