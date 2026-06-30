// The Ms. Feather Pop "Featherverse" prize catalog.
//
// Single source of truth for every claimable thing in the rewards shop:
//   - Character cards: 26-letter alphabet deck with rarity tiers
//   - Coloring pages: printable scenes set in the Featherverse
//   - Puzzles: word search (starter), more types pluggable
//   - Mystery rewards: weighted pool of bonus drops
//
// Server actions roll a variant on claim using a small mulberry32 PRNG
// seeded by the claim timestamp + child id, so rolls are deterministic
// (same seed → same prize) but appear random to the kid.

import type { ClaimVariantType } from "./child-profile";

/* ============================================================
   Character cards (collectible deck)
   ============================================================ */

export type CardRarity = "common" | "rare" | "epic" | "legendary";

export interface CharacterCard {
  id: string;
  letter: string;       // A..Z
  name: string;         // e.g. "Bea the Brave Bee"
  tagline: string;      // 1-line description
  power: string;        // signature ability
  rarity: CardRarity;
  // Visual scheme — drives card border + glyph color
  scheme: "pink" | "blue" | "purple" | "orange" | "green" | "gold" | "teal";
  // Emoji shown as the centerpiece if no custom SVG is provided
  emoji: string;
}

export const CARD_DECK: CharacterCard[] = [
  // A — D : commons
  { id: "astor",  letter: "A", name: "Astor the Acrobat Ant",     tagline: "Tiny but mighty",      power: "Carries 10× her weight in feathers", rarity: "common", scheme: "orange", emoji: "🐜" },
  { id: "bea",    letter: "B", name: "Bea the Brave Bee",         tagline: "Buzzes for courage",   power: "Brave Buzz — wakes sleepy chicks",   rarity: "common", scheme: "gold",   emoji: "🐝" },
  { id: "coral",  letter: "C", name: "Coral the Calm Cat",        tagline: "Whispers wisdom",      power: "Cozy Purr — soothes any spider",     rarity: "common", scheme: "pink",   emoji: "🐱" },
  { id: "dewey",  letter: "D", name: "Dewey the Daring Duck",     tagline: "Splashes through rain", power: "Diving Dash — finds hidden words",  rarity: "common", scheme: "blue",   emoji: "🦆" },

  // E — H : a mix
  { id: "echo",   letter: "E", name: "Echo the Eagle's Apprentice", tagline: "Repeats every word", power: "Echo Call — every word she sees comes alive", rarity: "epic",   scheme: "gold",   emoji: "🦅" },
  { id: "flora",  letter: "F", name: "Flora the Floating Fox",    tagline: "Walks on wind",        power: "Cloud Step — leaps station to station", rarity: "rare",   scheme: "orange", emoji: "🦊" },
  { id: "gigi",   letter: "G", name: "Gigi the Giggling Giraffe", tagline: "Tall enough to read the sky", power: "Sky Spy — reveals one Park Hunt word",  rarity: "common", scheme: "purple", emoji: "🦒" },
  { id: "hattie", letter: "H", name: "Hattie the Helpful Hen",    tagline: "Always at the door",   power: "Helper's Hand — adds 10s to the timer", rarity: "common", scheme: "pink",   emoji: "🐔" },

  // I — L
  { id: "iggy",   letter: "I", name: "Iggy the Inventive Iguana", tagline: "Builds with feathers", power: "Idea Spark — turns 1 feather into 3",  rarity: "rare",   scheme: "green",  emoji: "🦎" },
  { id: "jules",  letter: "J", name: "Jules the Jolly Jaybird",   tagline: "Sings while she works", power: "Jingle Jump — bonus feather on next find", rarity: "common", scheme: "blue",  emoji: "🐦" },
  { id: "koko",   letter: "K", name: "Koko the Kind Koala",       tagline: "Sleeps in the eagle tree", power: "Kind Nap — heals 1 wrong scan",     rarity: "rare",   scheme: "purple", emoji: "🐨" },
  { id: "luna",   letter: "L", name: "Luna the Luminous Ladybug", tagline: "Glows in the dark",    power: "Light the Way — solo Park Hunt at night", rarity: "epic", scheme: "pink",  emoji: "🐞" },

  // M — P
  { id: "mona",   letter: "M", name: "Mona the Marvelous Monkey", tagline: "Swings from word to word", power: "Vine Swap — re-rolls today's target", rarity: "common", scheme: "orange", emoji: "🐵" },
  { id: "nala",   letter: "N", name: "Nala the Noble Nightingale", tagline: "Sings every letter",  power: "Night Song — unlocks a music bonus",  rarity: "rare",   scheme: "teal",   emoji: "🐦" },
  { id: "oso",    letter: "O", name: "Oso the Optimistic Owl",    tagline: "Wisdom-keeper",        power: "Owl's Eye — peeks at next 3 words",  rarity: "rare",   scheme: "gold",   emoji: "🦉" },
  { id: "pippa",  letter: "P", name: "Pippa the Polite Penguin",  tagline: "Always says please",   power: "Polite Bow — bonus feathers from helpers", rarity: "common", scheme: "blue", emoji: "🐧" },

  // Q — T
  { id: "quincy", letter: "Q", name: "Quincy the Quirky Quail",   tagline: "Knows the riddles",    power: "Quick Quip — reveals a hint",        rarity: "epic",   scheme: "purple", emoji: "🐤" },
  { id: "rio",    letter: "R", name: "Rio the Radiant Robin",     tagline: "Brings the morning",   power: "Rising Sun — doubles next Letter Pop streak", rarity: "rare",  scheme: "pink",  emoji: "🐦" },
  { id: "sammy",  letter: "S", name: "Sammy the Soaring Swan",    tagline: "Glides on starlight",  power: "Star Glide — costs no feathers",     rarity: "common", scheme: "teal",   emoji: "🦢" },
  { id: "tilly",  letter: "T", name: "Tilly the Twirling Toucan", tagline: "Beak the brightest",   power: "Tropical Twirl — confetti at every word", rarity: "common", scheme: "orange", emoji: "🦜" },

  // U — Z
  { id: "uri",    letter: "U", name: "Uri the Unique Unicorn",    tagline: "Mythic and shy",       power: "Unicorn Spark — golden feather charged", rarity: "legendary", scheme: "gold",   emoji: "🦄" },
  { id: "vera",   letter: "V", name: "Vera the Vibrant Vulture",  tagline: "Loud and proud",       power: "Victory Cry — fanfare on every find", rarity: "rare",  scheme: "purple", emoji: "🦅" },
  { id: "willa",  letter: "W", name: "Willa the Whimsical Wolf",  tagline: "Howls at the moon",    power: "Wonder Howl — wakes a sleeping egg", rarity: "rare",   scheme: "blue",   emoji: "🐺" },
  { id: "xena",   letter: "X", name: "Xena the X-Ray Tetra",      tagline: "Glows with letters",   power: "X-Ray Read — sees hidden words underwater", rarity: "legendary", scheme: "teal", emoji: "🐟" },
  { id: "yara",   letter: "Y", name: "Yara the Yodeling Yak",     tagline: "Loudest in the meadow", power: "Yodel Boost — +2 spins on next hatch", rarity: "epic", scheme: "green", emoji: "🦬" },
  { id: "zara",   letter: "Z", name: "Zara the Zesty Zebra",      tagline: "Stripes of stories",   power: "Zebra Zip — instant Park Hunt scan", rarity: "rare",   scheme: "pink",   emoji: "🦓" },
];

