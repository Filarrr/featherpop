"use client";

import nextDynamic from "next/dynamic";

// Client-only — MissionRunner picks a mission synchronously in its useState
// initializer when it mounts in the browser. Skipping SSR removes the
// loading-dots frame entirely and rules out hydration mismatches from
// Math.random() / Date.now() in the picker seed.
const MissionRunner = nextDynamic(
  () => import("@/components/MissionRunner").then((m) => m.MissionRunner),
  {
    ssr: false,
    loading: () => (
      <div className="mission-runner">
        <div className="mission-runner-loading" aria-busy>
          <span />
          <span />
          <span />
          <p>Opening the portal…</p>
        </div>
      </div>
    ),
  },
);

export function MissionRunnerClient({
  slug,
  missionId,
}: {
  slug: string;
  missionId?: string;
}) {
  return <MissionRunner slug={slug} missionId={missionId} />;
}
