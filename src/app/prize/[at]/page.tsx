import Link from "next/link";
import { notFound } from "next/navigation";
import { Home, Printer, Sparkles } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { getActiveChildId } from "@/lib/active-child-server";
import { defaultChildProgress } from "@/lib/child-profile";
import {
  getCard,
  getColoring,
  getPuzzle,
} from "@/lib/prize-library";
import { CharacterCard } from "@/components/prizes/CharacterCard";
import { ColoringScene } from "@/components/prizes/ColoringScene";
import { WordSearch } from "@/components/prizes/WordSearch";
import { MysteryReveal } from "@/components/prizes/MysteryReveal";

export const metadata = { title: "Your Prize!" };
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ at: string }>;
}

export default async function PrizePage({ params }: RouteParams) {
  const { at } = await params;
  const atNum = parseInt(at, 10);
  if (!Number.isFinite(atNum)) notFound();

  const childId = await getActiveChildId();
  if (!childId) notFound();

  const user = await currentUser();
  if (!user) notFound();

  const meta = (user.privateMetadata ?? {}) as Record<string, unknown>;
  const map = (meta.childProgress ?? {}) as Record<string, typeof defaultChildProgress>;
  const progress = map[childId] ?? defaultChildProgress;
  const claim = (progress.claimedRewards ?? []).find((c) => c.at === atNum);
  if (!claim) notFound();

  return (
    <main className="page prize-page">
      <header className="prize-page-head">
        <Link href="/rewards" className="prizes-back-v2" aria-label="Back to prizes">
          <span aria-hidden>←</span>
        </Link>
        <div className="prize-page-head-mid">
          <span className="prizes-eyebrow">
            <Sparkles aria-hidden className="h-4 w-4" />
            You unlocked
          </span>
          <h1 className="prize-page-title">
            <span className="h-gradient">Surprise!</span>
          </h1>
        </div>
        <Link href="/" className="prizes-back-v2" aria-label="Home">
          <Home aria-hidden className="h-5 w-5" />
        </Link>
      </header>

      <PrizeBody claim={claim} />
    </main>
  );
}

interface ClaimEntry {
  id: string;
  at: number;
  cost: number;
  variantId?: string;
  variantType?: string;
  mysteryPayload?: {
    kind: string;
    variantId: string;
    bonusFeathers?: number;
    bonusSpins?: number;
  };
}

