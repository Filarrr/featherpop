"use client";

import { useEffect, useState } from "react";
import { Music, Play } from "lucide-react";
import { MediaItem } from "@/lib/game-data";
import { getSongsAction, getVideosAction } from "@/lib/global-content-actions";

/**
 * Lists the owner's videos or songs (from the admin panel) as tap-to-open
 * cards. Real watch-tracking on TikTok/YouTube isn't possible, so the +5
 * daily bonus (DailyBonusCard) is the honor-system reward for watching.
 */
export function MediaGrid({ kind }: { kind: "video" | "song" }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await (kind === "video"
        ? getVideosAction()
        : getSongsAction()
      ).catch(() => []);
      if (!cancelled) setItems(res);
    })();
    return () => {
      cancelled = true;
    };
  }, [kind]);

  if (items === null) {
    return <p className="media-grid-loading">Loading…</p>;
  }
  if (items.length === 0) {
    return null; // nothing added yet — keep the page clean
  }

  return (
    <section className="media-grid-section">
      <h2 className="media-grid-title">
        {kind === "video" ? "🎬 Watch" : "🎵 Listen"}
      </h2>
      <div className="media-grid">
        {items.map((m) => (
          <a
            key={m.id}
            href={m.url}
            target="_blank"
            rel="noreferrer"
            className="media-card"
          >
            <span className="media-card-icon" aria-hidden>
              {kind === "video" ? (
                <Play className="h-6 w-6" />
              ) : (
                <Music className="h-6 w-6" />
              )}
            </span>
            <span className="media-card-title">{m.title}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
