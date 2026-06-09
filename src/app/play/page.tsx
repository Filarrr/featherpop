import { Wordshake } from "@/components/Wordshake";

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

  return (
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
      <Wordshake keyWord={keyWord} />
    </main>
  );
}
