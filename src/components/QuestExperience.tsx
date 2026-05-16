"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Play,
  RefreshCw,
  SkipForward,
  Sparkles,
  Trophy,
  Volume2,
  XCircle,
} from "lucide-react";
import { Challenge } from "@/lib/game-data";
import {
  PlayerProgress,
  completeChallenge,
  readProgress,
  saveProgress,
} from "@/lib/player";
import { buzz, ding, fanfare, speak } from "@/lib/audio";
import { Mascot, MascotMood } from "@/components/Mascot";

type Phase = "video" | "reveal" | "build" | "result";
type SlotState = "neutral" | "correct" | "present" | "absent";

const CONFETTI_COLORS = [
  "var(--pink)",
  "var(--magenta)",
  "var(--purple)",
  "var(--gold)",
  "var(--mint)",
  "var(--sky-4)",
];

export function QuestExperience({ challenge }: { challenge: Challenge }) {
  const hasIntro = !!challenge.introVideoUrl;
  const [videoOk, setVideoOk] = useState<boolean | null>(hasIntro ? null : false);
  const [phase, setPhase] = useState<Phase>(hasIntro ? "video" : "reveal");
  const [slots, setSlots] = useState<(number | null)[]>(() =>
    Array.from({ length: challenge.targetWord.length }, () => null),
  );
  const [slotStates, setSlotStates] = useState<SlotState[]>(() =>
    Array.from({ length: challenge.targetWord.length }, () => "neutral"),
  );
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [foundBonuses, setFoundBonuses] = useState<string[]>([]);
  const [mood, setMood] = useState<MascotMood>("idle");
  const [mascotMessage, setMascotMessage] = useState<string | undefined>();
  const [mascotNudge, setMascotNudge] = useState(0);
  const [progress, setProgress] = useState<PlayerProgress>(() => readProgress());
  const completed = progress.completedChallengeSlugs.includes(challenge.slug);

  // Probe whether the per-quest video actually exists
  useEffect(() => {
    if (!hasIntro) return;
    let cancelled = false;
    fetch(challenge.introVideoUrl as string, { method: "HEAD" })
      .then((r) => {
        if (cancelled) return;
        const ok = r.ok;
        setVideoOk(ok);
        if (!ok) setPhase("reveal");
      })
      .catch(() => {
        if (cancelled) return;
        setVideoOk(false);
        setPhase("reveal");
      });
    return () => {
      cancelled = true;
    };
  }, [hasIntro, challenge.introVideoUrl]);

  // Reveal phase voice + auto-advance
  useEffect(() => {
    if (phase !== "reveal") return;
    speak(`The letter is ${challenge.mainLetter}.`);
    const timer = window.setTimeout(() => setPhase("build"), 1800);
    return () => window.clearTimeout(timer);
  }, [phase, challenge.mainLetter]);

  // Idle nudge: if user is stuck mid-build, encourage
  useEffect(() => {
    if (phase !== "build") return;
    if (slots.some((s) => s !== null) && slots.some((s) => s === null)) {
      const t = window.setTimeout(() => {
        if (mood === "idle" || mood === "think") {
          setMood("think");
          setMascotMessage(undefined);
          setMascotNudge((n) => n + 1);
        }
      }, 8000);
      return () => window.clearTimeout(t);
    }
  }, [slots, phase, mood]);

  // Built word = contiguous filled prefix (letters always fill firstEmpty,
  // so the leading run of non-null slots IS what the player has spelled).
  const builtWord = useMemo(() => {
    let out = "";
    for (const idx of slots) {
      if (idx == null) break;
      out += challenge.letters[idx];
    }
    return out;
  }, [slots, challenge.letters]);
  const filledCount = builtWord.length;
  const isFull = filledCount === challenge.targetWord.length;
  const canSubmit = filledCount >= 2;
  const usedIndexes = slots.filter((s): s is number => s !== null);

  function placeLetter(letterIndex: number) {
    if (usedIndexes.includes(letterIndex)) return;
    const firstEmpty = slots.findIndex((s) => s === null);
    if (firstEmpty === -1) return;
    const next = [...slots];
    next[firstEmpty] = letterIndex;
    setSlots(next);
    resetSlotStates(next.length);
    ding(660 + firstEmpty * 60, 90);
  }

  function clearSlot(slotIdx: number) {
    if (slots[slotIdx] === null) return;
    const next = [...slots];
    next[slotIdx] = null;
    setSlots(next);
    resetSlotStates(next.length);
  }

  function clearAll() {
    setSlots(Array.from({ length: challenge.targetWord.length }, () => null));
    resetSlotStates(challenge.targetWord.length);
  }

  function resetSlotStates(n: number) {
    setSlotStates(Array.from({ length: n }, () => "neutral"));
  }

  function evaluate(guess: string, target: string): SlotState[] {
    const g = guess.toUpperCase().split("");
    const t = target.toUpperCase().split("");
    const out: SlotState[] = g.map(() => "absent");
    const counts: Record<string, number> = {};
    t.forEach((ch) => (counts[ch] = (counts[ch] ?? 0) + 1));
    g.forEach((ch, i) => {
      if (ch === t[i]) {
        out[i] = "correct";
        counts[ch] -= 1;
      }
    });
    g.forEach((ch, i) => {
      if (out[i] === "correct") return;
      if ((counts[ch] ?? 0) > 0) {
        out[i] = "present";
        counts[ch] -= 1;
      }
    });
    return out;
  }

  function submit() {
    if (!canSubmit) return;
    const guess = builtWord.toUpperCase();
    const target = challenge.targetWord.toUpperCase();

    if (isFull && guess === target) {
      setSlotStates(slots.map(() => "correct"));
      const next = completeChallenge(challenge.slug, challenge.featherpopValue);
      setProgress(next);
      fanfare();
      setMood("cheer");
      setMascotMessage(
        completed
          ? `Already done — but ${challenge.targetWord} again, amazing!`
          : `${challenge.targetWord}! +${challenge.featherpopValue} FeatherPop!`,
      );
      setMascotNudge((n) => n + 1);
      speak(
        completed
          ? `${challenge.targetWord}! Great spelling!`
          : `${challenge.targetWord}! You earned ${challenge.featherpopValue} FeatherPop!`,
      );
      window.setTimeout(() => setPhase("result"), 900);
      return;
    }

    // Maybe a bonus word?
    const isBonus = challenge.bonusWords
      .map((w) => w.toUpperCase())
      .includes(guess);
    if (isBonus && !foundBonuses.includes(guess)) {
      setFoundBonuses((arr) => [...arr, guess]);
      setSlotStates(
        slots.map((s) => (s !== null ? "correct" : "neutral")),
      );
      const cur = readProgress();
      const updated: PlayerProgress = {
        ...cur,
        totalFeatherPop: cur.totalFeatherPop + 1,
      };
      saveProgress(updated);
      setProgress(updated);
      ding(1200, 120);
      window.setTimeout(() => ding(1500, 120), 130);
      setMood("wow");
      setMascotMessage(`Bonus word "${guess}"! +1 FeatherPop!`);
      setMascotNudge((n) => n + 1);
      speak(`Bonus word ${guess}! Plus one FeatherPop!`);
      window.setTimeout(() => {
        clearAll();
        setMood("idle");
        setMascotMessage(undefined);
        setMascotNudge((n) => n + 1);
      }, 1600);
      return;
    }

    // Plain wrong → per-letter feedback (only on filled slots) + encouragement
    const ev = evaluate(guess, target);
    const padded: SlotState[] = slots.map((s, i) =>
      s === null ? "neutral" : ev[i] ?? "absent",
    );
    setSlotStates(padded);
    setAttempts((a) => a + 1);
    buzz();
    setMood("oops");
    setMascotMessage(
      isFull
        ? undefined
        : `"${guess}" isn't a bonus word — keep going!`,
    );
    setMascotNudge((n) => n + 1);
    speak(
      isFull
        ? attempts >= 1
          ? "Almost! Try again."
          : "Not quite!"
        : "Try a different word!",
    );
  }

  /* -------- VIDEO -------- */
  if (phase === "video") {
    return (
      <section className="card overflow-hidden p-0">
        <Header challenge={challenge} step="Step 2 · Quest intro" inset />
        <div className="relative aspect-video bg-black">
          {videoOk === null ? (
            <div className="absolute inset-0 grid place-items-center text-white/70">
              Loading video…
            </div>
          ) : videoOk ? (
            <video
              src={challenge.introVideoUrl}
              controls
              autoPlay
              playsInline
              poster="/media/poster.jpeg"
              onEnded={() => setPhase("reveal")}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 p-4">
          <p className="text-sm font-semibold text-[var(--ink-soft)]">
            Watch a quick toon, then build the word.
          </p>
          <button
            type="button"
            onClick={() => setPhase("reveal")}
            className="btn btn-ghost btn-sm"
          >
            <SkipForward aria-hidden className="h-4 w-4" />
            Skip
          </button>
        </div>
      </section>
    );
  }

  /* -------- REVEAL -------- */
  if (phase === "reveal") {
    return (
      <section className="card">
        <Header challenge={challenge} step="Step 3 · Reveal" />
        <div className="reveal-stage">
          <span className="kicker">Main letter</span>
          <div className="reveal-main">{challenge.mainLetter}</div>
          <p className="text-lg font-bold text-[var(--ink-soft)]">
            Plus {challenge.letters.length - 1} more letters coming up…
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setPhase("build")}
          >
            <Play aria-hidden className="h-5 w-5" />
            Start Building
            <ArrowRight aria-hidden className="h-5 w-5" />
          </button>
        </div>
      </section>
    );
  }

  /* -------- RESULT -------- */
  if (phase === "result") {
    return (
      <section className="card card-deep">
        <div className="confetti-host relative grid place-items-center py-2">
          <Confetti />
          <Trophy aria-hidden className="h-14 w-14 text-[var(--gold)]" />
          <h1 className="h-display mt-4 text-center text-4xl">
            {challenge.targetWord}!
          </h1>
          <p className="mt-2 text-center text-white/85">
            {completed
              ? "Already counted — but great job spelling it!"
              : `+${challenge.featherpopValue} FeatherPop added to your wallet.`}
          </p>
          {foundBonuses.length > 0 ? (
            <p className="mt-1 text-sm text-[var(--gold)]">
              Bonus words found: {foundBonuses.join(", ")} (+
              {foundBonuses.length} FeatherPop)
            </p>
          ) : null}
          <p className="mt-1 text-sm text-white/65">
            Wallet balance:{" "}
            <strong className="text-[var(--gold)]">
              {progress.totalFeatherPop}
            </strong>{" "}
            FeatherPop
          </p>

          <div className="mt-6 grid w-full max-w-sm gap-2">
            <Link href="/scan" className="btn btn-gold">
              Scan another QR
              <ArrowRight aria-hidden className="h-5 w-5" />
            </Link>
            <Link href="/wallet" className="btn btn-ghost">
              View Wallet
            </Link>
            <Link href="/rewards" className="btn btn-ghost">
              Check Rewards
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /* -------- BUILD -------- */
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="card relative overflow-hidden pb-40 md:pb-32">
        <Header challenge={challenge} step="Step 4 · Build" />

        <div className="mt-4 grid gap-5">
          <div>
            <p className="mb-2 text-center text-sm font-bold text-[var(--ink-soft)]">
              Your word ({challenge.targetWord.length} letters)
            </p>
            <div
              className="word-slots"
              role="list"
              aria-label="Built word"
              data-count={challenge.targetWord.length}
            >
              {slots.map((idx, slotIdx) => {
                const filled = idx !== null;
                const state = slotStates[slotIdx] ?? "neutral";
                const cls = [
                  "word-slot",
                  filled ? "is-filled" : "",
                  state === "correct" ? "is-correct" : "",
                  state === "present" ? "is-present" : "",
                  state === "absent" && filled ? "is-wrong" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    type="button"
                    key={slotIdx}
                    onClick={() => clearSlot(slotIdx)}
                    className={cls}
                    aria-label={
                      filled
                        ? `Slot ${slotIdx + 1}: ${challenge.letters[idx!]}, tap to remove`
                        : `Empty slot ${slotIdx + 1}`
                    }
                  >
                    {filled ? challenge.letters[idx!] : ""}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-center text-sm font-bold text-[var(--ink-soft)]">
              Tap letters to spell
            </p>
            <div
              className="letter-bank"
              role="list"
              aria-label="Letter bank"
              data-count={challenge.letters.length}
            >
              {challenge.letters.map((letter, index) => {
                const used = usedIndexes.includes(index);
                const isMain =
                  letter === challenge.mainLetter &&
                  index === challenge.letters.indexOf(challenge.mainLetter);
                return (
                  <button
                    key={`${letter}-${index}`}
                    type="button"
                    onClick={() => placeLetter(index)}
                    disabled={used}
                    className={`letter-tile ${isMain ? "is-main" : ""}`}
                    aria-label={`Letter ${letter}`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

          {showHint ? (
            <p
              className="rounded-2xl p-4 text-center font-bold"
              style={{
                background: "linear-gradient(135deg, #fff7e6, #ffe9c2)",
                color: "var(--ink)",
              }}
            >
              💡 {challenge.hint}
            </p>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className="btn btn-primary"
            >
              {isFull ? "Submit" : `Try “${builtWord}”`}
              <ArrowRight aria-hidden className="h-5 w-5" />
            </button>
            <button type="button" onClick={clearAll} className="btn btn-ghost">
              <RefreshCw aria-hidden className="h-4 w-4" />
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                setShowHint((v) => !v);
                setMood("hint");
                setMascotMessage(undefined);
                setMascotNudge((n) => n + 1);
              }}
              className="btn btn-gold"
            >
              <Lightbulb aria-hidden className="h-4 w-4" />
              {showHint ? "Hide hint" : "Hint"}
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              speak(`Spell the word ${challenge.targetWord.toLowerCase()}.`)
            }
            className="mx-auto inline-flex items-center gap-2 text-sm font-bold text-[var(--purple)]"
          >
            <Volume2 aria-hidden className="h-4 w-4" />
            Hear the word
          </button>
        </div>

        <Mascot mood={mood} message={mascotMessage} nudge={mascotNudge} />
      </section>

      <aside className="card card-deep">
        <span
          className="kicker"
          style={{ background: "rgba(255,255,255,0.18)", color: "white" }}
        >
          Quest booth
        </span>

        <div className="mt-4 min-h-[8rem]">
          {attempts === 0 && foundBonuses.length === 0 ? (
            <div>
              <Sparkles aria-hidden className="h-10 w-10 text-[var(--gold)]" />
              <h2 className="h-display mt-3 text-2xl">
                Spell the mystery word.
              </h2>
              <p className="mt-2 text-white/75">
                Zone: <strong>{challenge.zone}</strong>
              </p>
              <p className="mt-2 text-sm text-white/60">
                Tip: shorter words from these letters earn bonus FeatherPop — submit anytime!
              </p>
            </div>
          ) : (
            <div>
              {attempts > 0 ? (
                <>
                  <XCircle className="h-10 w-10 text-[var(--pink)]" />
                  <h2 className="h-display mt-3 text-2xl">Tries: {attempts}</h2>
                  <p className="mt-1 text-white/75">
                    Green = correct spot. Yellow = right letter, wrong spot.
                  </p>
                </>
              ) : null}
              {foundBonuses.length > 0 ? (
                <div className={attempts > 0 ? "mt-3" : ""}>
                  <CheckCircle2 className="h-8 w-8 text-[var(--mint)]" />
                  <p className="mt-1 font-bold text-white">
                    Bonus words found: {foundBonuses.length}
                  </p>
                  <p className="text-sm text-white/70">
                    {foundBonuses.join(", ")}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-white/15 pt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-white/55">
            Wallet balance
          </p>
          <p className="font-display text-5xl font-extrabold leading-none text-[var(--gold)]">
            {progress.totalFeatherPop}
          </p>
          <div className="mt-4 grid gap-2">
            <Link href="/wallet" className="btn btn-gold btn-sm">
              View Wallet
            </Link>
            <Link href="/scan" className="btn btn-ghost btn-sm">
              Scan Again
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Header({
  challenge,
  step,
  inset,
}: {
  challenge: Challenge;
  step: string;
  inset?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-3 ${
        inset ? "p-4 md:p-5" : ""
      }`}
    >
      <div>
        <span className="kicker">{step}</span>
        <h1 className="h-display mt-2 text-3xl md:text-4xl">
          <span className="h-gradient">{challenge.zone}</span>
        </h1>
        <p className="text-sm font-semibold text-[var(--ink-soft)]">
          {challenge.qrLabel}
        </p>
      </div>
      <div
        className="grid min-h-16 min-w-20 place-items-center rounded-2xl px-3 text-center"
        style={{
          background: "linear-gradient(135deg, #ffe27a, var(--gold))",
          color: "var(--ink)",
        }}
      >
        <span className="text-[0.65rem] font-bold uppercase tracking-wide">
          Reward
        </span>
        <strong className="font-display text-2xl leading-none">
          +{challenge.featherpopValue}
        </strong>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 28 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const left = (i / pieces.length) * 100 + Math.random() * 4 - 2;
        const delay = Math.random() * 0.6;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        return (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              background: color,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
      <style>{`
        .confetti-piece {
          position: absolute;
          top: 0;
          width: 8px;
          height: 14px;
          border-radius: 2px;
          animation: confetti-fall 1.8s ease-in forwards;
        }
        @keyframes confetti-fall {
          0%   { transform: translateY(-30px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(260px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
