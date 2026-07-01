"use client";

import Link from "next/link";
import { Home, Music, Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DailyBonusCard } from "@/components/DailyBonusCard";
import { MediaGrid } from "@/components/MediaGrid";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";
import {
  isMusicEnabled,
  setMusicEnabled,
  startMusic,
  stopMusic,
} from "@/lib/audio";

export default function MusicPage() {
  const [musicOn, setMusicOn] = useState(true);
  const [playing, setPlaying] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => setMusicOn(isMusicEnabled()), []);
  useEffect(() => () => stopMusic(), []);

  function toggle() {
    if (playing) {
      stopMusic();
      setPlaying(false);
    } else {
      if (!isMusicEnabled()) setMusicEnabled(true);
      startMusic();
      setPlaying(true);
      startedRef.current = true;
    }
  }

  function toggleMute() {
    const next = !musicOn;
    setMusicOn(next);
    setMusicEnabled(next);
    if (!next) {
      stopMusic();
      setPlaying(false);
    }
  }

  return (
    <main className="page">
      <DailyBonusCard kind="music" />
      <MediaGrid kind="song" />

      <section className="card music-card">
        <span className="kicker">
          <Music aria-hidden className="h-4 w-4" />
          Music Station
        </span>
        <h1 className="h-display mt-2 text-3xl">
          <span className="h-gradient">Ms. Feather Pop&apos;s Tunes</span>
        </h1>
        <p>
          A cheerful arcade-style melody plays while you tap below. Listen as
          long as you like — only the first song each day earns the bonus.
        </p>

        <div className="music-stage">
          <MsFeatherPopAvatar pose={playing ? "cheer" : "wave"} size={160} />
        </div>

        <div className="music-controls">
          <button
            type="button"
            onClick={toggle}
            className="btn btn-gold btn-lg btn-pulse"
            disabled={!musicOn}
          >
            {playing ? (
              <>
                <Pause aria-hidden className="h-5 w-5" />
                Pause music
              </>
            ) : (
              <>
                <Play aria-hidden className="h-5 w-5" />
                Play music
              </>
            )}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className={`btn ${musicOn ? "btn-ghost" : "btn-sky"}`}
          >
            <Volume2 aria-hidden className="h-5 w-5" />
            {musicOn ? "Sound on" : "Sound off"}
          </button>
          <Link href="/" className="btn btn-ghost">
            <Home aria-hidden className="h-5 w-5" />
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
