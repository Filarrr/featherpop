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
import { Heart, RefreshCw, Sparkles } from "lucide-react";
import { FEATHER_META, FEATHER_ORDER } from "@/lib/levels";
import type { FeatherType } from "@/lib/missions";
import { pickKeyWord } from "@/lib/sort-words";
import { useActiveChild } from "@/lib/use-active-child";
import { awardFeatherPopAction } from "@/lib/child-progress-actions";
import { FeatherSvg, NestSvg } from "./FeatherSvg";
import { BirdFlight } from "./BirdFlight";
import { Spider } from "./Spider";
import { Mascot, MascotMood } from "@/components/Mascot";
import { Confetti } from "@/components/Confetti";
import {
  birdWhoosh,
  childCheer,
  fanfare,
  featherDrop,
  featherPickup,
  pop,
  spiderApproach,
  wordReveal,
  wrongDrop,
} from "@/lib/audio";

type Phase = "playing" | "bird" | "reveal" | "spider" | "won" | "lost";

interface FeatherInstance {
  id: string;
  type: FeatherType;
  // start position (vw / vh) for the scattered scene
  x: number;
  y: number;
  rot: number;
  placed: FeatherType | null; // nest type if placed, null if still floating
}

const LIVES = 3;

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeRound(types: FeatherType[]): FeatherInstance[] {
  // Two of each type so the sort has weight. Scatter in the upper play area.
  const all: FeatherInstance[] = [];
  let i = 0;
  for (const t of types) {
    for (let k = 0; k < 2; k++) {
      all.push({
        id: `${t}-${k}-${i++}`,
        type: t,
        x: 8 + Math.random() * 84,
        y: 8 + Math.random() * 40,
        rot: -25 + Math.random() * 50,
        placed: null,
      });
    }
  }
  return shuffle(all);
}

export function FeatherSortGame() {
  const router = useRouter();
  const { activeChildId } = useActiveChild();

  // Round 1 uses 3 colors → 6 feathers; later rounds add more.
  const [round, setRound] = useState(1);
  const roundTypes = useMemo<FeatherType[]>(() => {
    const count = Math.min(6, 2 + round);
    return FEATHER_ORDER.slice(0, count);
  }, [round]);

  const [feathers, setFeathers] = useState<FeatherInstance[]>(() =>
    makeRound(roundTypes),
  );
  const [lives, setLives] = useState(LIVES);
  const [phase, setPhase] = useState<Phase>("playing");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [wrongPulse, setWrongPulse] = useState<FeatherType | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const [mood, setMood] = useState<MascotMood>("idle");
  const [mascotMsg, setMascotMsg] = useState<string | undefined>();
  const [mascotNudge, setMascotNudge] = useState(0);

  const keyWord = useMemo(
    () => pickKeyWord(Math.min(7, 3 + round)),
    [round],
  );

  // Re-scatter when round changes.
  useEffect(() => {
    setFeathers(makeRound(roundTypes));
  }, [roundTypes]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 80, tolerance: 6 } }),
  );

  const allPlaced = feathers.every((f) => f.placed !== null);
  useEffect(() => {
    if (phase === "playing" && allPlaced) {
      // Win!
      setPhase("bird");
      setMood("wow");
      setMascotMsg("Wonderful! A bird is coming with a magic word!");
      setMascotNudge((n) => n + 1);
      setConfettiKey((k) => k + 1);
      pop();
      window.setTimeout(() => childCheer(), 200);
      window.setTimeout(() => birdWhoosh(), 500);
      window.setTimeout(() => fanfare(), 1300);
      window.setTimeout(() => wordReveal(), 2400);
    }
  }, [allPlaced, phase]);

  const onDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(String(e.active.id));
    featherPickup();
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
        // Correct!
        featherDrop();
        setFeathers((list) =>
          list.map((f) => (f.id === featherId ? { ...f, placed: targetType } : f)),
        );
      } else {
        // Wrong — lose a life, pulse the wrong nest, wobble the feather back.
        wrongDrop();
        setWrongPulse(targetType);
        window.setTimeout(() => setWrongPulse(null), 600);
        setLives((l) => {
          const next = l - 1;
          if (next <= 0) {
            // Spider time.
            window.setTimeout(() => {
              setPhase("spider");
              setMood("oops");
              setMascotMsg("Oh no — try again, you can do it!");
              setMascotNudge((n) => n + 1);
              spiderApproach();
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
    setFeathers(makeRound(roundTypes));
    setLives(LIVES);
    setPhase("playing");
    setMood("idle");
    setMascotMsg(undefined);
    setMascotNudge((n) => n + 1);
  }

  function nextRound() {
    setRound((r) => r + 1);
    setLives(LIVES);
    setPhase("playing");
    setMood("idle");
    setMascotMsg(undefined);
    setMascotNudge((n) => n + 1);
  }

  async function goLetterPop() {
    // Award FeatherPop bonus for clearing the sort, then jump to Letter Pop.
    const bonus = Math.max(1, Math.floor(roundTypes.length / 2));
    try {
      if (activeChildId) await awardFeatherPopAction(bonus);
    } catch {}
    router.push(`/play?word=${encodeURIComponent(keyWord.word)}`);
  }

  return (
    <div className="sort-stage">
      <Confetti trigger={confettiKey} pieces={70} />

      <header className="sort-hud">
        <span className="kicker">
          <Sparkles aria-hidden className="h-4 w-4" />
          Round {round}
        </span>
        <h1 className="h-display text-2xl">
          <span className="h-gradient">Sort the feathers</span>
        </h1>
        <div className="sort-lives">
          {Array.from({ length: LIVES }).map((_, i) => (
            <Heart
              key={i}
              aria-hidden
              className={`sort-life ${i < lives ? "is-on" : "is-off"}`}
            />
          ))}
        </div>
      </header>

      {phase === "playing" ? (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="sort-board">
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

            <div className="sort-board-nests">
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
        <BirdFlight word={keyWord.word} onReveal={() => setPhase("reveal")} />
      ) : null}

      {phase === "reveal" ? (
        <div className="sort-reveal">
          <p className="kicker"><Sparkles aria-hidden className="h-4 w-4" /> Magic word</p>
          <h2 className="h-display sort-reveal-word">{keyWord.word}</h2>
          {keyWord.hint ? <p className="text-[var(--ink-soft)]">{keyWord.hint}</p> : null}
          <div className="sort-reveal-actions">
            <button type="button" onClick={goLetterPop} className="btn btn-gold btn-lg btn-pulse">
              Play Letter Pop with this word
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
          <button type="button" onClick={resetRound} className="btn btn-gold btn-lg">
            <RefreshCw aria-hidden className="h-5 w-5" />
            Try this round again
          </button>
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
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    left: `${feather.x}%`,
    top: `${feather.y}%`,
    rotate: `${feather.rot}deg`,
    cursor: "grab",
    touchAction: "none",
    zIndex: isActive ? 50 : 1,
  };
  return (
    <button
      ref={setNodeRef}
      style={style}
      className={`sort-feather ${isActive ? "is-dragging" : ""}`}
      aria-label={`${feather.type} feather`}
      {...listeners}
      {...attributes}
    >
      <FeatherSvg type={feather.type} size={64} />
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
      <NestSvg type={type} size={130} />
      <span className="sort-nest-label">{meta.name}</span>
      <div className="sort-nest-stack">
        {Array.from({ length: placedCount }).map((_, i) => (
          <span key={i} className="sort-nest-feather">
            <FeatherSvg type={type} size={36} />
          </span>
        ))}
      </div>
    </div>
  );
}
