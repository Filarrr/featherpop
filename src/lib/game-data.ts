// Default game content. Admin can override via localStorage CRUD (lib/admin-store.ts).

export type Challenge = {
  id: string;
  slug: string;
  qrLabel: string;
  mainLetter: string;
  /** All visible letter tiles. Should include the target word's letters
   *  PLUS optional distractor letters (so 7-letter words can have a 9-tile
   *  bank that makes the puzzle feel like a real word hunt). */
  letters: string[];
  targetWord: string;
  bonusWords: string[];
  hint: string;
  featherpopValue: number;
  zone: string;
  /** Optional per-quest intro video. Played once when the QR is scanned,
   *  before the Reveal phase. Drop the file in /public/media/intros/ */
  introVideoUrl?: string;
  active: boolean;
  /** If true, only paid members can play this quest. Free users see a lock. */
  memberOnly?: boolean;
};

export type Reward = {
  id: string;
  name: string;
  featherpopRequired: number;
  type: "park" | "home" | "event";
  description: string;
  active: boolean;
  /** Members-only cosmetic tier (still earned with FeatherPop). */
  memberOnly?: boolean;
  /** If true, members can print a certificate/sticker for this reward. */
  printable?: boolean;
};

export type MediaItem = { id: string; title: string; url: string };

export const appBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://play.msfeatherpop.com";

/** Helper: build a letter bank from a target word + extra distractors. */
function bank(word: string, extras: string): string[] {
  return [...word.split(""), ...extras.split("")];
}

export const defaultChallenges: Challenge[] = [
  {
    id: "qr-feather",
    slug: "feather",
    qrLabel: "QR · F",
    mainLetter: "F",
    letters: bank("FEATHER", "OSL"),
    targetWord: "FEATHER",
    bonusWords: ["HEAT", "EAT", "FAT", "HAT", "TEA", "FEAT", "FATE", "HEART"],
    hint: "Soft and light — a bird wears lots of these.",
    featherpopValue: 4,
    zone: "Feather Forest",
    introVideoUrl: "/media/intros/feather.mp4",
    active: true,
  },
  {
    id: "qr-rainbow",
    slug: "rainbow",
    qrLabel: "QR · R",
    mainLetter: "R",
    letters: bank("RAINBOW", "STD"),
    targetWord: "RAINBOW",
    bonusWords: ["RAIN", "BOW", "BAR", "WIN", "BORN", "BARN", "BRAIN"],
    hint: "Colors in the sky after the rain.",
    featherpopValue: 4,
    zone: "Sky Stage",
    introVideoUrl: "/media/intros/rainbow.mp4",
    active: true,
  },
  {
    id: "qr-explore",
    slug: "explore",
    qrLabel: "QR · E",
    mainLetter: "E",
    letters: bank("EXPLORE", "TAI"),
    targetWord: "EXPLORE",
    bonusWords: ["LORE", "ROPE", "POLE", "PEER", "PEEL", "POOR"],
    hint: "To go on an adventure and discover things.",
    featherpopValue: 5,
    zone: "Adventure Trail",
    introVideoUrl: "/media/intros/explore.mp4",
    active: true,
    memberOnly: true,
  },
  {
    id: "qr-balloon",
    slug: "balloon",
    qrLabel: "QR · B",
    mainLetter: "B",
    letters: bank("BALLOON", "PSE"),
    targetWord: "BALLOON",
    bonusWords: ["BALL", "BOON", "LOAN", "BONE", "ALL", "LOON"],
    hint: "It floats up high when you let it go.",
    featherpopValue: 4,
    zone: "Pop Park",
    introVideoUrl: "/media/intros/balloon.mp4",
    active: true,
    memberOnly: true,
  },
  {
    id: "qr-sparkle",
    slug: "sparkle",
    qrLabel: "QR · S",
    mainLetter: "S",
    letters: bank("SPARKLE", "OIN"),
    targetWord: "SPARKLE",
    bonusWords: ["SPARK", "PARK", "LEAP", "PEAR", "REAL", "SEAL"],
    hint: "Glittery and shiny like a tiny star.",
    featherpopValue: 5,
    zone: "Star Stage",
    introVideoUrl: "/media/intros/sparkle.mp4",
    active: true,
    memberOnly: true,
  },
  {
    id: "qr-journey",
    slug: "journey",
    qrLabel: "QR · J",
    mainLetter: "J",
    letters: bank("JOURNEY", "SAB"),
    targetWord: "JOURNEY",
    bonusWords: ["JOY", "YOUR", "JURY", "YEAR", "ONE", "SOON"],
    hint: "A big trip from one place to another.",
    featherpopValue: 5,
    zone: "Adventure Trail",
    introVideoUrl: "/media/intros/journey.mp4",
    active: true,
    memberOnly: true,
  },
  {
    id: "qr-book",
    slug: "book",
    qrLabel: "QR · B",
    mainLetter: "B",
    letters: bank("BOOK", "SE"),
    targetWord: "BOOK",
    bonusWords: ["BOO", "SEE"],
    hint: "Something you read.",
    featherpopValue: 2,
    zone: "Reading Nest",
    introVideoUrl: "/media/intros/book.mp4",
    active: true,
  },
];

export const defaultRewards: Reward[] = [
  {
    id: "sticker",
    name: "Feather Sticker",
    featherpopRequired: 4,
    type: "event",
    description: "A shiny Ms. Feather Pop sticker for your first quest.",
    active: true,
    printable: true,
  },
  {
    id: "bookmark",
    name: "Quest Bookmark",
    featherpopRequired: 10,
    type: "home",
    description: "A printable bookmark to keep your reading on track.",
    active: true,
    printable: true,
  },
  {
    id: "patch",
    name: "Word Champion Patch",
    featherpopRequired: 20,
    type: "event",
    description: "An iron-on patch for backpacks and jackets.",
    active: true,
    printable: true,
  },
  {
    id: "glitter-badge",
    name: "Glitter Feather Badge",
    featherpopRequired: 30,
    type: "event",
    description: "Members-only glitter badge — print, peel, wear.",
    active: true,
    memberOnly: true,
    printable: true,
  },
  {
    id: "gold-frame",
    name: "Gold Avatar Frame",
    featherpopRequired: 50,
    type: "home",
    description: "Members-only gold frame around your kid avatar.",
    active: true,
    memberOnly: true,
  },
];

export function getQuestUrl(slug: string) {
  return `${appBaseUrl}/quest/${slug}`;
}
