import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Camera, Feather, Gamepad2, Gift, Sparkles, Users } from "lucide-react";
import { StartQuest } from "@/components/StartQuest";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";
import { HomeStats } from "@/components/HomeStats";
import { NoActiveChildRedirect } from "@/components/NoActiveChildRedirect";
import { listChildren } from "@/app/account/profiles/actions";
import { getMembership, isMemberActive } from "@/lib/membership";

const features = [
  {
    title: "Scan",
    text: "Point the camera at a Ms. Feather Pop QR code.",
    icon: Camera,
    color: "var(--sky-4)",
  },
  {
    title: "Mission",
    text: "Each scan reveals a new short adventure.",
    icon: Sparkles,
    color: "var(--gold)",
  },
  {
    title: "Earn feathers",
    text: "Falcon, Courage, Wind, Joy — collect them all.",
    icon: Feather,
    color: "var(--magenta)",
  },
  {
    title: "Level up",
    text: "Beginner Explorer → Guardian of Strudelay.",
    icon: Gift,
    color: "var(--mint)",
  },
];

export default async function HomePage() {
  const [children, membership] = await Promise.all([
    listChildren(),
    getMembership(),
  ]);
  if (children.length === 0) {
    redirect("/welcome");
  }
  const isActive = isMemberActive(membership);
  return (
    <main className="page">
      <NoActiveChildRedirect hasChildren={children.length > 0} />
      <section className="hero">
        <div className="hero-grid">
          <div>
            <span className="kicker">
              <Sparkles aria-hidden className="h-4 w-4" />
              Random missions · Magical feathers
            </span>
            <h1 className="h-display hero-title mt-4">
              <span className="h-gradient">Ms. Feather</span>
              <br />
              <span className="h-stroke">Pop</span>
            </h1>
            <p className="hero-subtitle">
              Every QR is a portal to a new mission. Earn{" "}
              <strong style={{ color: "var(--magenta)" }}>magical feathers</strong>,
              level up, and become a Guardian of Strudelay.
            </p>
            <HomeStats />
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <StartQuest />
              <Link href="/missions" className="btn btn-sky">
                <Sparkles aria-hidden className="h-5 w-5" />
                My missions
              </Link>
              <Link href="/feathers" className="btn btn-ghost">
                <Feather aria-hidden className="h-5 w-5" />
                My feathers
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link href="/story" className="btn btn-ghost btn-sm">
                <BookOpen aria-hidden className="h-4 w-4" />
                Story time
              </Link>
              <Link href="/account/profiles" className="btn btn-ghost btn-sm">
                <Users aria-hidden className="h-4 w-4" />
                Child profiles
              </Link>
              <Link href="/play" className="btn btn-ghost btn-sm">
                <Gamepad2 aria-hidden className="h-4 w-4" />
                Letter Pop
              </Link>
            </div>
          </div>

          <div className="hero-portrait">
            <div className="fp-stage">
              <MsFeatherPopAvatar pose="wave" size={360} />
            </div>
          </div>
        </div>
      </section>

      {!isActive ? (
        <section className="membership-banner">
          <div>
            <span className="kicker">
              <Sparkles aria-hidden className="h-4 w-4" />
              Unlock the full adventure
            </span>
            <h2 className="h-display mt-1 text-2xl">
              <span className="h-gradient">Champions get more</span>
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              All 6 quest zones · Unlimited quests · Printable QR packs · Champions Battle Words
            </p>
          </div>
          <Link href="/membership" className="btn btn-gold btn-lg">
            <Sparkles aria-hidden className="h-5 w-5" />
            Join for $23.99/month
          </Link>
        </section>
      ) : null}

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="h-display text-3xl">How a mission works</h2>
        </div>
        <div className="feature-row">
          {features.map((f) => {
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
    </main>
  );
}
