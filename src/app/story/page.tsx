"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";

const CHAPTERS = [
  {
    title: "Chapter 1 · The Wind Whistle",
    body: [
      "High in the cliffs of Strudelay, where the wind sings like a tin whistle, Ms. Feather Pop was preening her favorite feather — the gold one.",
      "A breeze tugged at her braid. \"That sounds like a song!\" she said, tilting her head.",
    ],
  },
  {
    title: "Chapter 2 · A Brave Hop",
    body: [
      "Below the cliff, a little falcon named Pip was practicing brave hops. One, two, three! On the fourth, he tripped over a pebble and tumbled.",
      "\"You alright, Pip?\" called Ms. Feather Pop. \"Try again — bravery is two parts hop and one part get-back-up.\"",
    ],
  },
  {
    title: "Chapter 3 · The Whistle Answers",
    body: [
      "Pip stood tall, took a breath, and hopped FIVE big hops. The wind picked up his feathers and whistled around his little ears.",
      "Ms. Feather Pop clapped. \"That's a Falcon Feather earned!\" The sky sparkled — gold, magenta, purple. To be continued…",
    ],
  },
];

export default function StoryPage() {
  const [idx, setIdx] = useState(0);
  const ch = CHAPTERS[idx];
  return (
    <main className="page">
      <section className="card story-card">
        <div className="story-mascot">
          <MsFeatherPopAvatar pose="wave" size={140} />
        </div>
        <span className="kicker">
          <BookOpen aria-hidden className="h-4 w-4" />
          Story Time
        </span>
        <h1 className="h-display mt-2 text-3xl">{ch.title}</h1>
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
            className="btn btn-sky btn-sm"
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
      </section>
    </main>
  );
}
