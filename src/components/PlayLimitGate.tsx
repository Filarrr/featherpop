"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Home, Lock, Sparkles } from "lucide-react";
import type { GameKey } from "@/lib/play-limits";
import { consumePlayAction } from "@/lib/play-limits-actions";

/**
 * Wraps a game. Free families get 3 plays/day per game; members are
 * unlimited. If already out of plays (locked), shows a friendly subscribe
 * screen. Otherwise renders the game and counts this play once.
 */
export function PlayLimitGate({
  game,
  gameLabel,
  initialLocked,
  children,
}: {
  game: GameKey;
  gameLabel: string;
  initialLocked: boolean;
  children: ReactNode;
}) {
  const [locked, setLocked] = useState(initialLocked);
  const consumedRef = useRef(false);

  useEffect(() => {
    if (initialLocked || consumedRef.current) return;
    consumedRef.current = true;
    (async () => {
      const res = await consumePlayAction(game).catch(() => null);
      if (res && !res.allowed) setLocked(true);
    })();
  }, [game, initialLocked]);

  if (locked) {
    return (
      <main className="page">
        <div className="playlimit-wall card">
          <div className="playlimit-icon" aria-hidden>
            <Lock className="h-7 w-7" />
          </div>
          <span className="kicker">Free plays used up</span>
          <h1 className="h-display mt-2 text-3xl">
            <span className="h-gradient">Come back tomorrow — or go unlimited!</span>
          </h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            You&apos;ve played <strong>{gameLabel}</strong> 3 times today.
            Subscribe for <strong>$9.99/month</strong> to play as much as you
            like, unlock all the prizes, and get unlimited Park Hunt.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href="/membership" className="btn btn-gold btn-lg">
              <Sparkles aria-hidden className="h-5 w-5" />
              See membership
            </Link>
            <Link href="/" className="btn btn-ghost">
              <Home aria-hidden className="h-5 w-5" />
              Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
