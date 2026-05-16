"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type MascotMood =
  | "idle"
  | "think"
  | "cheer"
  | "wow"
  | "oops"
  | "hint";

const MESSAGES: Record<MascotMood, string[]> = {
  idle: [
    "Tap a letter to start spelling!",
    "You can do this, Word Explorer!",
    "Listen for the letter sound as you tap.",
  ],
  think: [
    "Hmm, look at the letters carefully…",
    "Try moving them in a new order.",
    "Read the slots out loud!",
  ],
  hint: [
    "Need a clue? Use the hint button!",
    "Here's a tip — sound it out slowly.",
    "Each letter makes a sound. Mix them!",
  ],
  oops: [
    "Almost! Try a different letter.",
    "Don't give up — you've got this!",
    "Oops! Tap a slot to remove a letter.",
    "Let's try again, friend!",
  ],
  cheer: [
    "Woohoo! You did it!",
    "Amazing spelling!",
    "Word Champion in the house!",
    "FeatherPop earned!",
  ],
  wow: [
    "Bonus word! Brilliant!",
    "Wow — you found a hidden word!",
    "Extra FeatherPop for you!",
  ],
};

const POSE: Record<MascotMood, { src: string; tilt: number; bob: string }> = {
  idle:  { src: "/media/hero-portrait-1.jpeg", tilt: -2, bob: "mascot-bob" },
  think: { src: "/media/hero-portrait-1.jpeg", tilt:  4, bob: "mascot-tilt" },
  hint:  { src: "/media/hero-portrait-1.jpeg", tilt: -4, bob: "mascot-bob" },
  oops:  { src: "/media/hero-portrait-1.jpeg", tilt: -8, bob: "mascot-shake" },
  cheer: { src: "/media/hero-portrait-1.jpeg", tilt:  0, bob: "mascot-cheer" },
  wow:   { src: "/media/hero-portrait-1.jpeg", tilt:  6, bob: "mascot-cheer" },
};

const FALLBACK_PORTRAIT_2 = "/media/hero-portrait-2.jpeg";

export function Mascot({
  mood,
  message,
  nudge,
}: {
  mood: MascotMood;
  /** Optional explicit message; otherwise rotates through preset lines. */
  message?: string;
  /** When this number changes, the mascot replays its bubble + animation. */
  nudge?: number;
}) {
  const [line, setLine] = useState(message ?? MESSAGES[mood][0]);
  const [usePose2, setUsePose2] = useState(false);

  useEffect(() => {
    // alternate the portrait so the mascot feels alive between nudges
    setUsePose2((v) => !v);
    if (message) {
      setLine(message);
      return;
    }
    const opts = MESSAGES[mood];
    setLine(opts[Math.floor(Math.random() * opts.length)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood, message, nudge]);

  const pose = POSE[mood];
  const src = usePose2 && mood === "cheer" ? FALLBACK_PORTRAIT_2 : pose.src;

  return (
    <div className="mascot" data-mood={mood}>
      <div className="mascot-bubble" key={`${mood}-${nudge ?? 0}`}>
        <p>{line}</p>
        <span className="mascot-bubble-tail" aria-hidden />
      </div>
      <div
        className={`mascot-figure ${pose.bob}`}
        style={{ transform: `rotate(${pose.tilt}deg)` }}
      >
        <Image
          src={src}
          alt="Ms. Feather Pop mascot"
          width={140}
          height={180}
          priority
        />
      </div>
    </div>
  );
}