export function getCard(id: string): CharacterCard | undefined {
  return CARD_DECK.find((c) => c.id === id);
}

/** Rarity weights — common is the floor, legendary is precious. */
const RARITY_WEIGHTS: Record<CardRarity, number> = {
  common: 60,
  rare: 25,
  epic: 12,
  legendary: 3,
};

/** Roll a card from the deck weighted by rarity. */
export function rollCard(rand: () => number): CharacterCard {
  // Group by rarity, pick a rarity bucket by weight, then pick uniformly inside.
  const totalWeight = Object.values(RARITY_WEIGHTS).reduce((s, n) => s + n, 0);
  let ticket = rand() * totalWeight;
  let chosenRarity: CardRarity = "common";
  for (const [r, w] of Object.entries(RARITY_WEIGHTS) as [CardRarity, number][]) {
    if (ticket < w) {
      chosenRarity = r;
      break;
    }
    ticket -= w;
  }
  const bucket = CARD_DECK.filter((c) => c.rarity === chosenRarity);
  if (bucket.length === 0) return CARD_DECK[0];
  return bucket[Math.floor(rand() * bucket.length)];
}

/* ============================================================
   Coloring pages
   ============================================================ */

export interface ColoringPage {
  id: string;
  title: string;
  scheme: "pink" | "blue" | "purple" | "orange" | "green" | "gold";
  description: string;
  /** Real printable line-art image (under /media/coloring). When set, the
   *  app renders this image instead of the built-in SVG fallback. */
  image?: string;
}

