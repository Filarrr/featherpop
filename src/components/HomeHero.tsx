"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Camera, Feather, Sparkles } from "lucide-react";
import { useActiveChild } from "@/lib/use-active-child";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";
import { HomeStats } from "@/components/HomeStats";
import { FEATHER_META } from "@/lib/levels";

function greetingForTime(): { greeting: string; pose: "wave" | "cheer" | "idle" } {
  const h = new Date().getHours();
  if (h < 12) return { greeting: "Good morning", pose: "wave" };
  if (h < 17) return { greeting: "Hey there", pose: "cheer" };
  return { greeting: "Good evening", pose: "idle" };
}

export function HomeHero() {
  const { active, progress } = useActiveChild();
  const [greet, setGreet] = useState<{ greeting: string; pose: "wave" | "cheer" | "idle" }>({
    greeting: "Hello",
    pose: "wave",
  });

  useEffect(() => {
    setGreet(greetingForTime());
  }, []);

  const latest = progress.history[0] ?? null;
  const latestMeta = latest ? FEATHER_META[latest.feather] : null;

  return (
    <section className="hero hero-dashboard">
      <div className="hero-grid">
        <div>
          <span className="kicker">
            <Sparkles aria-hidden className="h-4 w-4" />
            {greet.greeting}
            {active ? `, ${active.nickname}` : ""}
          </span>
          <h1 className="h-display hero-title mt-2">
            <span className="h-gradient">Today&apos;s adventure</span>
            <br />
            <span className="h-stroke">awaits</span>
          </h1>
          <p className="hero-subtitle">
            Open the camera at any Ms. Feather Pop QR — earn a magical feather,
            grow your flock, and level up.
          </p>

          <HomeStats />

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/scan" className="btn btn-primary btn-lg btn-pulse">
              <Camera aria-hidden className="h-5 w-5" />
              Scan a QR
            </Link>
            <Link href="/missions" className="btn btn-sky">
              <Sparkles aria-hidden className="h-5 w-5" />
              My missions
            </Link>
            <Link href="/feathers" className="btn btn-ghost">
              <Feather aria-hidden className="h-5 w-5" />
              My feathers
            </Link>
          </div>

          {latest && latestMeta ? (
            <Link
              href="/feathers"
              className="recent-feather"
              style={{
                ["--feather-color" as string]: latestMeta.color,
                ["--feather-glow" as string]: latestMeta.glow,
              }}
            >
              <span className="recent-feather-orb" aria-hidden />
              <span className="recent-feather-text">
                <small>Latest feather</small>
                <strong>{latestMeta.name}</strong>
                <em>+{latest.featherPop} FeatherPop</em>
              </span>
            </Link>
          ) : null}
        </div>

        <div className="hero-portrait">
          <div className="fp-stage">
            <MsFeatherPopAvatar pose={greet.pose} size={360} />
            {active?.avatar ? (
              <div className="hero-child-badge" aria-hidden>
                <Image
                  src={`/media/avatars/${active.avatar}-wave.png`}
                  alt=""
                  width={84}
                  height={84}
                  unoptimized
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
