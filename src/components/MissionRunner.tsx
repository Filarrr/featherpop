"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Home, RefreshCw, Sparkles } from "lucide-react";
import { Mission, getMission, pickRandomMission } from "@/lib/missions";
import { recentMissionIds } from "@/lib/child-profile";
import { applyMissionRewardAction } from "@/lib/child-progress-actions";
import { FEATHER_META } from "@/lib/levels";
import { Mascot, MascotMood } from "@/components/Mascot";
import { MissionCard, MissionEmpty } from "@/components/MissionCard";
import { ParentApprovalGate } from "@/components/ParentApprovalGate";
import { Confetti } from "@/components/Confetti";
import { FeatherAward } from "@/components/FeatherAward";
import { useActiveChild } from "@/lib/use-active-child";
import { childCheer, fanfare, pop, ding } from "@/lib/audio";

type Phase = "show" | "approval" | "celebrate" | "done";

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
  const [confettiKey, setConfettiKey] = useState(0);
  const finishingRef = useRef(false);

  // Pick a mission as soon as the component mounts on the client. We
  // intentionally don't gate on `ready` here — the active-child store can
  // fail to flip `ready=true` (storage quota / private mode / corrupt cache)
  // and leave the page stuck on "Rolling…" forever. The reward step still
  // needs activeChildId to apply, but the user can read the mission either
  // way and we re-pick if activeChildId arrives later.
  useEffect(() => {
    if (mission) return;
    if (missionId) {
      setMission(getMission(missionId) ?? pickRandomMission(slug));
      return;
    }
    const exclude = activeChildId ? recentMissionIds(activeChildId, 6) : [];
    setMission(pickRandomMission(slug, exclude));
  }, [activeChildId, slug, missionId, mission]);

  const feather = useMemo(
    () => (mission ? FEATHER_META[mission.feather] : null),
    [mission],
  );

  function reroll() {
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
    finishingRef.current = false;
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
    void finish();
  }

  async function finish() {
    if (!mission || !activeChildId || finishingRef.current) return;
    finishingRef.current = true;

    setPhase("celebrate");
    setMood(mission.featherPop >= 3 ? "wow" : "cheer");
    setMascotMessage(
      mission.featherPop >= 3
        ? `Whoa! ${FEATHER_META[mission.feather].name} unlocked!`
        : `You earned a ${FEATHER_META[mission.feather].name}!`,
    );
    setMascotNudge((n) => n + 1);
    setConfettiKey((k) => k + 1);
    ding(1100, 90);
    window.setTimeout(() => pop(), 220);
    window.setTimeout(() => childCheer(), 480);
    window.setTimeout(() => fanfare(), 720);

    try {
      const next = await applyMissionRewardAction(activeChildId, mission.id);
      setProgress(next);
    } catch {
      /* offline / unauthed — keep optimistic UI */
    }

    window.setTimeout(() => setPhase("done"), 1800);
  }

  // Only block on "no active child" when the store has confirmed it. If
  // `ready` is stuck (storage issues) we still render the card and let the
  // reward step gate gracefully.
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
        <div className="mission-runner-loading" aria-busy>
          <span />
          <span />
          <span />
          <p>Rolling a mission…</p>
        </div>
      </div>
    );
  }

  const isCelebrating = phase === "celebrate" || phase === "done";

  return (
    <div className="mission-runner">
      <Confetti trigger={confettiKey} pieces={90} />

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
      ) : isCelebrating ? (
        <FeatherAward
          feather={mission.feather}
          featherPop={mission.featherPop}
          show
        />
      ) : (
        <MissionCard mission={mission} awarded={false} />
      )}

      {phase === "done" ? (
        <div className="mission-runner-done">
          <span className="kicker" style={{ color: feather?.color }}>
            <Sparkles aria-hidden className="h-4 w-4" />
            Mission complete
          </span>
          <div className="mission-runner-actions">
            <button type="button" onClick={reroll} className="btn btn-gold btn-lg">
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
          <button
            type="button"
            onClick={startApproval}
            className="btn btn-gold btn-lg btn-pulse"
          >
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