// The client's own coloring-book artwork. Each is a ready-to-print line
// drawing from the Ms. Feather Pop universe.
export const COLORING_LIBRARY: ColoringPage[] = [
  { id: "rainbow-wings",    title: "Rainbow Wings",      scheme: "purple", description: "A big pair of feathered wings to fill with every color.", image: "/media/coloring/rainbow-wings.jpeg" },
  { id: "angel-wings",      title: "Feather Friend Wings", scheme: "pink",  description: "Ms. Feather Pop spreads her rainbow wings.", image: "/media/coloring/angel-wings.jpeg" },
  { id: "puppy-companion",  title: "Puppy Companion",    scheme: "gold",   description: "A happy puppy with its bone, ball, and bowl — D is for DOG!", image: "/media/coloring/puppy-companion.jpeg" },
  { id: "forest-friends",   title: "Feather Forest Friends", scheme: "green", description: "Ms. Feather Pop dances with the friendly forest spider.", image: "/media/coloring/forest-friends.jpeg" },
  { id: "playground-abc",   title: "Playground ABC",     scheme: "blue",   description: "A sunny playground with letters floating in the clouds.", image: "/media/coloring/playground-abc.jpeg" },
  { id: "popcorn-party",    title: "Popcorn Party",      scheme: "orange", description: "A giggly family popcorn night to color in.", image: "/media/coloring/popcorn-party.jpeg" },
  { id: "cozy-cottage",     title: "Cozy Feather Cottage", scheme: "green", description: "A storybook cottage with a feather on the door.", image: "/media/coloring/cozy-cottage.jpeg" },
  { id: "city-hello",       title: "Hello, Big City",    scheme: "blue",   description: "Wave hello in front of the city skyline.", image: "/media/coloring/city-hello.jpeg" },
  { id: "city-stroll",      title: "City Stroll",        scheme: "purple", description: "A friendly walk down a tree-lined street.", image: "/media/coloring/city-stroll.jpeg" },
];

/** The one fully-colored example art — handy as decoration / a 'finished' preview. */
export const COLORING_COLORED_EXAMPLE = "/media/coloring/rainbow-wings-colored.jpeg";

export function getColoring(id: string): ColoringPage | undefined {
  return COLORING_LIBRARY.find((c) => c.id === id);
}

/** Roll a coloring page the child doesn't own yet; fall back to any if they own all. */
export function rollColoring(
  owned: string[] | undefined,
  rand: () => number,
): ColoringPage {
  const fresh = COLORING_LIBRARY.filter((c) => !(owned ?? []).includes(c.id));
  const pool = fresh.length > 0 ? fresh : COLORING_LIBRARY;
  return pool[Math.floor(rand() * pool.length)];
}

/* ============================================================
   Puzzles
   ============================================================ */

