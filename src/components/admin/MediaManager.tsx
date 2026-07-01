"use client";

import { FormEvent, useState, useTransition } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { MediaItem } from "@/lib/game-data";
import {
  saveGlobalSongsAction,
  saveGlobalVideosAction,
} from "@/lib/global-content-actions";

/**
 * Owner editor for the global video/song lists. Paste a title + a link
 * (TikTok, YouTube, anything https). Saves for every family.
 */
export function MediaManager({
  initial,
  kind,
}: {
  initial: MediaItem[];
  kind: "video" | "song";
}) {
  const [items, setItems] = useState<MediaItem[]>(initial);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  const save = kind === "video" ? saveGlobalVideosAction : saveGlobalSongsAction;
  const noun = kind === "video" ? "video" : "song";

  function persist(next: MediaItem[]) {
    setItems(next);
    setStatus("Saving…");
    startTransition(async () => {
      const res = await save(next);
      setStatus(res.ok ? "Saved for everyone ✓" : `Error: ${res.reason}`);
    });
  }

  function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !/^https?:\/\//i.test(url.trim())) {
      setStatus("Enter a title and a valid https link.");
      return;
    }
    persist([
      ...items,
      { id: `m-${Date.now().toString(36)}`, title: title.trim(), url: url.trim() },
    ]);
    setTitle("");
    setUrl("");
  }

  function remove(id: string) {
    if (!confirm(`Remove this ${noun}?`)) return;
    persist(items.filter((m) => m.id !== id));
  }

  return (
    <section className="card">
      <span className="kicker">
        {kind === "video" ? "Videos" : "Songs"} · global
      </span>
      <h2 className="h-display mt-2 text-2xl">
        {kind === "video" ? "Videos" : "Songs"}
      </h2>
      <p className="text-sm text-[var(--ink-soft)]">
        Add a title and a link (TikTok, YouTube, etc.). Kids see these on the{" "}
        {kind === "video" ? "Story Time" : "Music"} page.
      </p>
      {status ? (
        <p className="mt-2 text-sm font-bold" aria-live="polite">
          {status}
        </p>
      ) : null}

      <ul className="admin-media-list mt-3">
        {items.length === 0 ? (
          <li className="text-[var(--ink-soft)]">No {noun}s yet.</li>
        ) : (
          items.map((m) => (
            <li key={m.id} className="admin-media-row">
              <span className="admin-media-info">
                <strong>{m.title}</strong>
                <a href={m.url} target="_blank" rel="noreferrer">
                  {m.url}
                </a>
              </span>
              <button
                type="button"
                onClick={() => remove(m.id)}
                className="btn btn-danger btn-sm"
                disabled={pending}
                aria-label={`Remove ${m.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))
        )}
      </ul>

      <form onSubmit={add} className="mt-4 grid gap-2">
        <label className="field">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={kind === "video" ? "Feather Dance #1" : "Sunshine Song"}
          />
        </label>
        <label className="field">
          Link (https)
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@msfeatherpop/video/…"
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          <Plus aria-hidden className="h-4 w-4" />
          Add {noun}
        </button>
        <p className="text-xs text-[var(--ink-soft)]">
          <Save aria-hidden className="mr-1 inline h-3 w-3" />
          Changes save automatically for every family.
        </p>
      </form>
    </section>
  );
}
