"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import {
  listChallenges,
  removeChallenge,
  upsertChallenge,
} from "@/lib/admin-store";
import { Challenge } from "@/lib/game-data";

const blank = (): Challenge => ({
  id: `qr-${Date.now().toString(36)}`,
  slug: "",
  qrLabel: "QR · ?",
  mainLetter: "",
  letters: [],
  targetWord: "",
  bonusWords: [],
  hint: "",
  featherpopValue: 4,
  zone: "",
  introVideoUrl: "",
  active: true,
});

export function AdminChallengeManager() {
  const [items, setItems] = useState<Challenge[]>([]);
  const [draft, setDraft] = useState<Challenge>(blank());

  useEffect(() => setItems(listChallenges()), []);

  function refresh() {
    setItems(listChallenges());
  }

  function edit(c: Challenge) {
    setDraft({
      ...c,
      letters: [...c.letters],
      bonusWords: [...c.bonusWords],
      introVideoUrl: c.introVideoUrl ?? "",
    });
  }

  function reset() {
    setDraft(blank());
  }

  function remove(id: string) {
    if (!confirm("Delete this challenge?")) return;
    removeChallenge(id);
    refresh();
    reset();
  }

  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const word = draft.targetWord.toUpperCase();
    const cleanLetters =
      draft.letters.length > 0
        ? draft.letters.map((l) => l.toUpperCase())
        : word.split("");
    const next: Challenge = {
      ...draft,
      slug: (draft.slug || word).toLowerCase(),
      targetWord: word,
      mainLetter: (draft.mainLetter || word[0] || "?").toUpperCase(),
      letters: cleanLetters,
      bonusWords: draft.bonusWords.map((w) => w.toUpperCase()).filter(Boolean),
      introVideoUrl: (draft.introVideoUrl || "").trim() || undefined,
    };
    upsertChallenge(next);
    refresh();
    reset();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
      <section className="card">
        <span className="kicker">Challenges</span>
        <h2 className="h-display mt-2 text-3xl">All challenges</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Word</th>
                <th>Slug</th>
                <th>Letters</th>
                <th>Zone</th>
                <th>Value</th>
                <th>Video</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.targetWord}</strong>
                  </td>
                  <td>{c.slug}</td>
                  <td>{c.letters.join(" ")}</td>
                  <td>{c.zone}</td>
                  <td>+{c.featherpopValue}</td>
                  <td>{c.introVideoUrl ? "Yes" : "—"}</td>
                  <td>{c.active ? "Yes" : "No"}</td>
                  <td className="flex gap-1">
                    <button
                      onClick={() => edit(c)}
                      className="btn btn-ghost btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(c.id)}
                      className="btn btn-danger btn-sm"
                      aria-label={`Delete ${c.targetWord}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="card">
        <span className="kicker">Editor</span>
        <h2 className="h-display mt-2 text-2xl">
          {items.some((c) => c.id === draft.id) ? "Edit" : "Add"} challenge
        </h2>

        <form onSubmit={save} className="mt-4 grid gap-3">
          <label className="field">
            Target word
            <input
              required
              value={draft.targetWord}
              onChange={(e) =>
                setDraft({ ...draft, targetWord: e.target.value })
              }
              placeholder="e.g. RAINBOW"
            />
          </label>
          <label className="field">
            Slug (URL)
            <input
              value={draft.slug}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              placeholder="auto from word"
            />
          </label>
          <label className="field">
            Main letter
            <input
              maxLength={1}
              value={draft.mainLetter}
              onChange={(e) =>
                setDraft({ ...draft, mainLetter: e.target.value })
              }
            />
          </label>
          <label className="field">
            Letters (space separated, include distractors)
            <input
              value={draft.letters.join(" ")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  letters: e.target.value
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((s) => s[0]),
                })
              }
              placeholder="e.g. R A I N B O W S T D"
            />
          </label>
          <label className="field">
            Bonus words (comma separated)
            <input
              value={draft.bonusWords.join(", ")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  bonusWords: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="RAIN, BOW, BARN"
            />
          </label>
          <label className="field">
            Zone
            <input
              value={draft.zone}
              onChange={(e) => setDraft({ ...draft, zone: e.target.value })}
            />
          </label>
          <label className="field">
            QR label
            <input
              value={draft.qrLabel}
              onChange={(e) => setDraft({ ...draft, qrLabel: e.target.value })}
            />
          </label>
          <label className="field">
            Intro video URL (optional)
            <input
              value={draft.introVideoUrl ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, introVideoUrl: e.target.value })
              }
              placeholder="/media/intros/rainbow.mp4"
            />
          </label>
          <label className="field">
            Hint
            <input
              value={draft.hint}
              onChange={(e) => setDraft({ ...draft, hint: e.target.value })}
            />
          </label>
          <label className="field">
            FeatherPop value
            <input
              type="number"
              min={1}
              value={draft.featherpopValue}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  featherpopValue: Number(e.target.value) || 1,
                })
              }
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
            />
            Active
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button type="submit" className="btn btn-primary">
              <Save aria-hidden className="h-4 w-4" />
              Save
            </button>
            <button type="button" onClick={reset} className="btn btn-ghost">
              <Plus aria-hidden className="h-4 w-4" />
              New
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
