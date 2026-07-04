"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import type { HatchedCharacter, HatchedEntry, EggColor } from "@/lib/child-profile";
import { Confetti } from "@/components/Confetti";
import { childCheer, eagleVoice, fanfare, pop, wordReveal } from "@/lib/audio";

const CHARACTER_META: Record<
  HatchedCharacter,
  { name: string; rarity: "common" | "rare" | "ultra"; emoji: string; tag: string }
> = {
  "baby-eagle":      { name: "Baby Eagle",      rarity: "common", emoji: "🦅", tag: "Brave little flier" },
  "baby-peacock":    { name: "Baby Peacock",    rarity: "common", emoji: "🦚", tag: "Fancy feathers" },
  "baby-bunny":      { name: "Baby Bunny",      rarity: "common", emoji: "🐰", tag: "Hop hop hop!" },
  "baby-butterfly":  { name: "Baby Butterfly",  rarity: "common", emoji: "🦋", tag: "Wings of color" },
  "rainbow-peacock": { name: "Rainbow Peacock", rarity: "rare",   emoji: "🌈", tag: "Rare rainbow!" },
  "feather-dragon":  { name: "Feather Dragon",  rarity: "rare",   emoji: "🐉", tag: "Mythical & magic" },
  "sparkle-unicorn": { name: "Sparkle Unicorn", rarity: "rare",   emoji: "🦄", tag: "Sparkle magic!" },
  "golden-eagle":    { name: "GOLDEN EAGLE",    rarity: "ultra",  emoji: "👑", tag: "ULTRA RARE!" },
};

const COLOR_HEX: Record<EggColor, string> = {
  purple:  "#a86bff",
  blue:    "#7ad3ff",
  pink:    "#ff7ab8",
  gold:    "#ffd14a",
  rainbow: "#b13bff", // primary; rainbow rendered via gradient
  silver:  "#cfd6e6",
};

export function EggHatchReveal({
  hatched,
  onClose,
}: {
  hatched: HatchedEntry;
  onClose: () => void;
}) {
  const meta = CHARACTER_META[hatched.character];
  const color = COLOR_HEX[hatched.color];

  // AI-generated hatch clip at public/media/eggs/egg-hatch.mp4. We render it
  // directly (no pre-probe, which was unreliable) and only fall back to the
  // CSS shell-crack animation if the video genuinely fails to load. The clip
  // is egg + crack + sparkle only; the character emoji is overlaid on top.
  const [hatchVideo, setHatchVideo] = useState<string | null>(
    "/media/eggs/egg-hatch.mp4",
  );

  useEffect(() => {
    pop();
    window.setTimeout(() => wordReveal(), 200);
    window.setTimeout(() => fanfare(), 800);
    if (meta.rarity === "ultra") {
      window.setTimeout(() => eagleVoice(), 1400);
    }
    window.setTimeout(() => childCheer(), 1800);
  }, [meta.rarity]);

  return (
    <div className="egg-hatch" role="dialog" aria-labelledby="egg-hatch-title">
      <Confetti trigger={Date.now()} pieces={80} />
      <div className={`egg-hatch-rays is-${meta.rarity}`} aria-hidden />
      <div className={`egg-hatch-card is-${meta.rarity}`} style={{ ["--egg" as string]: color }}>
        <button
          type="button"
          className="egg-hatch-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X aria-hidden className="h-5 w-5" />
        </button>
        <p className="egg-hatch-kicker">
          <Sparkles aria-hidden className="h-4 w-4" />
          Your egg hatched!
        </p>
        <div className="egg-hatch-art">
          {hatchVideo ? (
            <>
              <span className="egg-hatch-video-glow" aria-hidden />
              <video
                className="egg-hatch-video"
                autoPlay
                muted
                playsInline
                preload="auto"
                onError={() => setHatchVideo(null)}
                src={hatchVideo}
              />
              <span className="egg-hatch-creature over-video" aria-hidden>
                {meta.emoji}
              </span>
            </>
          ) : (
            <>
              <span className="egg-hatch-glow" aria-hidden />
              <span className="egg-hatch-creature" aria-hidden>{meta.emoji}</span>
              <span className="egg-hatch-shell-bottom" aria-hidden />
              <span className="egg-hatch-shell-top" aria-hidden />
            </>
          )}
        </div>
        <h2 id="egg-hatch-title" className={`egg-hatch-name is-${meta.rarity}`}>
          {meta.name}
        </h2>
        <p className="egg-hatch-tag">{meta.tag}</p>
        <p className="egg-hatch-meta">
          From a <strong style={{ color }}>{hatched.color}</strong> egg ·
          {" "}{hatched.wordsRead} words read · +1 free spin earned
        </p>
        <button type="button" onClick={onClose} className="btn btn-gold btn-lg btn-pulse">
          Awesome — keep reading!
        </button>
      </div>
    </div>
  );
}
