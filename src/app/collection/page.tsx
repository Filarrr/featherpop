import Link from "next/link";
import { Home, Sparkles } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { getActiveChildId } from "@/lib/active-child-server";
import { defaultChildProgress } from "@/lib/child-profile";
import { CARD_DECK } from "@/lib/prize-library";
import { CharacterCard } from "@/components/prizes/CharacterCard";

export const metadata = { title: "My Collection" };
export const dynamic = "force-dynamic";

export default async function CollectionPage() {
  const childId = await getActiveChildId();
  const user = await currentUser();
  const meta = (user?.privateMetadata ?? {}) as Record<string, unknown>;
  const map = (meta.childProgress ?? {}) as Record<string, typeof defaultChildProgress>;
  const progress = childId ? map[childId] ?? defaultChildProgress : defaultChildProgress;
  const owned = progress.ownedCards ?? {};

  const totalCards = CARD_DECK.length;
  const ownedCount = Object.keys(owned).filter((id) => (owned[id] ?? 0) > 0).length;
  const pct = Math.round((ownedCount / totalCards) * 100);

  // Tally by rarity
  const rarityCount: Record<string, { owned: number; total: number }> = {
    common: { owned: 0, total: 0 },
    rare: { owned: 0, total: 0 },
    epic: { owned: 0, total: 0 },
    legendary: { owned: 0, total: 0 },
  };
  for (const card of CARD_DECK) {
    rarityCount[card.rarity].total++;
    if ((owned[card.id] ?? 0) > 0) rarityCount[card.rarity].owned++;
  }

  return (
    <main className="page collection-page">
      <header className="collection-head">
        <Link href="/" className="prizes-back-v2" aria-label="Home">
          <span aria-hidden>←</span>
        </Link>
        <div className="collection-head-mid">
          <span className="prizes-eyebrow">
            <Sparkles aria-hidden className="h-4 w-4" />
            Featherverse Deck
          </span>
          <h1 className="collection-title">My Collection</h1>
          <p className="collection-sub">
            <strong>{ownedCount}</strong> / {totalCards} characters discovered
          </p>
        </div>
        <Link href="/rewards" className="prizes-back-v2" aria-label="Prizes">
          <Home aria-hidden className="h-5 w-5" />
        </Link>
      </header>

      <section className="collection-progress">
        <div className="collection-bar" aria-hidden>
          <span style={{ width: `${pct}%` }} />
        </div>
        <div className="collection-rarity-grid">
          {(["common", "rare", "epic", "legendary"] as const).map((r) => (
            <div key={r} className={`collection-rarity rarity-${r}`}>
              <span className="collection-rarity-label">{r}</span>
              <span className="collection-rarity-count">
                {rarityCount[r].owned} / {rarityCount[r].total}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="collection-grid">
        {CARD_DECK.map((card) => {
          const count = owned[card.id] ?? 0;
          const has = count > 0;
          return (
            <div key={card.id} className="collection-slot">
              <CharacterCard
                card={card}
                count={has ? count : undefined}
                locked={!has}
              />
            </div>
          );
        })}
      </section>
    </main>
  );
}
