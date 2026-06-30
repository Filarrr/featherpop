"use client";

import { FormEvent, useState, useTransition } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Reward } from "@/lib/game-data";
import { saveGlobalRewardsAction } from "@/lib/global-content-actions";

const blank = (): Reward => ({
  id: `r-${Date.now().toString(36)}`,
  name: "",
  featherpopRequired: 5,
  type: "event",
  description: "",
  active: true,
});

export function AdminRewardsManager({ initial }: { initial: Reward[] }) {
  const [items, setItems] = useState<Reward[]>(initial);
  const [draft, setDraft] = useState<Reward>(blank());
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  // Persist the whole list globally (owner account). Optimistically updates
  // local state, then writes through the server action.
  function persist(next: Reward[]) {
    setItems(next);
    setStatus("Saving…");
    startTransition(async () => {
      const res = await saveGlobalRewardsAction(next);
      setStatus(res.ok ? "Saved for everyone ✓" : `Error: ${res.reason}`);
    });
  }

  function edit(r: Reward) {
    setDraft({ ...r });
  }
  function reset() {
    setDraft(blank());
  }
  function remove(id: string) {
    if (!confirm("Delete this reward for ALL families?")) return;
    persist(items.filter((r) => r.id !== id));
    reset();
  }
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const idx = items.findIndex((x) => x.id === draft.id);
    const next =
      idx >= 0
        ? items.map((x) => (x.id === draft.id ? draft : x))
        : [...items, draft];
    persist(next);
    reset();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
      <section className="card">
        <span className="kicker">Rewards · global</span>
        <h2 className="h-display mt-2 text-3xl">All rewards</h2>
        <p className="text-sm text-[var(--ink-soft)]">
          These are shared by every family. Changes save instantly.
        </p>
        {status ? (
          <p className="mt-2 text-sm font-bold" aria-live="polite">
            {status}
          </p>
        ) : null}

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
                      disabled={pending}
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
          <label className="flex items-center gap-2 text-sm font-bold">
            <input
              type="checkbox"
              checked={draft.printable ?? false}
              onChange={(e) =>
                setDraft({ ...draft, printable: e.target.checked })
              }
            />
            Printable certificate
          </label>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input
              type="checkbox"
              checked={draft.memberOnly ?? false}
              onChange={(e) =>
                setDraft({ ...draft, memberOnly: e.target.checked })
              }
            />
            Members only
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button type="submit" className="btn btn-primary" disabled={pending}>
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
