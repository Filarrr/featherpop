"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Heart, RefreshCw, Sparkles, Timer } from "lucide-react";
import { FEATHER_META, FEATHER_ORDER } from "@/lib/levels";
import type { FeatherType } from "@/lib/missions";
import { pickKeyWord } from "@/lib/sort-words";
import { useActiveChild } from "@/lib/use-active-child";
import { awardFeatherPopAction } from "@/lib/child-progress-actions";
import { setParkHuntTargetWordAction } from "@/lib/park-hunt-actions";
import { FeatherSvg, NestSvg } from "./FeatherSvg";
import { BirdFlight } from "./BirdFlight";
import { Spider } from "./Spider";
import { Mascot, MascotMood } from "@/components/Mascot";
import { Confetti } from "@/components/Confetti";
import {
  birdWhoosh,
  childCheer,
  eagleCheers,
  eagleVoice,
  fanfare,
  featherDrop,
  featherPickup,
  pop,
  spiderApproach,
  spiderVoice,
  startMusic,
  stopMusic,
  unlockVoiceClips,
  urgentTick,
  wordReveal,
  wrongDrop,
} from "@/lib/audio";

type Phase = "playing" | "bird" | "reveal" | "spider" | "won" | "lost";

interface FeatherInstance {
  id: string;
  type: FeatherType;
  x: number; // % across the play area
  y: number; // % down the play area
  rot: number;
  placed: FeatherType | null;
}

const LIVES = 5;

