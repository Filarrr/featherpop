import type { FeatherType } from "./missions";

export const LEVELS = [
  { id: "beginner", title: "Beginner Explorer", min: 0 },
  { id: "feather-finder", title: "Feather Finder", min: 10 },
  { id: "falcon-flyer", title: "Falcon Flyer", min: 25 },
  { id: "guardian", title: "Guardian of Strudelay", min: 50 },
] as const;

export type Level = (typeof LEVELS)[number];

export function levelFor(totalFeathers: number): Level {
  let current: Level = LEVELS[0];
  for (const l of LEVELS) {
    if (totalFeathers >= l.min) current = l;
  }
  return current;
}

export function nextLevel(totalFeathers: number): Level | null {
  for (const l of LEVELS) {
    if (totalFeathers < l.min) return l;
  }
  return null;
}

export interface FeatherMeta {
  name: string;
  color: string;
  glow: string;
  description: string;
}

export const FEATHER_META: Record<FeatherType, FeatherMeta> = {
  falcon: {
    name: "Falcon Feather",
    color: "#ffb24a",
    glow: "rgba(255, 178, 74, 0.55)",
    description: "Sharp eyes. Brave heart.",
  },
  courage: {
    name: "Courage Feather",
    color: "#ff4d8a",
    glow: "rgba(255, 77, 138, 0.55)",
    description: "For trying something new.",
  },
  wind: {
    name: "Wind Feather",
    color: "#7ad3ff",
    glow: "rgba(122, 211, 255, 0.55)",
    description: "Light, swift, free.",
  },
  confidence: {
    name: "Confidence Feather",
    color: "#a76bff",
    glow: "rgba(167, 107, 255, 0.55)",
    description: "You believed in you.",
  },
  wisdom: {
    name: "Wisdom Feather",
    color: "#5ee0c8",
    glow: "rgba(94, 224, 200, 0.55)",
    description: "Smart moves earn this one.",
  },
  joy: {
    name: "Joy Feather",
    color: "#ffd24a",
    glow: "rgba(255, 210, 74, 0.55)",
    description: "Sparkle and smile collected.",
  },
};

export const FEATHER_ORDER: FeatherType[] = [
  "falcon",
  "courage",
  "wind",
  "confidence",
  "wisdom",
  "joy",
];
