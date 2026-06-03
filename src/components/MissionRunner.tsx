"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Home, RefreshCw, Sparkles } from "lucide-react";
import { Mission, getMission, pickRandomMission } from "@/lib/missions";
import { recentMissionIds } from "@/lib/child-profile";
import { applyMissionRewardAction } from "@/lib/child-progress-actions";
import { FEATHER_META } from "@/lib/levels";
import { Mascot, MascotMood } from "@/components/Mascot";
import { MissionCard, MissionEmpty } from "@/components/MissionCard";
import { ParentApprovalGate } from "@/components/ParentApprovalGate";
import { useActiveChild } from "@/lib/use-active-child";
import { childCheer, fanfare, pop } from "@/lib/audio";

type Phase = "show" | "approval" | "done";

export function MissionRunner({
  slug,
  missionId,
}: {
  slug: string;
  missionId?: string;
}) {
  const { activeChildId, ready, setProgress } = useActiveChild();
  const [mission, setMission] = useState<Mission | null>(null);
  const [phase, setPhase] = useState<Phase>("show");
  const [mood, setMood] = useState<MascotMood>("idle");
  const [mascotMessage, setMascotMessage] = useState<string | undefined>();
  const [mascotNudge, setMascotNudge] = useState(0);
  const [awardedPop, setAwardedPop] = useState(0);

  // Roll mission once child id is known. The slug seeds randomness so the same
  // QR yields different missions, while recent ids steer away from repeats.
  useEffect(() => {
    if (!ready) return;
    if (missionId) {
      setMission(getMission(missionId) ?? pickRandomMission(slug));
      return;
    }
    const exclude = activeChildId ? recentMissionIds(activeChildId, 6) : [];
    setMission(pickRandomMission(slug, exclude));
  }, [ready, activeChildId, slug, missionId]);

  const feather = useMemo(
    () => (mission ? FEATHER_META[mission.feather] : null),
    [mission],
  );

  function reroll() {
    if (!ready) return;
    const exclude = activeChildId ? recentMissionIds(activeChildId, 6) : [];
    const next = pickRandomMission(slug, [
      ...exclude,
      ...(mission ? [mission.id] : []),
    ]);
    setMission(next);
    setPhase("show");
    setMood("idle");
    setMascotMessage(undefined);
    setMascotNudge((n) => n + 1);
    setAwardedPop(0);
  }

  function startApproval() {
    if (!mission) return;
    if (mission.approval === "parent") {
      setPhase("approval");
      setMood("hint");
      setMascotMessage("Hand it to a grown-up to check!");
      setMascotNudge((n) => n + 1);
      return;
    }
    finish();
  }

  async function finish() {
    if (!mission || !activeChildId) return;
    try {
      const next = await applyMissionRewardAction(activeChildId, mission.id);
      setProgress(next);
    } catch {
      // Offline / unauthed — keep optimistic UI without server update.
    }
    pop();
    childCheer();
    fanfare();
    setAwardedPop(mission.featherPop);
    setPhase("done");
    setMood(mission.featherPop >= 3 ? "wow" : "cheer");
    setMascotMessage(`+${mission.featherPop} FeatherPop · ${FEATHER_META[mission.feather].name}!`);
    setMascotNudge((n) => n + 1);
  }

  if (ready && !activeChildId) {
    return (
      <div className="mission-runner">
        <MissionEmpty />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="mission-runner">
        <p>Rolling a mission…</p>
      </div>
    );
  }

  return (
    <div className="mission-runner">
      <div className="mission-runner-mascot">
        <Mascot mood={mood} message={mascotMessage} nudge={mascotNudge} />
      </div>

      {phase === "approval" ? (
        <ParentApprovalGate
          mission={mission}
          onApproved={finish}
          onCancel={() => {
            setPhase("show");
            setMood("idle");
            setMascotMessage(undefined);
            setMascotNudge((n) => n + 1);
          }}
        />
      ) : (
        <MissionCard mission={mission} awarded={phase === "done"} />
      )}

      {phase === "done" ? (
        <div className="mission-runner-done">
          <span className="kicker" style={{ color: feather?.color }}>
            <Sparkles aria-hidden className="h-4 w-4" />
            +{awardedPop} FeatherPop earned
          </span>
          <div className="mission-runner-actions">
            <button type="button" onClick={reroll} className="btn btn-gold">
              <RefreshCw aria-hidden className="h-5 w-5" />
              Next mission
            </button>
            <Link href="/" className="btn btn-ghost">
              <Home aria-hidden className="h-5 w-5" />
              Back home
            </Link>
          </div>
        </div>
      ) : phase === "show" ? (
        <div className="mission-runner-actions">
          <button type="button" onClick={startApproval} className="btn btn-gold btn-lg">
            {mission.approval === "parent"
              ? "Hand to a grown-up"
              : "I completed it"}
          </button>
          <button type="button" onClick={reroll} className="btn btn-ghost">
            <RefreshCw aria-hidden className="h-5 w-5" />
            Different mission
          </button>
        </div>
      ) : null}
    </div>
  );
}
