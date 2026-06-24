"use client";

// Watches the URL pathname and tears down every audio source we own
// the moment it changes. Without this, the procedural-music loop and
// any in-flight voice clip would carry over from a game page (Letter
// Pop, Feather Sort, Park Hunt, Music) into whatever the kid navigated
// to next — observed in the wild as "I left the game but the music
// is still playing on /progress."
//
// Mounted exactly once from the root layout so every route change
// runs through it.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { stopAllAudio } from "@/lib/audio";

export function AudioNavCleanup() {
  const pathname = usePathname();
  useEffect(() => {
    stopAllAudio();
  }, [pathname]);
  return null;
}
