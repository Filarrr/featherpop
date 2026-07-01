"use server";

// Client-callable wrapper to count one play of a game (free tier).

import { GameKey, tryConsumePlay } from "@/lib/play-limits";

export async function consumePlayAction(
  game: GameKey,
): Promise<{ allowed: boolean; remaining: number; isMember: boolean }> {
  return tryConsumePlay(game);
}
