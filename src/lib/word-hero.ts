// Word Hero game logic — pick a target letter and a letter bank, validate
// kid-submitted words against the dictionary, enforce that the word starts
// with the target letter and uses only available bank letters.

import { isDictWord } from "./wordshake-dict";

// Letters the picker prefers. Skip Q/X/Z which produce frustrating boards
// for young readers.
const TARGET_LETTERS = "ABCDEFGHIJKLMNOPRSTUVWY".split("");

// Vowel-rich distractor pool — guarantees most banks have enough vowels to
// build real words.
const VOWEL_POOL = "AEIOU";
const COMMON_POOL = "NRSTLDCM";
const MID_POOL = "BFGHPYW";

export interface WordHeroRound {
  targetLetter: string;
  bank: string[]; // 10–12 letters including the target
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickRound(): WordHeroRound {
  const targetLetter =
    TARGET_LETTERS[Math.floor(Math.random() * TARGET_LETTERS.length)];

  // Build a bank with: target letter + 3 vowels + 4 common + 2 mid.
  const bank: string[] = [targetLetter];
  const vowels = shuffle(VOWEL_POOL.split("")).slice(0, 3);
  const commons = shuffle(COMMON_POOL.split("")).slice(0, 4);
  const mids = shuffle(MID_POOL.split("")).slice(0, 2);
  bank.push(...vowels, ...commons, ...mids);
  // Add one more random distractor for variety.
  const extras = "ABCDEFGHIJKLMNOPRSTUVWY".split("").filter((l) => l !== targetLetter);
  bank.push(extras[Math.floor(Math.random() * extras.length)]);

  return {
    targetLetter,
    bank: shuffle(bank),
  };
}

export interface WordCheck {
  ok: boolean;
  reason?: string;
}

export function validateWord(
  word: string,
  round: WordHeroRound,
  alreadyFound: string[],
): WordCheck {
  const w = word.trim().toUpperCase();
  if (w.length < 2) {
    return { ok: false, reason: "Words need at least 2 letters." };
  }
  if (w[0] !== round.targetLetter) {
    return {
      ok: false,
      reason: `Words must start with ${round.targetLetter}!`,
    };
  }
  // Check that each letter is available in the bank (counting multiplicity).
  const bankCount = new Map<string, number>();
  for (const l of round.bank) bankCount.set(l, (bankCount.get(l) ?? 0) + 1);
  for (const l of w) {
    const remaining = bankCount.get(l) ?? 0;
    if (remaining <= 0) {
      return {
        ok: false,
        reason: `"${l}" isn't in the letter bank.`,
      };
    }
    bankCount.set(l, remaining - 1);
  }
  if (alreadyFound.includes(w)) {
    return { ok: false, reason: `You already found "${w}".` };
  }
  if (!isDictWord(w)) {
    return { ok: false, reason: `"${w}" isn't a real word.` };
  }
  return { ok: true };
}
