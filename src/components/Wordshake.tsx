"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Home, RefreshCw, Sparkles, Timer, Volume2, VolumeX } from "lucide-react";
import {
  buzz,
  childCheer,
  childOoh,
  ding,
  fanfare,
  isMusicEnabled,
  pop,
  setMusicEnabled,
  startMusic,
  stopMusic,
  tick,
  urgentTick,
} from "@/lib/audio";
import { isDictWord } from "@/lib/wordshake-dict";
import { awardFeatherPopAction } from "@/lib/child-progress-actions";
import { Mascot, MascotMood } from "@/components/Mascot";

const GRID_SIZE = 4;
const ROUND_SECONDS = 120;

// Distribution biased toward common letters and vowels — kid-friendly.
const DICE = [
  "AAEEGN","ABBJOO","ACHOPS","AFFKPS","AOOTTW","CIMOTU","DEILRX","DELRVY",
  "DISTTY","EEGHNW","EEINSU","EHRTVW","EIOSST","ELRTTY","HIMNQU","HLNNRZ",
];

function rollGrid(): string[] {
  const out: string[] = [];
  const dice = [...DICE].sort(() => Math.random() - 0.5);
  for (const d of dice) {
    out.push(d[Math.floor(Math.random() * d.length)]);
  }
  return out;
}

function scoreFor(word: string) {
  const n = word.length;
  if (n < 2) return 0;
  if (n === 2) return 1;
  if (n === 3) return 1;
  if (n === 4) return 2;
  if (n === 5) return 4;
  if (n === 6) return 6;
  if (n === 7) return 10;
  return 11 + (n - 7) * 2;
}

function areAdjacent(a: number, b: number) {
  const ra = Math.floor(a / GRID_SIZE);
  const ca = a % GRID_SIZE;
  const rb = Math.floor(b / GRID_SIZE);
  const cb = b % GRID_SIZE;
  return Math.abs(ra - rb) <= 1 && Math.abs(ca - cb) <= 1 && a !== b;
}

