"use client";

import { AnimatedAvatar } from "@/components/AnimatedAvatar";

export type KidKind = "ari" | "bee" | "kai" | "lila" | "mo" | "zara";
export type KidPose = "idle" | "wave" | "cheer" | "read" | "jump";

const LABEL: Record<KidKind, string> = {
  ari: "Ari",
  bee: "Bee",
  kai: "Kai",
  lila: "Lila",
  mo: "Mo",
  zara: "Zara",
};

export const ALL_KIDS: KidKind[] = ["ari", "bee", "kai", "lila", "mo", "zara"];

/**
 * Kid avatar. Renders first asset that exists at:
 *   /media/avatars/kid-<kind>-<pose>.mp4   ← animated video
 *   /media/avatars/kid-<kind>-<pose>.png   ← static (current)
 * Rides on top of the CSS keyframe animations (bob / cheer / jump / wave).
 */
export function KidAvatar({
  kid,
  pose = "idle",
  size = 88,
  delay = 0,
}: {
  kid: KidKind;
  pose?: KidPose;
  size?: number;
  delay?: number;
}) {
  const w = size;
  const h = Math.round(size * 1.4);
  return (
    <div
      className={`kid kid-${kid} kid-pose-${pose}`}
      style={{ width: w, height: h, animationDelay: `${delay}ms` }}
    >
      <AnimatedAvatar
        baseSrc={`/media/avatars/kid-${kid}-${pose}`}
        width={w}
        height={h}
        alt={`${LABEL[kid]} kid avatar`}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

/** Row of staggered kid avatars — used to dress up cards and reward bursts. */
export function KidRow({
  kids = ALL_KIDS,
  pose = "wave",
  size = 64,
}: {
  kids?: KidKind[];
  pose?: KidPose;
  size?: number;
}) {
  return (
    <div className="kid-row">
      {kids.map((k, i) => (
        <KidAvatar key={k} kid={k} pose={pose} size={size} delay={i * 120} />
      ))}
    </div>
  );
}
