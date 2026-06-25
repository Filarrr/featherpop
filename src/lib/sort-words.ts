// Key words used as the prize for a successful Feather Sort.
// Each entry maps to a length tier so we can match difficulty to feather count.
// Words are deliberately kid-positive, easy to read aloud, and bridge cleanly
// into Letter Pop (which highlights the word in its grid).
//
// IMPORTANT: the eagle's word MUST exist in the Park Hunt bank so that
// when the kid takes it to /park-hunt, it maps to a real station. See
// `pickKeyWord` below — it cross-references PARK_HUNT_BANK and picks
// words that appear in both.

import { FeatherType } from "./missions";
import { PARK_HUNT_BANK } from "./park-hunt-words";
import { stationOfWord, weekKey } from "./park-hunt";

export interface KeyWord {
  word: string;
  length: number;
  feather: FeatherType; // thematic — the bird hands this feather's color
  hint?: string;
}

// 60+ words. Picker biases by `length` (≈feather count of the round).
const KEY_WORDS: KeyWord[] = [
  // 3-letter (gentle warmup)
  { word: "SUN", length: 3, feather: "joy", hint: "Bright and warm" },
  { word: "SKY", length: 3, feather: "wind", hint: "Way up high" },
  { word: "FLY", length: 3, feather: "wind" },
  { word: "JOY", length: 3, feather: "joy" },
  { word: "EGG", length: 3, feather: "wisdom" },
  { word: "OWL", length: 3, feather: "wisdom" },
  { word: "BEE", length: 3, feather: "joy" },
  { word: "TOP", length: 3, feather: "confidence" },
  { word: "WIN", length: 3, feather: "confidence" },
  { word: "HOP", length: 3, feather: "courage" },

  // 4-letter
  { word: "WIND", length: 4, feather: "wind" },
  { word: "STAR", length: 4, feather: "joy", hint: "Twinkles at night" },
  { word: "MOON", length: 4, feather: "wisdom" },
  { word: "NEST", length: 4, feather: "wisdom" },
  { word: "BIRD", length: 4, feather: "wind" },
  { word: "WING", length: 4, feather: "wind" },
  { word: "KIND", length: 4, feather: "courage" },
  { word: "BRAVE", length: 5, feather: "courage" },
  { word: "GLOW", length: 4, feather: "joy" },
  { word: "SOAR", length: 4, feather: "confidence" },
  { word: "HOPE", length: 4, feather: "courage" },
  { word: "LOVE", length: 4, feather: "courage" },
  { word: "TREE", length: 4, feather: "wisdom" },

  // 5-letter
  { word: "EAGLE", length: 5, feather: "falcon" },
  { word: "SHINE", length: 5, feather: "joy" },
  { word: "DANCE", length: 5, feather: "joy" },
  { word: "DREAM", length: 5, feather: "wisdom" },
  { word: "MAGIC", length: 5, feather: "confidence" },
  { word: "CLOUD", length: 5, feather: "wind" },
  { word: "HEART", length: 5, feather: "courage" },
  { word: "SMILE", length: 5, feather: "joy" },
  { word: "PEACE", length: 5, feather: "wisdom" },
  { word: "STORY", length: 5, feather: "wisdom" },
  { word: "QUEST", length: 5, feather: "confidence" },
  { word: "SPARK", length: 5, feather: "joy" },
  { word: "BRAVE", length: 5, feather: "courage" },

  // 6-letter
  { word: "FRIEND", length: 6, feather: "courage" },
  { word: "FLIGHT", length: 6, feather: "wind" },
  { word: "WONDER", length: 6, feather: "wisdom" },
  { word: "SPARKLE", length: 7, feather: "joy" },
  { word: "RAINBOW", length: 7, feather: "joy" },
  { word: "FEATHER", length: 7, feather: "falcon" },
  { word: "COURAGE", length: 7, feather: "courage" },
  { word: "ADVENTURE", length: 9, feather: "confidence" },
];

export function pickKeyWord(targetLen: number, exclude: string[] = []): KeyWord {
  // Pool 1 (preferred): KEY_WORDS that are ALSO in the Park Hunt bank
  // for this week. That way the eagle's reveal always maps to a real
  // station — child can hand it straight to /park-hunt and find it.
  const week = weekKey();
  const inBank = (w: KeyWord) => stationOfWord(w.word, week) >= 0;

  const linked = KEY_WORDS.filter((w) => inBank(w) && !exclude.includes(w.word));
  const fallbackPool = KEY_WORDS.filter((w) => !exclude.includes(w.word));
  const primary = linked.length > 0 ? linked : fallbackPool;
  const list = primary.length > 0 ? primary : KEY_WORDS;

  // Prefer exact length match; widen the search if none.
  const exact = list.filter((w) => w.length === targetLen);
  const near = list.filter((w) => Math.abs(w.length - targetLen) <= 1);
  const pick = exact.length > 0 ? exact : near.length > 0 ? near : list;
  return pick[Math.floor(Math.random() * pick.length)];
}

/**
 * Last-resort fallback. PARK_HUNT_BANK has hundreds of words; if none of
 * KEY_WORDS happen to be in this week's stations for some reason, pick
 * any bank word at the requested length. Used by the Sort game.
 */
export function pickBankWordOfLength(targetLen: number): string {
  const sameLen = PARK_HUNT_BANK.filter((w) => w.length === targetLen);
  const near = PARK_HUNT_BANK.filter((w) => Math.abs(w.length - targetLen) <= 1);
  const list = sameLen.length > 0 ? sameLen : near.length > 0 ? near : PARK_HUNT_BANK;
  return list[Math.floor(Math.random() * list.length)];
}

export function isKeyWord(word: string): boolean {
  const upper = word.toUpperCase();
  return KEY_WORDS.some((w) => w.word === upper);
}
