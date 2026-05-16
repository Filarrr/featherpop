// Tiny audio helper. Uses the Web Speech API for voice prompts so we don't
// have to ship audio files for the MVP. A small WebAudio "ding" provides
// non-verbal feedback (e.g. on letter taps or correct answers).

const SOUND_KEY = "ms-feather-pop-sound";

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem(SOUND_KEY);
  return v === null ? true : v === "1";
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SOUND_KEY, enabled ? "1" : "0");
}

export function speak(message: string) {
  if (typeof window === "undefined") return;
  if (!isSoundEnabled()) return;
  if (!("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(message);
    u.rate = 1;
    u.pitch = 1.15;
    u.volume = 1;
    // Prefer a friendly voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => /female|samantha|jenny|aria|google us english/i.test(v.name)) ??
      voices.find((v) => v.lang?.startsWith("en"));
    if (preferred) u.voice = preferred;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!isSoundEnabled()) return null;
  type WindowWithWebkit = typeof window & {
    webkitAudioContext?: typeof AudioContext;
  };
  const w = window as WindowWithWebkit;
  const Ctor = window.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  return audioCtx;
}

export function ding(frequency = 880, durationMs = 140) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + durationMs / 1000 + 0.05);
}

export function fanfare() {
  ding(660, 120);
  setTimeout(() => ding(880, 120), 130);
  setTimeout(() => ding(1320, 220), 260);
}

export function buzz() {
  ding(180, 220);
}
