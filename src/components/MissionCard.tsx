"use client";

import Link from "next/link";
import {
  Compass,
  Eye,
  Feather as FeatherIcon,
  HandHeart,
  Heart,
  Palette,
  Shapes,
  Sparkles,
  Type,
} from "lucide-react";
import { Mission, MissionCategory } from "@/lib/missions";
import { FEATHER_META } from "@/lib/levels";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";

const CATEGORY_META: Record<
  MissionCategory,
  { icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>; label: string; tint: string }
> = {
  find:        { icon: Eye,       label: "Look & Find", tint: "var(--sky-4)" },
  movement:    { icon: Compass,   label: "Move",        tint: "var(--mint)" },
  affirmation: { icon: Heart,     label: "Affirm",      tint: "var(--pink)" },
  shape:       { icon: Shapes,    label: "Shape Hunt",  tint: "var(--purple)" },
  color:       { icon: Palette,   label: "Color Hunt",  tint: "var(--gold)" },
  word:        { icon: Type,      label: "Word Play",   tint: "var(--magenta)" },
  kindness:    { icon: HandHeart, label: "Kindness",    tint: "#ff7ab8" },
};

export function MissionCard({
  mission,
  awarded,
}: {
  mission: Mission;
  awarded?: boolean;
}) {
  const meta = FEATHER_META[mission.feather];
  const cat = CATEGORY_META[mission.category];
  const Icon = cat.icon;
  return (
    <article
      className="mission-card"
      style={{
        ["--feather-color" as string]: meta.color,
        ["--feather-glow" as string]: meta.glow,
        ["--cat-tint" as string]: cat.tint,
      }}
      data-awarded={awarded ? "true" : "false"}
    >
      <div className="mission-card-head">
        <span className="mission-cat-chip">
          <Icon aria-hidden className="h-4 w-4" />
          {cat.label}
        </span>
        <span className="mission-feather">
          <FeatherIcon aria-hidden className="h-4 w-4" />
          {meta.name}
        </span>
      </div>

      <h2 className="mission-prompt h-display">{mission.prompt}</h2>
      {mission.helper ? <p className="mission-helper">{mission.helper}</p> : null}

      <div className="mission-card-foot">
        <span className="mission-pop">
          <Sparkles aria-hidden className="h-4 w-4" />
          +{mission.featherPop} FeatherPop
        </span>
        <span className="mission-approval">
          {mission.approval === "parent" ? "Grown-up approves" : "You decide"}
        </span>
      </div>
    </article>
  );
}

export function MissionEmpty() {
  return (
    <div className="empty-state empty-state-mission">
      <div className="empty-state-art">
        <MsFeatherPopAvatar pose="wave" size={140} />
      </div>
      <h2 className="h-display text-3xl">
        <span className="h-gradient">Let&apos;s meet your explorer</span>
      </h2>
      <p>
        Add a child profile and we can start collecting feathers together.
      </p>
      <div className="empty-state-actions">
        <Link href="/account/profiles" className="btn btn-gold btn-lg">
          Set up a profile
        </Link>
        <Link href="/sign-in" className="btn btn-ghost btn-sm">
          Sign in
        </Link>
      </div>
    </div>
  );
}