function PrizeBody({ claim }: { claim: ClaimEntry }) {
  // Mystery reward — wrap in the box-open animation and reveal the
  // resolved payload underneath.
  if (claim.id === "mystery" && claim.mysteryPayload) {
    const p = claim.mysteryPayload;
    return (
      <MysteryRevealWrapper claim={claim} />
    );
  }

  // Character card
  if (claim.variantType === "card" && claim.variantId) {
    const card = getCard(claim.variantId);
    if (!card) return <UnknownPrize />;
    return (
      <section className="prize-card-stage">
        <p className="prize-stage-sub">
          A new character has joined your deck. Visit{" "}
          <Link href="/collection" className="prize-stage-link">
            your collection
          </Link>{" "}
          to see them all.
        </p>
        <div className="prize-card-stage-card">
          <CharacterCard card={card} large />
        </div>
        <h2 className="prize-stage-name">{card.name}</h2>
        <p className="prize-stage-tagline">"{card.tagline}"</p>
        <div className="prize-stage-actions">
          <Link href="/collection" className="btn btn-gold btn-lg btn-pulse">
            <Sparkles aria-hidden className="h-5 w-5" />
            See My Collection
          </Link>
          <Link href="/rewards" className="btn btn-ghost">
            Back to prizes
          </Link>
        </div>
      </section>
    );
  }

  // Coloring page
  if (claim.variantType === "coloring" && claim.variantId) {
    const page = getColoring(claim.variantId);
    if (!page) return <UnknownPrize />;
    return (
      <section className="prize-printable-stage">
        <p className="prize-stage-sub">{page.description}</p>
        <div className="prize-printable-frame">
          <ColoringScene id={page.id} size={520} />
        </div>
        <p className="prize-printable-hint">
          🔍 Look closely — there's a hidden feather to find!
        </p>
        <div className="prize-stage-actions">
          <a
            href={`/print/coloring/${page.id}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-gold btn-lg btn-pulse"
          >
            <Printer aria-hidden className="h-5 w-5" />
            Print this page
          </a>
          <Link href="/rewards" className="btn btn-ghost">
            Back to prizes
          </Link>
        </div>
      </section>
    );
  }

  // Puzzle
  if (claim.variantType === "puzzle" && claim.variantId) {
    const puzzle = getPuzzle(claim.variantId);
    if (!puzzle) return <UnknownPrize />;
    return (
      <section className="prize-printable-stage">
        <p className="prize-stage-sub">{puzzle.description}</p>
        <div className="prize-printable-frame">
          <WordSearch id={puzzle.id} size={520} />
        </div>
        <div className="prize-stage-actions">
          <a
            href={`/print/puzzle/${puzzle.id}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-gold btn-lg btn-pulse"
          >
            <Printer aria-hidden className="h-5 w-5" />
            Print puzzle
          </a>
          <Link href="/rewards" className="btn btn-ghost">
            Back to prizes
          </Link>
        </div>
      </section>
    );
  }

  return <UnknownPrize />;
}

function MysteryRevealWrapper({ claim }: { claim: ClaimEntry }) {
  const p = claim.mysteryPayload!;
  // Build the payload label + emoji from the resolved kind.
  let label = "Mystery Reward";
  let emoji = "🎁";
  let sub: string | undefined;
  let inner: React.ReactNode = null;
  let printHref: string | null = null;

  if (p.kind === "feathers") {
    label = `+${p.bonusFeathers} Bonus Feathers`;
    emoji = "🪶";
    sub = "Already added to your wallet!";
  } else if (p.kind === "spin") {
    label = "+1 Free Spin";
    emoji = "🎡";
    sub = "Use it on the Spin Wheel.";
    inner = (
      <Link href="/spin" className="btn btn-gold btn-lg btn-pulse">
        <Sparkles aria-hidden className="h-5 w-5" />
        Go spin!
      </Link>
    );
  } else if (p.kind === "egg") {
    label = "Golden Egg";
    emoji = "🥚";
    sub = "A rare drop — ready to hatch!";
  } else if (p.kind === "card") {
    const card = getCard(p.variantId);
    label = card ? card.name : "A new character";
    emoji = card?.emoji ?? "🃏";
    sub = card ? `"${card.tagline}"` : undefined;
    inner = card ? (
      <div className="prize-card-stage-card">
        <CharacterCard card={card} large />
      </div>
    ) : null;
  } else if (p.kind === "coloring") {
    const page = getColoring(p.variantId);
    label = page ? page.title : "A coloring page";
    emoji = "🎨";
    sub = page?.description;
    if (page) printHref = `/print/coloring/${page.id}`;
    inner = page ? (
      <div className="prize-printable-frame">
        <ColoringScene id={page.id} size={420} />
      </div>
    ) : null;
  } else if (p.kind === "puzzle") {
    const puzzle = getPuzzle(p.variantId);
    label = puzzle ? puzzle.title : "A puzzle";
    emoji = "🧩";
    sub = puzzle?.description;
    if (puzzle) printHref = `/print/puzzle/${puzzle.id}`;
    inner = puzzle ? (
      <div className="prize-printable-frame">
        <WordSearch id={puzzle.id} size={420} />
      </div>
    ) : null;
  }

  return (
    <MysteryReveal payload={{ label, emoji, sub }}>
      {inner}
      <div className="prize-stage-actions">
        {printHref && (
          <a href={printHref} target="_blank" rel="noreferrer" className="btn btn-gold btn-lg btn-pulse">
            <Printer aria-hidden className="h-5 w-5" />
            Print this prize
          </a>
        )}
        <Link href="/rewards" className="btn btn-ghost">
          Back to prizes
        </Link>
      </div>
    </MysteryReveal>
  );
}

function UnknownPrize() {
  return (
    <section className="prize-card-stage">
      <h2 className="prize-stage-name">Reward claimed!</h2>
      <p className="prize-stage-tagline">
        A grown-up will help you collect this one.
      </p>
      <div className="prize-stage-actions">
        <Link href="/rewards" className="btn btn-gold btn-lg">
          Back to prizes
        </Link>
      </div>
    </section>
  );
}