// Timer scales with round so later rounds (more feathers, more nests) stay
// achievable. Round 1 = 60s, +10s per round to a max of 100s.
function timerForRound(round: number): number {
  return Math.min(100, 60 + (round - 1) * 10);
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// How many feather TYPES to use this round (nest count).
function pickColorsForRound(round: number): FeatherType[] {
  // 1 → 3 colors, 2 → 4, 3 → 5, 4+ → 6 (all colors).
  const count = Math.min(6, 2 + round);
  return shuffle(FEATHER_ORDER).slice(0, count);
}

// How many feathers of EACH color to scatter — grows with the round so a
// later round has a denser, more chaotic scatter.
function feathersPerColor(round: number): number {
  if (round <= 1) return 2;
  if (round <= 3) return 3;
  return 4;
}

// The mascot lives in the bottom-LEFT corner with a speech bubble that
// extends ~30% across the scatter area. Feathers placed in there get hidden
// behind it, frustrating kids who can't see what they need to drag. Keep
// the scatter out of that wedge.
function inMascotZone(x: number, y: number): boolean {
  // The mascot bubble + figure occupy roughly the bottom-left 38% × 28%
  // of the play area. Reject any scatter point that lands in there.
  return x < 38 && y > 72;
}

function makeRound(types: FeatherType[], perColor: number): FeatherInstance[] {
  // `perColor` of each → density grows with the round. Scattered on the LEFT
  // portion of the play area so child drags rightward to the nest column,
  // with the mascot's bottom-left zone excluded.
  const all: FeatherInstance[] = [];
  let i = 0;
  for (const t of types) {
    for (let k = 0; k < perColor; k++) {
      // Reject-and-resample until the point isn't behind the mascot.
      let x = 0;
      let y = 0;
      for (let attempt = 0; attempt < 12; attempt++) {
        x = 4 + Math.random() * 64;
        y = 4 + Math.random() * 88;
        if (!inMascotZone(x, y)) break;
      }
      // If 12 attempts all landed in the mascot zone (unlucky), force above it.
      if (inMascotZone(x, y)) y = 4 + Math.random() * 60;
      all.push({
        id: `${t}-${k}-${i++}`,
        type: t,
        x,
        y,
        rot: -28 + Math.random() * 56,
        placed: null,
      });
    }
  }
  return shuffle(all);
}

export function FeatherSortGame() {
  const router = useRouter();
  const { activeChildId } = useActiveChild();

  const [round, setRound] = useState(1);
  // Color subset re-rolled on every round (random each time, NOT
  // index-based like before).
  const [roundTypes, setRoundTypes] = useState<FeatherType[]>(() =>
    pickColorsForRound(1),
  );

  const [feathers, setFeathers] = useState<FeatherInstance[]>(() =>
    makeRound(roundTypes, feathersPerColor(1)),
  );
  const [lives, setLives] = useState(LIVES);
  const [timeLeft, setTimeLeft] = useState(() => timerForRound(1));
  const [phase, setPhase] = useState<Phase>("playing");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [wrongPulse, setWrongPulse] = useState<FeatherType | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const [mood, setMood] = useState<MascotMood>("idle");
  const [mascotMsg, setMascotMsg] = useState<string | undefined>();
  const [mascotNudge, setMascotNudge] = useState(0);

  // Re-roll key word per round; matches the round size. pickKeyWord
  // cross-references this week's Park Hunt bank so the eagle's word
  // ALWAYS exists in one of the 6 stations — when the kid clicks
  // 'Find it at the park' it lands on a real, hunt-able word.
  const keyWord = useMemo(
    () => pickKeyWord(Math.min(7, 3 + round)),
    [round],
  );

  // Push the eagle's word to Park Hunt the moment we reveal it, so
  // the /park-hunt page shows THIS word (not a fresh deterministic
  // pick). Best-effort — if the user isn't signed in or has no active
  // child, the action returns ok:false and we silently fall back to
  // Park Hunt's own picker on the next page load.
  useEffect(() => {
    if (phase !== "reveal" || !keyWord?.word) return;
    void setParkHuntTargetWordAction(keyWord.word).catch(() => {});
  }, [phase, keyWord?.word]);

  // Boot music when the game mounts (the PLAY-button tap on home already
  // unlocked the AudioContext, so this just keeps the music going).
  // Cleanup on unmount — without it, the loop persisted into the next
  // page if the kid navigated mid-game.
  useEffect(() => {
    startMusic();
    return () => stopMusic();
  }, []);

  // Re-scatter and reset timer on every round change.
  useEffect(() => {
    setFeathers(makeRound(roundTypes, feathersPerColor(round)));
    setTimeLeft(timerForRound(round));
  }, [roundTypes, round]);

  // Countdown timer.
  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      // Time up → spider.
      window.setTimeout(() => {
        setPhase("spider");
        setMood("oops");
        setMascotMsg("Out of time! The spider snuck in…");
        setMascotNudge((n) => n + 1);
        spiderApproach();
        window.setTimeout(() => spiderVoice(), 700);
      }, 200);
      return;
    }
    const t = window.setTimeout(() => {
      setTimeLeft((s) => s - 1);
      if (timeLeft <= 11) urgentTick();
    }, 1000);
    return () => window.clearTimeout(t);
  }, [phase, timeLeft]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 80, tolerance: 6 } }),
  );

  const allPlaced = feathers.every((f) => f.placed !== null);
  useEffect(() => {
    if (phase === "playing" && allPlaced && feathers.length > 0) {
      setPhase("bird");
      setMood("wow");
      setMascotMsg("Wonderful! The eagle is coming with a magic word!");
      setMascotNudge((n) => n + 1);
      setConfettiKey((k) => k + 1);
      pop();
      window.setTimeout(() => childCheer(), 200);
      window.setTimeout(() => birdWhoosh(), 500);
      window.setTimeout(() => eagleVoice(), 900); // Strudelay! Strudelay!
      window.setTimeout(() => fanfare(), 2000);
      window.setTimeout(() => wordReveal(), 3000);
      // "Yes! Feather tag up and let's find the word!" — the eagle's
      // ask-to-go-find-it line. Plays after the parchment reveals so
      // the kid knows the word's the next mission.
      window.setTimeout(() => eagleCheers(), 4200);
    }
  }, [allPlaced, phase, feathers.length]);

  const onDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(String(e.active.id));
    featherPickup();
    // First drag is a user gesture — use it to unlock the voice clips so
    // the eagle/spider lines play later. unlockVoiceClips is idempotent.
    unlockVoiceClips();
  }, []);

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = e;
      const featherId = String(active.id);
      if (!over) return;
      const targetType = String(over.id).replace(/^nest-/, "") as FeatherType;
      const feather = feathers.find((f) => f.id === featherId);
      if (!feather) return;

      if (feather.type === targetType) {
        featherDrop();
        setFeathers((list) =>
          list.map((f) => (f.id === featherId ? { ...f, placed: targetType } : f)),
        );
      } else {
        wrongDrop();
        setWrongPulse(targetType);
        window.setTimeout(() => setWrongPulse(null), 600);
        setLives((l) => {
          const next = l - 1;
          if (next <= 0) {
            window.setTimeout(() => {
              setPhase("spider");
              setMood("oops");
              setMascotMsg("Oh no — try again, you can do it!");
              setMascotNudge((n) => n + 1);
              spiderApproach();
              window.setTimeout(() => spiderVoice(), 700);
            }, 350);
          } else {
            setMood("oops");
            setMascotMsg("Not that nest — match the colors!");
            setMascotNudge((n) => n + 1);
          }
          return Math.max(0, next);
        });
      }
    },
    [feathers],
  );

  function resetRound() {
    const types = pickColorsForRound(round);
    setRoundTypes(types);
    setFeathers(makeRound(types, feathersPerColor(round)));
    setLives(LIVES);
    setTimeLeft(timerForRound(round));
    setPhase("playing");
    setMood("idle");
    setMascotMsg(undefined);
    setMascotNudge((n) => n + 1);
  }

  function nextRound() {
    const r = round + 1;
    setRound(r);
    setRoundTypes(pickColorsForRound(r));
    setLives(LIVES);
    setTimeLeft(timerForRound(round));
    setPhase("playing");
    setMood("idle");
    setMascotMsg(undefined);
    setMascotNudge((n) => n + 1);
  }

  async function goLetterPop() {
    const bonus = Math.max(1, Math.floor(roundTypes.length / 2));
    try {
      if (activeChildId) await awardFeatherPopAction(bonus);
    } catch {}
    router.push(`/play?word=${encodeURIComponent(keyWord.word)}`);
  }

  async function goParkHunt() {
    // After eagle drops word → child scans QR in the park to "find" the
    // letters. Pass the word through the URL so /scan can hand it to
    // Letter Pop once a QR is detected.
    try {
      if (activeChildId)
        await awardFeatherPopAction(Math.max(1, Math.floor(roundTypes.length / 2)));
    } catch {}
    // Park Hunt is now its own flow: the daily station model picks a fresh
    // target word for the child. We drop into /park-hunt and let it tell the
    // child which word to find at which station.
    router.push("/park-hunt");
  }

  const timeUrgent = phase === "playing" && timeLeft <= 10;

  return (
    <div className="sort-stage sort-stage-forest">
      <Confetti trigger={confettiKey} pieces={70} />

      {/* Forest silhouette overlay — pure CSS trees flanking the play area */}
      <div className="forest-overlay" aria-hidden>
        <div className="forest-trees forest-trees-left">
          <span /><span /><span />
        </div>
        <div className="forest-trees forest-trees-right">
          <span /><span /><span />
        </div>
        <div className="forest-ground" />
      </div>

      <header className="sort-hud">
        <span className="kicker">
          <Sparkles aria-hidden className="h-4 w-4" />
          Round {round}
        </span>
        <h1 className="h-display text-2xl">
          <span className="h-gradient">Match the feathers</span>
        </h1>
        <div className="sort-hud-right">
          <span className={`sort-timer ${timeUrgent ? "is-urgent" : ""}`}>
            <Timer aria-hidden className="h-4 w-4" />
            {timeLeft}s
          </span>
          <div className="sort-lives">
            {Array.from({ length: LIVES }).map((_, i) => (
              <Heart
                key={i}
                aria-hidden
                className={`sort-life ${i < lives ? "is-on" : "is-off"}`}
              />
            ))}
          </div>
        </div>
      </header>

      {phase === "playing" ? (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="sort-board sort-board-horizontal">
            <div className="sort-board-scatter">
              {feathers
                .filter((f) => f.placed === null)
                .map((f) => (
                  <DraggableFeather
                    key={f.id}
                    feather={f}
                    isActive={activeId === f.id}
                  />
                ))}
            </div>

            <div className="sort-board-nests sort-board-nests-vertical">
              {roundTypes.map((t) => {
                const placed = feathers.filter((f) => f.placed === t);
                return (
                  <NestDrop
                    key={t}
                    type={t}
                    placedCount={placed.length}
                    wrong={wrongPulse === t}
                  />
                );
              })}
            </div>
          </div>
        </DndContext>
      ) : null}

      {phase === "bird" ? (
        <BirdFlight
          word={keyWord.word}
          onReveal={() => {
            setPhase("reveal");
            setMood("cheer");
            setMascotMsg(
              `Magic word: ${keyWord.word}! Find it at the park or play now!`,
            );
            setMascotNudge((n) => n + 1);
          }}
        />
      ) : null}

      {phase === "reveal" ? (
        <div className="sort-reveal">
          {/* Eagle perched on top of a big center-stage parchment */}
          <div className="sort-reveal-stage">
            <div className="sort-reveal-eagle" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/sort/bird-fly.png" alt="" />
            </div>
            <div
              className="sort-reveal-scroll"
              role="img"
              aria-label={`Eagle's magic word: ${keyWord.word}`}
            >
              <div className="sort-reveal-scroll-text">
                <p className="kicker">
                  <Sparkles aria-hidden className="h-4 w-4" />
                  Eagle&apos;s magic word
                </p>
                <h2 className="sort-reveal-word">{keyWord.word}</h2>
                {keyWord.hint ? (
                  <p className="sort-reveal-hint">{keyWord.hint}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="sort-reveal-actions">
            <button
              type="button"
              onClick={goParkHunt}
              className="btn btn-gold btn-lg btn-pulse"
            >
              Find it at the park (Scan)
            </button>
            <button type="button" onClick={goLetterPop} className="btn btn-sky">
              Or play Letter Pop now
            </button>
            <button type="button" onClick={nextRound} className="btn btn-ghost">
              <RefreshCw aria-hidden className="h-5 w-5" />
              New round
            </button>
          </div>
        </div>
      ) : null}

      {phase === "spider" ? (
        <Spider letters={keyWord.word.split("")} onDone={() => setPhase("lost")} />
      ) : null}

      {phase === "lost" ? (
        <div className="sort-lost">
          <h2 className="h-display text-3xl">Try again, brave friend!</h2>
          <p>Every sorter wobbles. Tap the button — you&apos;ve got this.</p>
          <div className="sort-reveal-actions">
            <button type="button" onClick={resetRound} className="btn btn-gold btn-lg">
              <RefreshCw aria-hidden className="h-5 w-5" />
              Try this round again
            </button>
            <button
              type="button"
              onClick={() => {
                setPhase("bird");
                pop();
                window.setTimeout(() => birdWhoosh(), 200);
                window.setTimeout(() => eagleVoice(), 700);
              }}
              className="btn btn-sky"
            >
              See the eagle anyway
            </button>
          </div>
        </div>
      ) : null}

      <div className="sort-mascot">
        <Mascot mood={mood} message={mascotMsg} nudge={mascotNudge} size={92} />
      </div>
    </div>
  );
}

function DraggableFeather({
  feather,
  isActive,
}: {
  feather: FeatherInstance;
  isActive: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: feather.id,
  });
  const meta = FEATHER_META[feather.type];
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    left: `${feather.x}%`,
    top: `${feather.y}%`,
    rotate: `${feather.rot}deg`,
    cursor: "grab",
    touchAction: "none",
    zIndex: isActive ? 50 : 1,
    ["--feather-color" as string]: meta.color,
    ["--feather-glow" as string]: meta.glow,
  };
  return (
    <button
      ref={setNodeRef}
      style={style}
      className={`sort-feather ${isActive ? "is-dragging" : ""}`}
      aria-label={`${meta.name} feather`}
      {...listeners}
      {...attributes}
    >
      {/* Bold color ring under the feather makes which-color-is-this obvious */}
      <span className="sort-feather-ring" aria-hidden />
      <FeatherSvg type={feather.type} size={72} />
    </button>
  );
}

function NestDrop({
  type,
  placedCount,
  wrong,
}: {
  type: FeatherType;
  placedCount: number;
  wrong: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `nest-${type}` });
  const meta = FEATHER_META[type];
  return (
    <div
      ref={setNodeRef}
      className={`sort-nest ${isOver ? "is-over" : ""} ${wrong ? "is-wrong" : ""}`}
      style={{
        ["--feather-color" as string]: meta.color,
        ["--feather-glow" as string]: meta.glow,
      }}
    >
      <NestSvg type={type} size={120} />
      <span className="sort-nest-label">{meta.name}</span>
      <div className="sort-nest-stack">
        {Array.from({ length: placedCount }).map((_, i) => (
          <span key={i} className="sort-nest-feather">
            <FeatherSvg type={type} size={32} />
          </span>
        ))}
      </div>
    </div>
  );
}
