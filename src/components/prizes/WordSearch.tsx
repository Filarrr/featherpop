"use client";

// Printable word search puzzle.
//
// Two variants:
//   - 'weekly-word-search' — uses 10 Park Hunt words from this week's bank,
//     so the puzzle ties straight into the rest of the app
//   - 'feather-friends'    — uses 8 Featherverse character names
//
// 12×12 grid, words placed horizontally, vertically, or diagonally.
// Empty cells filled with random distractor letters. Deterministic
// given the puzzle id so the same kid sees the same grid every time.

import { useMemo } from "react";
import { CARD_DECK } from "@/lib/prize-library";
import { hashSeed, rngFromSeed } from "@/lib/prize-library";
import { weeklyStations } from "@/lib/park-hunt";

interface Props {
  id: string;
  size?: number;
}

const GRID = 12;

type Dir = [number, number]; // [dx, dy]
const DIRS: Dir[] = [
  [1, 0],
  [0, 1],
  [1, 1],
  [-1, 1],
];

function pickWordsFor(id: string): string[] {
  if (id === "feather-friends") {
    // 8 first names from the character deck, short enough to fit.
    return ["ASTOR", "BEA", "CORAL", "DEWEY", "ECHO", "FLORA", "GIGI", "HATTIE"];
  }
  // Default: weekly Park Hunt words. Pick 10 between 3-7 letters so they
  // fit comfortably in a 12×12 grid.
  const all = weeklyStations().allWords;
  const pool = all.filter((w) => w.length >= 3 && w.length <= 7);
  // Deterministic shuffle so the puzzle is stable for the week.
  const seed = hashSeed(`mfp-puzzle-${id}-${weeklyStations().week}`);
  const rand = rngFromSeed(seed);
  const shuffled = pool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 10);
}

interface Placement {
  word: string;
  row: number;
  col: number;
  dir: Dir;
}

function placeWords(words: string[], seed: number): { grid: string[][]; placements: Placement[] } {
  const rand = rngFromSeed(seed);
  const grid: string[][] = Array.from({ length: GRID }, () => Array(GRID).fill(""));
  const placements: Placement[] = [];

  for (const word of words) {
    let placed = false;
    for (let attempt = 0; attempt < 60 && !placed; attempt++) {
      const dir = DIRS[Math.floor(rand() * DIRS.length)];
      const row = Math.floor(rand() * GRID);
      const col = Math.floor(rand() * GRID);
      // Bounds check
      const endR = row + dir[1] * (word.length - 1);
      const endC = col + dir[0] * (word.length - 1);
      if (endR < 0 || endR >= GRID || endC < 0 || endC >= GRID) continue;
      // Cell check — empty or matching letter
      let ok = true;
      for (let i = 0; i < word.length; i++) {
        const r = row + dir[1] * i;
        const c = col + dir[0] * i;
        if (grid[r][c] !== "" && grid[r][c] !== word[i]) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      for (let i = 0; i < word.length; i++) {
        const r = row + dir[1] * i;
        const c = col + dir[0] * i;
        grid[r][c] = word[i];
      }
      placements.push({ word, row, col, dir });
      placed = true;
    }
  }

  // Fill empty cells with random distractor letters.
  const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = ALPHA[Math.floor(rand() * 26)];
      }
    }
  }
  return { grid, placements };
}

export function WordSearch({ id, size = 540 }: Props) {
  const { words, grid, placements, title } = useMemo(() => {
    const ws = pickWordsFor(id);
    const seed = hashSeed(`mfp-puzzle-grid-${id}-${weeklyStations().week}`);
    const { grid, placements } = placeWords(ws, seed);
    const title = id === "feather-friends" ? "FEATHER FRIENDS WORD SEARCH" : "THIS WEEK'S WORD SEARCH";
    return { words: ws, grid, placements, title };
  }, [id]);

  const cell = 36;
  const padX = 70;
  const padY = 130;

  return (
    <svg
      viewBox="0 0 700 900"
      width={size}
      height={(size * 900) / 700}
      style={{ background: "white" }}
      aria-label={title}
    >
      {/* Title bar */}
      <rect x="80" y="30" width="540" height="48" rx="24" fill="none" stroke="#1a0f3a" strokeWidth="2.4" />
      <text x="350" y="63" textAnchor="middle" fontSize="22" fontWeight={800} fill="#1a0f3a" fontFamily="var(--font-baloo, sans-serif)" letterSpacing="0.08em">
        {title}
      </text>

      {/* Grid */}
      {Array.from({ length: GRID + 1 }).map((_, i) => (
        <line
          key={`h${i}`}
          x1={padX}
          y1={padY + i * cell}
          x2={padX + GRID * cell}
          y2={padY + i * cell}
          stroke="#1a0f3a"
          strokeWidth="1.4"
        />
      ))}
      {Array.from({ length: GRID + 1 }).map((_, i) => (
        <line
          key={`v${i}`}
          x1={padX + i * cell}
          y1={padY}
          x2={padX + i * cell}
          y2={padY + GRID * cell}
          stroke="#1a0f3a"
          strokeWidth="1.4"
        />
      ))}
      {/* Letters */}
      {grid.map((row, r) =>
        row.map((ch, c) => (
          <text
            key={`${r}-${c}`}
            x={padX + c * cell + cell / 2}
            y={padY + r * cell + cell / 2 + 7}
            textAnchor="middle"
            fontSize="20"
            fontWeight={700}
            fill="#1a0f3a"
            fontFamily="var(--font-baloo, sans-serif)"
          >
            {ch}
          </text>
        )),
      )}

      {/* Word list */}
      <text x="80" y={padY + GRID * cell + 40} fontSize="16" fontWeight={800} fill="#1a0f3a" fontFamily="var(--font-baloo, sans-serif)" letterSpacing="0.08em">
        FIND THESE WORDS:
      </text>
      {words.map((w, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        return (
          <text
            key={w}
            x={80 + col * 110}
            y={padY + GRID * cell + 70 + row * 26}
            fontSize="16"
            fontWeight={700}
            fill="#1a0f3a"
            fontFamily="var(--font-baloo, sans-serif)"
          >
            • {w}
          </text>
        );
      })}

      <text x="350" y="855" textAnchor="middle" fontSize="11" fontWeight={700} fill="#1a0f3a" opacity={0.55} fontFamily="var(--font-fredoka, sans-serif)" letterSpacing="0.2em">
        MS. FEATHER POP · WORD SEARCH
      </text>
    </svg>
  );
}