export function Wordshake() {
  const [grid, setGrid] = useState<string[]>(() => rollGrid());
  const [path, setPath] = useState<number[]>([]);
  const [found, setFound] = useState<{ word: string; points: number }[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [running, setRunning] = useState(true);
  const [boardClass, setBoardClass] = useState("");
  const [musicOn, setMusicOn] = useState(true);
  const [gridSeed, setGridSeed] = useState(0);
  const [flyScore, setFlyScore] = useState<{ value: number; key: number } | null>(
    null,
  );
  const [mood, setMood] = useState<MascotMood>("idle");
  const [mascotMessage, setMascotMessage] = useState<string | undefined>();
  const [mascotNudge, setMascotNudge] = useState(0);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [boardSize, setBoardSize] = useState({ w: 0, h: 0 });
  const [linePx, setLinePx] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => setMusicOn(isMusicEnabled()), []);

  useEffect(() => {
    if (musicOn && running) startMusic();
    else stopMusic();
    return () => stopMusic();
  }, [musicOn, running]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        const next = Math.max(0, s - 1);
        if (next === 0) {
          stopMusic();
          fanfare();
          setRunning(false);
          setMood("cheer");
          setMascotMessage("Time! Great spelling, Word Explorer!");
          setMascotNudge((n) => n + 1);
        } else if (next <= 10) urgentTick();
        else if (next % 10 === 0) tick();
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const builtWord = useMemo(() => path.map((i) => grid[i]).join(""), [path, grid]);
  const totalPoints = useMemo(
    () => found.reduce((s, w) => s + w.points, 0),
    [found],
  );

  function tap(idx: number) {
    if (!running) return;
    if (path.length === 0) {
      setPath([idx]);
      ding(660, 80);
      return;
    }
    const last = path[path.length - 1];
    if (idx === last) {
      // toggle off last
      setPath(path.slice(0, -1));
      return;
    }
    if (path.includes(idx)) return; // can't reuse
    if (!areAdjacent(last, idx)) {
      buzz();
      setBoardClass("is-wrong");
      window.setTimeout(() => setBoardClass(""), 380);
      return;
    }
    setPath([...path, idx]);
    ding(660 + path.length * 50, 80);
  }

  function cancel() {
    setPath([]);
  }

  function enter() {
    if (path.length < 2) {
      buzz();
      setBoardClass("is-wrong");
      window.setTimeout(() => setBoardClass(""), 380);
      setMood("hint");
      setMascotMessage("Tap at least two connected letters!");
      setMascotNudge((n) => n + 1);
      return;
    }
    const w = builtWord.toUpperCase();
    if (found.some((f) => f.word === w)) {
      buzz();
      setBoardClass("is-wrong");
      window.setTimeout(() => setBoardClass(""), 380);
      setMood("oops");
      setMascotMessage(`You already found "${w}".`);
      setMascotNudge((n) => n + 1);
      return;
    }
    if (!isDictWord(w)) {
      buzz();
      setBoardClass("is-wrong");
      window.setTimeout(() => setBoardClass(""), 380);
      setMood("oops");
      setMascotMessage(`"${w}" isn't a word — try another!`);
      setMascotNudge((n) => n + 1);
      return;
    }
    const pts = scoreFor(w);
    setFound((arr) => [{ word: w, points: pts }, ...arr]);
    setPath([]);
    setBoardClass("is-win");
    window.setTimeout(() => setBoardClass(""), 380);
    setFlyScore({ value: pts, key: Date.now() });
    window.setTimeout(() => setFlyScore(null), 950);
    pop();
    if (pts >= 4) childCheer();
    else childOoh();

    if (w.length >= 5 || pts >= 6) {
      setMood("wow");
      setMascotMessage(`Big word! "${w}" — +${pts} points!`);
    } else {
      setMood("cheer");
      setMascotMessage(`"${w}" — +${pts} points!`);
    }
    setMascotNudge((n) => n + 1);

    // Award 1 FeatherPop per 4 points (rounded down, min 0) to the active child.
    const award = Math.floor(pts / 4);
    if (award > 0) {
      void awardFeatherPopAction(award).catch(() => {});
    }
  }

  function newGame() {
    setGrid(rollGrid());
    setGridSeed((s) => s + 1);
    setPath([]);
    setFound([]);
    setSecondsLeft(ROUND_SECONDS);
    setRunning(true);
    setMood("idle");
    setMascotMessage(undefined);
    setMascotNudge((n) => n + 1);
  }

  const mm = Math.floor(secondsLeft / 60);
  const ss = (secondsLeft % 60).toString().padStart(2, "0");
  const timeFlash = secondsLeft <= 10 && running;

  // Compute line points in pixels from actual cell positions so the
  // overlay aligns with cell centers regardless of padding/gap.
  useLayoutEffect(() => {
    const board = boardRef.current;
    if (!board || path.length < 2) {
      setLinePx([]);
      return;
    }
    const boardRect = board.getBoundingClientRect();
    setBoardSize({ w: boardRect.width, h: boardRect.height });
    setLinePx(
      path.map((idx) => {
        const cell = cellRefs.current[idx];
        if (!cell) return { x: 0, y: 0 };
        const r = cell.getBoundingClientRect();
        return {
          x: r.left - boardRect.left + r.width / 2,
          y: r.top - boardRect.top + r.height / 2,
        };
      }),
    );
  }, [path, grid]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const ro = new ResizeObserver(() => {
      const r = board.getBoundingClientRect();
      setBoardSize({ w: r.width, h: r.height });
      setLinePx((prev) =>
        prev.map((_, i) => {
          const cell = cellRefs.current[path[i]];
          if (!cell) return { x: 0, y: 0 };
          const cr = cell.getBoundingClientRect();
          return {
            x: cr.left - r.left + cr.width / 2,
            y: cr.top - r.top + cr.height / 2,
          };
        }),
      );
    });
    ro.observe(board);
    return () => ro.disconnect();
  }, [path]);

  return (
    <div className="wordshake">
      <section>
        <div className="quest-toolbar mb-3">
          <div className={`timer-pill ${timeFlash ? "is-flash" : ""}`}>
            <Timer aria-hidden className="h-4 w-4" />
            <span>
              {mm}:{ss}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !musicOn;
              setMusicOn(next);
              setMusicEnabled(next);
              if (next) startMusic();
              else stopMusic();
            }}
            className={`music-pill ${musicOn ? "is-on" : ""}`}
            aria-pressed={musicOn}
          >
            {musicOn ? (
              <Volume2 aria-hidden className="h-4 w-4" />
            ) : (
              <VolumeX aria-hidden className="h-4 w-4" />
            )}
            {musicOn ? "Music" : "Muted"}
          </button>
          <div className="found-pill">
            <Sparkles aria-hidden className="h-4 w-4" />
            {totalPoints} pts
          </div>
        </div>

        <div ref={boardRef} className={`shake-board ${boardClass}`}>
          {grid.map((letter, idx) => {
            const sel = path.indexOf(idx);
            const isSel = sel !== -1;
            const isLast = sel === path.length - 1 && isSel;
            return (
              <button
                key={`${gridSeed}-${idx}`}
                ref={(el) => {
                  cellRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => tap(idx)}
                disabled={!running}
                className={`shake-cell ${isSel ? "is-selected" : ""} ${
                  isLast ? "is-last" : ""
                }`}
                style={{ animationDelay: `${idx * 30}ms` }}
                aria-label={`Letter ${letter}${isSel ? `, selected ${sel + 1}` : ""}`}
              >
                {letter}
              </button>
            );
          })}

          {flyScore ? (
            <span key={flyScore.key} className="shake-flyscore">
              +{flyScore.value}
            </span>
          ) : null}

          {/* connect-the-dots line overlay */}
          {linePx.length > 1 && boardSize.w > 0 ? (
            <svg
              className="shake-line"
              width={boardSize.w}
              height={boardSize.h}
              viewBox={`0 0 ${boardSize.w} ${boardSize.h}`}
              aria-hidden
            >
              {linePx.slice(1).map((pt, i) => {
                const prev = linePx[i];
                return (
                  <line
                    key={i}
                    x1={prev.x}
                    y1={prev.y}
                    x2={pt.x}
                    y2={pt.y}
                  />
                );
              })}
            </svg>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button type="button" onClick={newGame} className="btn btn-ghost btn-sm">
            <RefreshCw aria-hidden className="h-4 w-4" />
            New game
          </button>
          <Link href="/" className="btn btn-ghost btn-sm">
            <Home aria-hidden className="h-4 w-4" />
            Home
          </Link>
        </div>
      </section>

      <aside className="shake-side">
        <Mascot mood={mood} message={mascotMessage} nudge={mascotNudge} />
        <div className="shake-builder">
          {builtWord.length === 0 ? (
            <em>Tap connected letters…</em>
          ) : (
            builtWord
          )}
        </div>

        <div className="shake-actions">
          <button
            type="button"
            onClick={cancel}
            disabled={path.length === 0}
            className="shake-btn shake-btn-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={enter}
            disabled={path.length < 2 || !running}
            className="shake-btn shake-btn-enter"
          >
            Enter
          </button>
        </div>

        <div className="shake-words" aria-live="polite">
          <div
            className="shake-words-row"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <span>Word</span>
            <span>Points</span>
          </div>
          {found.length === 0 ? (
            <div className="shake-words-row">
              <span style={{ opacity: 0.55 }}>No words yet</span>
              <span style={{ opacity: 0.55 }}>0</span>
            </div>
          ) : (
            found.map((f) => (
              <div key={f.word} className="shake-words-row">
                <span>{f.word}</span>
                <span>{f.points}</span>
              </div>
            ))
          )}
        </div>

        {!running ? (
          <div
            className="rounded-2xl p-3 text-center"
            style={{
              background: "linear-gradient(135deg, var(--gold), #ff9f3a)",
              color: "var(--ink)",
              fontWeight: 800,
            }}
          >
            Time! You scored <strong>{totalPoints}</strong> points and{" "}
            {Math.floor(totalPoints / 4) > 0
              ? `earned ${Math.floor(totalPoints / 4)} FeatherPop.`
              : "no FeatherPop this time."}
            <div className="mt-2">
              <button
                type="button"
                onClick={newGame}
                className="shake-btn shake-btn-enter w-full"
              >
                Play again
              </button>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
