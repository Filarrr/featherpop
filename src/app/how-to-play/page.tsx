import Link from "next/link";
import { ArrowRight, Camera, Feather, Sparkles, Trophy } from "lucide-react";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";

const steps = [
  {
    title: "1. Scan",
    text: "Point the phone camera at any Ms. Feather Pop QR code.",
    icon: Camera,
    color: "var(--sky-4)",
  },
  {
    title: "2. Mission appears",
    text: "Each scan reveals one short adventure — find, move, or be kind.",
    icon: Sparkles,
    color: "var(--gold)",
  },
  {
    title: "3. Do it",
    text: "Some missions you decide yourself; tougher ones need a grown-up's PIN.",
    icon: Feather,
    color: "var(--magenta)",
  },
  {
    title: "4. Earn feathers",
    text: "Every mission gives one magical feather + FeatherPop you can spend.",
    icon: Trophy,
    color: "var(--purple)",
  },
];

export default function HowToPlayPage() {
  return (
    <main className="page">
      <header className="mb-6">
        <span className="kicker">Game guide</span>
        <h1 className="h-display mt-2 text-4xl md:text-5xl">
          <span className="h-gradient">How it works</span>
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">
          Four simple steps. Designed for kids ages 3–11, with grown-up
          supervision for younger players.
        </p>
      </header>

      <section className="hero-portrait mb-6">
        <div className="fp-stage">
          <MsFeatherPopAvatar pose="wave" size={220} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <article key={s.title} className="card">
              <div
                className="icon-bubble"
                style={{ background: s.color }}
              >
                <Icon aria-hidden className="h-5 w-5" />
              </div>
              <h3 className="h-display mt-2 text-xl">{s.title}</h3>
              <p className="text-[var(--ink-soft)]">{s.text}</p>
            </article>
          );
        })}
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/scan" className="btn btn-primary">
          <Camera aria-hidden className="h-5 w-5" />
          Open scanner
          <ArrowRight aria-hidden className="h-5 w-5" />
        </Link>
        <Link href="/" className="btn btn-ghost">
          Back home
        </Link>
      </div>
    </main>
  );
}
