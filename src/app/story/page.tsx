"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Home,
  Square,
  Volume2,
} from "lucide-react";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";
import type { FeatherPopPose } from "@/components/MsFeatherPopAvatar";
import { speak, stopSpeaking } from "@/lib/audio";
import { DailyBonusCard } from "@/components/DailyBonusCard";

interface Chapter {
  title: string;
  body: string[];
  pose: FeatherPopPose;
  scene: string;
}

const CHAPTERS: Chapter[] = [
  {
    title: "Chapter 1 · The Wind Whistle",
    body: [
      "High in the cliffs of Strudelay, where the wind sings like a tin whistle, Ms. Feather Pop was preening her favorite feather — the gold one.",
      "A breeze tugged at her braid. \"That sounds like a song!\" she said, tilting her head. The clouds rolled by in pink and lavender, and somewhere below, a tiny voice cheered.",
    ],
    pose: "idle",
    scene:
      "linear-gradient(180deg, #ffd6f0 0%, #b9e8ff 60%, #7cd1ff 100%)",
  },
  {
    title: "Chapter 2 · A Brave Hop",
    body: [
      "Below the cliff, a little falcon named Pip was practicing brave hops. One, two, three! On the fourth, he tripped over a pebble and tumbled into a clump of dandelions.",
      "\"You alright, Pip?\" called Ms. Feather Pop. \"Try again — bravery is two parts hop and one part get-back-up.\"",
      "Pip dusted off his wings and grinned. \"Watch me, Ms. Pop! I'm a falcon flyer!\"",
    ],
    pose: "cheer",
    scene:
      "linear-gradient(180deg, #ffe7a0 0%, #ffd14a 60%, #ff7ab8 100%)",
  },
  {
    title: "Chapter 3 · The Whistle Answers",
    body: [
      "Pip stood tall, took a deep breath, and hopped FIVE big hops. The wind picked up his feathers and whistled around his little ears.",
      "Ms. Feather Pop clapped. \"That's a Falcon Feather earned!\" The sky sparkled — gold, magenta, purple, like a bowl of stars spilling open.",
      "Pip held the feather close. \"I want a whole rainbow,\" he whispered. \"To be continued…\"",
    ],
    pose: "wow",
    scene:
      "linear-gradient(180deg, #6a2dff 0%, #b13bff 50%, #ff2d8e 100%)",
  },
];

export default function StoryPage() {
  const [idx, setIdx] = useState(0);
  const [reading, setReading] = useState(false);
  const ch = CHAPTERS[idx];
  const text = `${ch.title.split("·")[1]?.trim() ?? ch.title}. ${ch.body.join(" ")}`;
  function startRead() {
    stopSpeaking();
    setReading(true);
    speak(text);
    // Poll for end since speak() doesn't return the utterance.
    const watch = window.setInterval(() => {
      if (typeof window !== "undefined" && !window.speechSynthesis.speaking) {
        setReading(false);
        window.clearInterval(watch);
      }
    }, 300);
  }

  function stopRead() {
    stopSpeaking();
    setReading(false);
  }

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    stopRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  return (
    <main className="page">
      <DailyBonusCard kind="video" />
      <article
        className="story-card"
        style={{ ["--scene" as string]: ch.scene }}
      >
        <div className="story-scene" aria-hidden>
          <div className="story-scene-glow" />
          <span className="story-sparkle s1" />
          <span className="story-sparkle s2" />
          <span className="story-sparkle s3" />
          <span className="story-sparkle s4" />
        </div>

        <div className="story-mascot">
          <MsFeatherPopAvatar pose={ch.pose} size={180} />
        </div>

        <div className="story-body-wrap">
          <span className="kicker">
            <BookOpen aria-hidden className="h-4 w-4" />
            Story Time
          </span>
          <h1 className="h-display mt-2 text-3xl">{ch.title}</h1>

          <div className="story-actions">
            {reading ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={stopRead}
              >
                <Square aria-hidden className="h-4 w-4" />
                Stop
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-sky btn-sm"
                onClick={startRead}
              >
                <Volume2 aria-hidden className="h-4 w-4" />
                Read to me
              </button>
            )}
          </div>

          <div className="story-body">
            {ch.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="story-nav">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={idx === 0}
              onClick={() => setIdx((n) => Math.max(0, n - 1))}
            >
              <ChevronLeft aria-hidden className="h-4 w-4" />
              Back
            </button>
            <span className="story-dots" aria-hidden>
              {CHAPTERS.map((_, i) => (
                <i key={i} className={i === idx ? "is-on" : ""} />
              ))}
            </span>
            <button
              type="button"
              className="btn btn-gold btn-sm"
              disabled={idx === CHAPTERS.length - 1}
              onClick={() => setIdx((n) => Math.min(CHAPTERS.length - 1, n + 1))}
            >
              Next
              <ChevronRight aria-hidden className="h-4 w-4" />
            </button>
          </div>

          <Link href="/" className="btn btn-ghost btn-sm mt-3">
            <Home aria-hidden className="h-4 w-4" />
            Home
          </Link>
        </div>
      </article>
    </main>
  );
}
