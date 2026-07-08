"use client";

import Link from "next/link";
import { Mission } from "@/lib/missions";
import { FEATHER_META } from "@/lib/levels";
import { Feather, Sparkles } from "lucide-react";

export function MissionCard({
  mission,
  awarded,
}: {
  mission: Mission;
  awarded?: boolean;
}) {
  const meta = FEATHER_META[mission.feather];
  return (
    <article
      className="mission-card"
      style={{
        ["--feather-color" as string]: meta.color,
        ["--feather-glow" as string]: meta.glow,
      }}
      data-awarded={awarded ? "true" : "false"}
    >
      <div className="mission-card-head">
        <span className="kicker">
          <Sparkles aria-hidden className="h-4 w-4" />
          {mission.category}
        </span>
        <span className="mission-feather">
          <Feather aria-hidden className="h-4 w-4" />
          {meta.name}
        </span>
      </div>
      <h2 className="mission-prompt h-display">{mission.prompt}</h2>
      {mission.helper ? <p className="mission-helper">{mission.helper}</p> : null}
      <div className="mission-card-foot">
        <span className="mission-pop">+{mission.featherPop} FeatherPop</span>
        <span className="mission-approval">
          {mission.approval === "parent" ? "Grown-up approves" : "You decide"}
        </span>
      </div>
    </article>
  );
}

export function MissionEmpty() {
  return (
    <div className="mission-card mission-card-empty">
      <h2 className="h-display">No active child yet</h2>
      <p>Sign in and pick a child profile to start collecting feathers.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/sign-in" className="btn btn-sky btn-sm">
          Sign in
        </Link>
        <Link href="/account/profiles" className="btn btn-ghost btn-sm">
          Manage profiles
        </Link>
      </div>
    </div>
  );
}
