"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import {
  listRewards,
  removeReward,
  upsertReward,
} from "@/lib/admin-store";
import { Reward } from "@/lib/game-data";

const blank = (): Reward => ({
  id: `r-${Date.now().toString(36)}`,
  name: "",
  featherpopRequired: 5,
  type: "event",
  description: "",
  active: true,
});

export function AdminRewardsManager() {
  const [items, setItems] = useState<Reward[]>([]);
  const [draft, setDraft] = useState<Reward>(blank());

  useEffect(() => setItems(listRewards()), []);

  function refresh() {
    setItems(listRewards());
  }
  function edit(r: Reward) {
    setDraft({ ...r });
  }
  function reset() {
    setDraft(blank());
  }
  function remove(id: string) {
    if (!confirm("Delete this reward?")) return;
    removeReward(id);
    refresh();
    reset();
  }
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    upsertReward(draft);
    refresh();
    reset();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
      <section className="card">
        <span className="kicker">Rewards</span>
        <h2 className="h-display mt-2 text-3xl">All rewards</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Required</th>
                <th>Type</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.name}</strong>
                    <p className="text-xs text-[var(--ink-soft)]">
                      {r.description}
                    </p>
                  </td>
                  <td>{r.featherpopRequired}</td>
                  <td>{r.type}</td>
                  <td>{r.active ? "Yes" : "No"}</td>
                  <td className="flex gap-1">
                    <button
                      onClick={() => edit(r)}
                      className="btn btn-ghost btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="btn btn-danger btn-sm"
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
          {items.some((r) => r.id === draft.id) ? "Edit" : "Add"} reward
        </h2>

        <form onSubmit={save} className="mt-4 grid gap-3">
          <label className="field">
            Name
            <input
              required
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
          <label className="field">
            Description
            <input
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
          </label>
          <label className="field">
            FeatherPop required
            <input
              type="number"
              min={1}
              value={draft.featherpopRequired}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  featherpopRequired: Number(e.target.value) || 1,
                })
              }
            />
          </label>
          <label className="field">
            Type
            <select
              value={draft.type}
              onChange={(e) =>
                setDraft({ ...draft, type: e.target.value as Reward["type"] })
              }
            >
              <option value="event">event</option>
              <option value="park">park</option>
              <option value="home">home</option>
            </select>
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