export interface PuzzleVariant {
  id: string;
  title: string;
  type: "word-search";
  scheme: "pink" | "blue" | "purple" | "orange" | "green" | "gold";
  description: string;
}

export const PUZZLE_LIBRARY: PuzzleVariant[] = [
  { id: "weekly-word-search", title: "This Week's Word Search", type: "word-search", scheme: "blue", description: "Find the Park Hunt words hidden in the grid." },
  { id: "feather-friends",    title: "Feather Friends Word Search", type: "word-search", scheme: "pink", description: "Eight Featherverse characters hidden across the grid." },
];

export function getPuzzle(id: string): PuzzleVariant | undefined {
  return PUZZLE_LIBRARY.find((p) => p.id === id);
}

export function rollPuzzle(
  owned: string[] | undefined,
  rand: () => number,
): PuzzleVariant {
  const fresh = PUZZLE_LIBRARY.filter((p) => !(owned ?? []).includes(p.id));
  const pool = fresh.length > 0 ? fresh : PUZZLE_LIBRARY;
  return pool[Math.floor(rand() * pool.length)];
}

/* ============================================================
   Mystery box pool
   ============================================================ */

export interface MysteryOutcome {
  kind: ClaimVariantType;
  // For 'feathers' / 'spin' the variantId is a label like 'feathers-100'.
  // For card/coloring/puzzle it's a real variant ID rolled below.
  variantId: string;
  weight: number;
  // Bonus payload for the post-claim resolver.
  bonusFeathers?: number;
  bonusSpins?: number;
  label: string;
  emoji: string;
}

const MYSTERY_POOL: MysteryOutcome[] = [
  { kind: "feathers", variantId: "feathers-50",  weight: 40, bonusFeathers: 50,  label: "+50 Bonus Feathers",  emoji: "🪶" },
  { kind: "feathers", variantId: "feathers-100", weight: 20, bonusFeathers: 100, label: "+100 Bonus Feathers", emoji: "🪶" },
  { kind: "feathers", variantId: "feathers-200", weight: 5,  bonusFeathers: 200, label: "+200 Mega Bonus",     emoji: "💎" },
  { kind: "coloring", variantId: "rolled",       weight: 15,                     label: "Surprise Coloring Page", emoji: "🎨" },
  { kind: "puzzle",   variantId: "rolled",       weight: 10,                     label: "Surprise Puzzle",        emoji: "🧩" },
  { kind: "card",     variantId: "rolled",       weight: 6,                      label: "Bonus Character Card",   emoji: "🃏" },
  { kind: "spin",     variantId: "spin-1",       weight: 3,  bonusSpins: 1,      label: "+1 Free Spin",           emoji: "🎡" },
  { kind: "egg",      variantId: "golden-egg",   weight: 1,                      label: "Golden Egg",             emoji: "🥚" },
];

export function rollMystery(
  ownedColoring: string[] | undefined,
  ownedPuzzles: string[] | undefined,
  rand: () => number,
): {
  outcome: MysteryOutcome;
  /** Resolved variantId (for card/coloring/puzzle, this is the actual rolled id). */
  resolvedVariantId: string;
} {
  const total = MYSTERY_POOL.reduce((s, o) => s + o.weight, 0);
  let ticket = rand() * total;
  let chosen: MysteryOutcome = MYSTERY_POOL[0];
  for (const o of MYSTERY_POOL) {
    if (ticket < o.weight) {
      chosen = o;
      break;
    }
    ticket -= o.weight;
  }
  let resolvedVariantId = chosen.variantId;
  if (chosen.kind === "card") resolvedVariantId = rollCard(rand).id;
  else if (chosen.kind === "coloring") resolvedVariantId = rollColoring(ownedColoring, rand).id;
  else if (chosen.kind === "puzzle") resolvedVariantId = rollPuzzle(ownedPuzzles, rand).id;
  return { outcome: chosen, resolvedVariantId };
}

/* ============================================================
   Deterministic PRNG (mulberry32) — seeded from claim id
   ============================================================ */

export function hashSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

export function rngFromSeed(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
