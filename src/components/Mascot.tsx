"use client";

import { useEffect, useState } from "react";
import { FeatherPopPose, MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";

export type MascotMood =
  | "idle"
  | "think"
  | "cheer"
  | "wow"
  | "oops"
  | "hint";

const MESSAGES: Record<MascotMood, string[]> = {
  idle: [
    "Ready for a feather adventure?",
    "Scan a QR — let's see what mission appears!",
    "Every brave try earns a feather.",
    "Take a deep breath. You've got this!",
  ],
  think: [
    "Hmm, look around carefully…",
    "Trust your eyes — what do you see?",
    "Slow and steady, little explorer.",
  ],
  hint: [
    "Need a hint? Read the helper line below.",
    "Try saying it out loud first.",
    "It's okay to ask a grown-up if you're stuck!",
  ],
  oops: [
    "Almost! Try once more.",
    "Don't worry — every explorer wobbles sometimes.",
    "Take another look — you can do it!",
  ],
  cheer: [
    "Wonderful! You did it!",
    "A feather just fluttered your way!",
    "That was magic — keep going!",
    "Brave heart, big smile!",
  ],
  wow: [
    "WOW! That was extra special!",
    "A whole shower of FeatherPop!",
    "You shine brighter than gold!",
  ],
};

const POSE_FOR: Record<MascotMood, { pose: FeatherPopPose; tilt: number; bob: string }> = {
  idle:  { pose: "idle",  tilt: -2, bob: "mascot-bob" },
  think: { pose: "think", tilt:  4, bob: "mascot-tilt" },
  hint:  { pose: "hint",  tilt: -4, bob: "mascot-bob" },
  oops:  { pose: "oops",  tilt: -8, bob: "mascot-shake" },
  cheer: { pose: "cheer", tilt:  0, bob: "mascot-cheer" },
  wow:   { pose: "wow",   tilt:  6, bob: "mascot-cheer" },
};

export function Mascot({
  mood,
  message,
  nudge,
  size = 120,
}: {
  mood: MascotMood;
  message?: string;
  nudge?: number;
  size?: number;
}) {
  const [line, setLine] = useState(message ?? MESSAGES[mood][0]);

  useEffect(() => {
    if (message) {
      setLine(message);
      return;
    }
    const opts = MESSAGES[mood];
    setLine(opts[Math.floor(Math.random() * opts.length)]);
  }, [mood, message, nudge]);

  const cfg = POSE_FOR[mood];

  return (
    <div className="mascot" data-mood={mood}>
      <div className="mascot-bubble" key={`${mood}-${nudge ?? 0}`}>
        <p>{line}</p>
        <span className="mascot-bubble-tail" aria-hidden />
      </div>
      <div
        className={`mascot-figure ${cfg.bob}`}
        style={{ transform: `rotate(${cfg.tilt}deg)` }}
      >
        <MsFeatherPopAvatar pose={cfg.pose} size={size} />
      </div>
    </div>
  );
}
