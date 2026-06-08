// Random-mission catalog for the QR-portal flow. Each QR code is a portal
// that picks one mission per scan from this list.

export type FeatherType =
  | "falcon"
  | "courage"
  | "wind"
  | "confidence"
  | "wisdom"
  | "joy";

export type MissionCategory =
  | "find"
  | "movement"
  | "affirmation"
  | "shape"
  | "color"
  | "word"
  | "kindness";

export type ApprovalKind = "child" | "parent";

export interface Mission {
  id: string;
  category: MissionCategory;
  prompt: string;
  helper?: string;
  feather: FeatherType;
  featherPop: number;
  approval: ApprovalKind;
}

export const MISSIONS: Mission[] = [
  // ----- find -----
  {
    id: "find-wings",
    category: "find",
    prompt: "Find something with wings",
    helper: "A bird, a butterfly, even a paper plane counts!",
    feather: "falcon",
    featherPop: 2,
    approval: "child",
  },
  {
    id: "find-soft",
    category: "find",
    prompt: "Find something soft to touch",
    helper: "Maybe a feather, a leaf, or your favorite blanket.",
    feather: "wind",
    featherPop: 1,
    approval: "child",
  },
  {
    id: "find-tall",
    category: "find",
    prompt: "Find something taller than you",
    helper: "Stretch up — does it still reach higher?",
    feather: "courage",
    featherPop: 1,
    approval: "child",
  },
  {
    id: "find-wind",
    category: "find",
    prompt: "Find something moving in the wind",
    helper: "Watch leaves, grass, flags, or your own hair!",
    feather: "wind",
    featherPop: 2,
    approval: "child",
  },
  {
    id: "find-shiny",
    category: "find",
    prompt: "Find something shiny and sparkling",
    helper: "Sun on glass, a coin, or a bit of glitter.",
    feather: "joy",
    featherPop: 1,
    approval: "child",
  },

  // ----- color -----
  {
    id: "color-yellow",
    category: "color",
    prompt: "Find something yellow",
    helper: "Like the sun, a flower, or a school bus.",
    feather: "joy",
    featherPop: 1,
    approval: "child",
  },
  {
    id: "color-purple",
    category: "color",
    prompt: "Find something purple",
    helper: "Purple is Ms. Feather Pop's favorite color!",
    feather: "wisdom",
    featherPop: 1,
    approval: "child",
  },
  {
    id: "color-rainbow",
    category: "color",
    prompt: "Spot three different colors in 30 seconds",
    helper: "Look around — say each color out loud.",
    feather: "joy",
    featherPop: 2,
    approval: "child",
  },

  // ----- shape -----
  {
    id: "shape-circle",
    category: "shape",
    prompt: "Find a circle hidden somewhere",
    helper: "A clock, a coin, a wheel, a bubble.",
    feather: "wisdom",
    featherPop: 1,
    approval: "child",
  },
  {
    id: "shape-triangle",
    category: "shape",
    prompt: "Find a triangle in the world",
    helper: "Pizza slices and roofs count!",
    feather: "wisdom",
    featherPop: 1,
    approval: "child",
  },

  // ----- movement -----
  {
    id: "move-hop-5",
    category: "movement",
    prompt: "Hop 5 times like a falcon",
    helper: "Land softly — count out loud: 1, 2, 3, 4, 5!",
    feather: "falcon",
    featherPop: 2,
    approval: "parent",
  },
  {
    id: "move-spin",
    category: "movement",
    prompt: "Spin in a circle and freeze like a statue",
    helper: "Stop on three. Can you balance?",
    feather: "courage",
    featherPop: 2,
    approval: "parent",
  },
  {
    id: "move-flap",
    category: "movement",
    prompt: "Flap your arms like wings for 10 seconds",
    helper: "Flap fast — feel the breeze you make!",
    feather: "wind",
    featherPop: 2,
    approval: "parent",
  },
  {
    id: "move-stretch",
    category: "movement",
    prompt: "Reach up high, then touch your toes",
    helper: "Do it three times — wake up your wings!",
    feather: "courage",
    featherPop: 1,
    approval: "parent",
  },

  // ----- affirmation -----
  {
    id: "affirm-self",
    category: "affirmation",
    prompt: "Say one kind thing about yourself out loud",
    helper: "\"I am brave.\" \"I am clever.\" \"I am kind.\"",
    feather: "confidence",
    featherPop: 3,
    approval: "parent",
  },
  {
    id: "affirm-future",
    category: "affirmation",
    prompt: "Say one thing you're excited about today",
    helper: "Big or small — both count!",
    feather: "confidence",
    featherPop: 2,
    approval: "parent",
  },
  {
    id: "affirm-strong",
    category: "affirmation",
    prompt: "Stand tall and say \"I can do hard things\"",
    helper: "Say it loud and proud!",
    feather: "courage",
    featherPop: 3,
    approval: "parent",
  },
  {
    id: "affirm-thanks",
    category: "affirmation",
    prompt: "Name three things you're grateful for",
    helper: "Count them on your fingers.",
    feather: "joy",
    featherPop: 2,
    approval: "parent",
  },

  // ----- kindness -----
  {
    id: "kind-smile",
    category: "kindness",
    prompt: "Give someone a big smile",
    helper: "A grown-up, a friend, or even your reflection.",
    feather: "joy",
    featherPop: 1,
    approval: "parent",
  },
  {
    id: "kind-help",
    category: "kindness",
    prompt: "Help with one small chore",
    helper: "Tidy up a toy, or set a spoon on the table.",
    feather: "confidence",
    featherPop: 2,
    approval: "parent",
  },
  {
    id: "kind-compliment",
    category: "kindness",
    prompt: "Tell someone what you love about them",
    helper: "Family, friend, or pet — say it clearly!",
    feather: "joy",
    featherPop: 2,
    approval: "parent",
  },

  // ----- word -----
  {
    id: "word-spell-3",
    category: "word",
    prompt: "Spell a 3-letter word out loud",
    helper: "C-A-T. D-O-G. S-U-N. Pick any!",
    feather: "wisdom",
    featherPop: 1,
    approval: "parent",
  },
  {
    id: "word-rhyme",
    category: "word",
    prompt: "Say two words that rhyme",
    helper: "Cat & hat. Sky & fly. Your turn!",
    feather: "wisdom",
    featherPop: 2,
    approval: "parent",
  },
  {
    id: "word-letter-sound",
    category: "word",
    prompt: "Name 3 things that start with the letter F",
    helper: "Feather, fish, flower… you try!",
    feather: "falcon",
    featherPop: 2,
    approval: "parent",
  },
];

export function getMission(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

// Pick a mission, avoiding recently completed ones when possible.
// Every scan yields a fresh random pick — the same QR genuinely surprises.
// The `slug` arg is accepted for future "biased by portal" behavior but
// currently unused (a previous version mixed it into the index math via
// XOR with Date.now(), which produced negative offsets for many slugs and
// returned undefined missions for those portals).
export function pickRandomMission(
  slug?: string,
  excludeIds: string[] = [],
): Mission {
  void slug;
  const pool = MISSIONS.filter((m) => !excludeIds.includes(m.id));
  const list = pool.length > 0 ? pool : MISSIONS;
  return list[Math.floor(Math.random() * list.length)];
}
