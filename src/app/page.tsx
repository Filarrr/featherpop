import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Feather,
  Gamepad2,
  Gift,
  HandMetal,
  Sparkles,
  Wand2,
} from "lucide-react";
import { HomeHero } from "@/components/HomeHero";
import { resolveActiveChild } from "@/lib/active-child-server";

const steps = [
  {
    title: "Sort",
    text: "Drag scattered feathers into matching nests.",
    icon: HandMetal,
    color: "var(--magenta)",
  },
  {
    title: "Hatch",
    text: "A bird flies in with a magic word for you.",
    icon: Wand2,
    color: "var(--gold)",
  },
  {
    title: "Play",
    text: "Letter Pop opens with your word as the goal.",
    icon: Gamepad2,
    color: "var(--sky-4)",
  },
  {
    title: "Earn",
    text: "FeatherPop in your wallet → real prizes.",
    icon: Gift,
    color: "var(--mint)",
  },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { children, activeChildId } = await resolveActiveChild();
  if (children.length === 0) redirect("/welcome");
  if (!activeChildId) redirect("/account/profiles");

  return (
    <main className="page">
      <HomeHero />

      <section className="mt-10">
        <div className="mb-4">
          <span className="kicker">
            <Sparkles aria-hidden className="h-4 w-4" />
            How it works
          </span>
          <h2 className="h-display mt-1 text-3xl">
            Sort → Hatch → Play → Earn
          </h2>
        </div>
        <div className="feature-row">
          {steps.map((f) => {
            const Icon = f.icon;
            return (
              <article key={f.title} className="feature-pill">
                <div className="icon-bubble" style={{ background: f.color }}>
                  <Icon aria-hidden className="h-5 w-5" />
                </div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10 quick-links">
        <Link href="/feathers" className="quick-link">
          <Feather aria-hidden className="h-5 w-5" />
          <span>
            <strong>My Feathers</strong>
            <small>See your collection</small>
          </span>
        </Link>
        <Link href="/rewards" className="quick-link">
          <Gift aria-hidden className="h-5 w-5" />
          <span>
            <strong>Prize Wall</strong>
            <small>Spend your FeatherPop</small>
          </span>
        </Link>
        <Link href="/story" className="quick-link">
          <BookOpen aria-hidden className="h-5 w-5" />
          <span>
            <strong>Story Time</strong>
            <small>Ms. Feather Pop reads to you</small>
          </span>
        </Link>
      </section>
    </main>
  );
}
