// Kid-safe English dictionary for word validation across the game
// (Wordshake side game + QuestExperience bonus-word matching).
//
// The actual word list is auto-generated from `an-array-of-english-words`
// by `scripts/build-dict.mjs` — see wordshake-dict-data.ts. To regenerate
// (e.g. to add/remove blocked substrings), run `node scripts/build-dict.mjs`.

import { WORDSHAKE_WORDS } from "./wordshake-dict-data";

const DICT: Set<string> = new Set(WORDSHAKE_WORDS);

export function isDictWord(word: string): boolean {
  return DICT.has(word.toLowerCase());
}

export const WORDSHAKE_DICT: ReadonlySet<string> = DICT;
