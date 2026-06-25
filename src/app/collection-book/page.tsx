import Link from "next/link";
import { Home, Sparkles } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { getActiveChildId } from "@/lib/active-child-server";
import { defaultChildProgress, type HatchedCharacter, type EggColor } from "@/lib/child-profile";

export const metadata = { title: "Magical Friend Collection" };
export const dynamic = "force-dynamic";

const CHARACTER_META: Record<
  HatchedCharacter,
  { name: string; rarity: "common" | "rare" | "ultra"; emoji: string; tag: string }
> = {
  "baby-eagle":      { name: "Baby Eagle",      rarity: "common", emoji: "🦅", tag: "Brave little flier" },
  "baby-peacock":    { name: "Baby Peacock",    rarity: "common", emoji: "🦚", tag: "Fancy feathers" },
  "baby-bunny":      { name: "Baby Bunny",      rarity: "common", emoji: "🐰", tag: "Hop hop hop!" },
  "baby-butterfly":  { name: "Baby Butterfly",  rarity: "common", emoji: "🦋", tag: "Wings of color" },
  "rainbow-peacock": { name: "Rainbow Peacock", rarity: "rare",   emoji: "🌈", tag: "Rare rainbow!" },
  "feather-dragon":  { name: "Feather Dragon",  rarity: "rare",   emoji: "🐉", tag: "Mythical & magic" },
  "sparkle-unicorn": { name: "Sparkle Unicorn", rarity: "rare",   emoji: "🦄", tag: "Sparkle magic!" },
  "golden-eagle":    { name: "Golden Eagle",    rarity: "ultra",  emoji: "👑", tag: "ULTRA RARE!" },
};

const COLOR_HEX: Record<EggColor, string> = {
  purple:  "#a86bff",
  blue:    "#7ad3ff",
  pink:    "#ff7ab8",
  gold:    "#ffd14a",
  rainbow: "#b13bff",
  silver:  "#cfd6e6",
};

const ALL_CHARACTERS: HatchedCharacter[] = [
  "baby-eagle",
  "baby-peacock",
  "baby-bunny",
  "baby-butterfly",
  "rainbow-peacock",
  "feather-dragon",
  "sparkle-unicorn",
  "golden-eagle",
];

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default async function CollectionBookPage() {
  const childId = await getActiveChildId();
  const user = await currentUser();
  const meta = (user?.privateMetadata ?? {}) as Record<string, unknown>;
  const map = (meta.childProgress ?? {}) as Record<string, typeof defaultChildProgress>;
  const progress = childId ? map[childId] ?? defaultChildProgress : defaultChildProgress;
  const hatched = progress.hatched ?? [];

  // Build per-character index of first-hatched entries.
  const firstByChar = new Map<HatchedCharacter, typeof hatched[number]>();
  for (const entry of hatched.slice().reverse()) {
    // reverse so the OLDEST hatch wins (the "first time you got this")
    if (!firstByChar.has(entry.character)) {
      firstByChar.set(entry.character, entry);
    }
  }

  const totalSpecies = ALL_CHARACTERS.length;
  const ownedSpecies = firstByChar.size;
  const pct = Math.round((ownedSpecies / totalSpecies) * 100);

  return (
    <main className="page collection-book-page">
      <header className="collection-book-head">
        <Link href="/" className="prizes-back-v2" aria-label="Home">
          <span aria-hidden>←</span>
        </Link>
        <div className="collection-book-head-mid">
          <span className="prizes-eyebrow">
            <Sparkles aria-hidden className="h-4 w-4" />
            Magical Collection Book
          </span>
          <h1 className="collection-book-title">My Hatched Friends</h1>
          <p className="collection-book-sub">
            <strong>{ownedSpecies}</strong> / {totalSpecies} characters discovered
          </p>
        </div>
        <Link href="/collection" className="prizes-back-v2" aria-label="Featherverse Deck">
          <Home aria-hidden className="h-5 w-5" />
        </Link>
      </header>

      <section className="collection-book-progress">
        <div className="collection-book-bar" aria-hidden>
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="collection-book-progress-label">
          Read more words → hatch more friends. The Golden Eagle is the rarest of them all.
        </p>
      </section>

      <section className="collection-book-grid">
        {ALL_CHARACTERS.map((c) => {
          const meta = CHARACTER_META[c];
          const entry = firstByChar.get(c);
          const earned = !!entry;
          const dupeCount = hatched.filter((h) => h.character === c).length;
          return (
            <article
              key={c}
              className={`collection-book-card rarity-${meta.rarity} ${earned ? "is-earned" : "is-locked"}`}
            >
              {earned && dupeCount > 1 ? (
                <span className="collection-book-dupe" aria-label={`Hatched ${dupeCount} times`}>
                  ×{dupeCount}
                </span>
              ) : null}

              <div className="collection-book-art" aria-hidden>
                <span className="collection-book-emoji">
                  {earned ? meta.emoji : "❓"}
                </span>
                <span
                  className="collection-book-egg-shell"
                  style={{ background: entry ? COLOR_HEX[entry.color] : "#dcd6e8" }}
                />
              </div>

              <h2 className="collection-book-name">
                {earned ? meta.name : `??? (${meta.rarity})`}
              </h2>
              <p className="collection-book-tag">{earned ? meta.tag : "Not yet hatched"}</p>

              {earned ? (
                <dl className="collection-book-meta">
                  <div>
                    <dt>Unlocked</dt>
                    <dd>{formatDate(entry!.hatchedAt)}</dd>
                  </div>
                  <div>
                    <dt>Words read</dt>
                    <dd>{entry!.wordsRead}</dd>
                  </div>
                  <div>
                    <dt>From egg</dt>
                    <dd style={{ color: COLOR_HEX[entry!.color] }}>{entry!.color}</dd>
                  </div>
                </dl>
              ) : (
                <p className="collection-book-locked-hint">
                  Keep reading words to hatch this one!
                </p>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
