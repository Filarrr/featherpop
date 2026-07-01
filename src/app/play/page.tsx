import { Wordshake } from "@/components/Wordshake";
import { PlayLimitGate } from "@/components/PlayLimitGate";
import { readPlayGate } from "@/lib/play-limits";
import { getActiveChildProgress } from "@/lib/child-progress-actions";

export const metadata = {
  title: "Letter Pop · Side Game",
};

export const dynamic = "force-dynamic";

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ word?: string }>;
}) {
  const sp = await searchParams;
  const keyWord = (sp.word ?? "").toUpperCase().replace(/[^A-Z]/g, "") || undefined;
  const [progress, gate] = await Promise.all([
    getActiveChildProgress().catch(() => null),
    readPlayGate("letterpop").catch(() => ({
      isMember: false,
      remaining: 3,
      locked: false,
    })),
  ]);
  const initialBest = progress?.letterPopBest ?? 0;

  return (
    <PlayLimitGate game="letterpop" gameLabel="Letter Pop" initialLocked={gate.locked}>
      <main className="page">
        <header className="mb-4">
          <span className="kicker">Side game</span>
          <h1 className="h-display mt-2 text-3xl md:text-4xl">
            <span className="h-gradient">Letter Pop</span>
          </h1>
          <p className="text-sm font-semibold text-[var(--ink-soft)]">
            {keyWord
              ? `Tap connected letters to spell ${keyWord} — plus any other words you spot! 2 minutes.`
              : "Tap connected letters to build words. 2 minutes — every word earns points, and points become FeatherPop."}
          </p>
        </header>
        <Wordshake keyWord={keyWord} initialBest={initialBest} />
      </main>
    </PlayLimitGate>
  );
}
