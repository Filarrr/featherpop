"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import type { ChildProfile } from "@/lib/child-profile";
import {
  bumpChildrenVersion,
  setActiveChildIdGlobal,
  useActiveChild,
} from "@/lib/use-active-child";

const AVATAR_OPTIONS = [
  "kid-ari",
  "kid-bee",
  "kid-kai",
  "kid-lila",
  "kid-mo",
  "kid-zara",
];

export function ProfilePicker({
  children,
  addAction,
  removeAction,
}: {
  children: ChildProfile[];
  addAction: (fd: FormData) => Promise<{ id: string } | null>;
  removeAction: (fd: FormData) => Promise<{ removedId: string } | null>;
}) {
  const router = useRouter();
  const { activeChildId, setActiveChildId } = useActiveChild();
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState<string>(AVATAR_OPTIONS[0]);
  const [busy, setBusy] = useState(false);

  async function handleAdd(fd: FormData) {
    setBusy(true);
    try {
      const result = await addAction(fd);
      if (result?.id) {
        setActiveChildIdGlobal(result.id);
        bumpChildrenVersion();
      }
      setNickname("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(fd: FormData) {
    setBusy(true);
    try {
      const result = await removeAction(fd);
      if (result?.removedId && result.removedId === activeChildId) {
        setActiveChildIdGlobal(null);
      }
      bumpChildrenVersion();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="profile-picker">
      <section className="profile-list">
        {children.length === 0 ? (
          <p className="text-[var(--ink-soft)]">No children yet — add one below.</p>
        ) : (
          children.map((c) => {
            const isActive = c.id === activeChildId;
            return (
              <article
                key={c.id}
                className={`profile-card ${isActive ? "is-active" : ""}`}
              >
                <div className="profile-card-avatar">
                  <Image
                    src={`/media/avatars/${c.avatar ?? "kid-ari"}-wave.png`}
                    alt=""
                    width={96}
                    height={96}
                    unoptimized
                  />
                </div>
                <strong>{c.nickname}</strong>
                <div className="profile-card-actions">
                  <button
                    type="button"
                    className="btn btn-gold btn-sm"
                    onClick={() => setActiveChildId(c.id)}
                  >
                    {isActive ? (
                      <>
                        <Check aria-hidden className="h-4 w-4" />
                        Active
                      </>
                    ) : (
                      "Set active"
                    )}
                  </button>
                  <form action={handleRemove}>
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      type="submit"
                      className="btn btn-ghost btn-sm"
                      disabled={busy}
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </article>
            );
          })
        )}
      </section>

      <section className="profile-add card mt-4">
        <h2 className="h-display text-2xl">Add a child</h2>
        <form action={handleAdd} className="mt-3 grid gap-3">
          <label className="grid gap-1">
            <span className="kicker">Nickname</span>
            <input
              required
              name="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              className="profile-input"
              placeholder="e.g. Sam"
            />
          </label>
          <div>
            <span className="kicker">Pick an avatar</span>
            <div className="avatar-options">
              {AVATAR_OPTIONS.map((a) => (
                <label
                  key={a}
                  className={`avatar-option ${avatar === a ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="avatar"
                    value={a}
                    checked={avatar === a}
                    onChange={() => setAvatar(a)}
                  />
                  <Image
                    src={`/media/avatars/${a}-wave.png`}
                    alt={a}
                    width={64}
                    height={64}
                    unoptimized
                  />
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-gold" disabled={busy}>
            {busy ? "Saving…" : "Add child"}
          </button>
        </form>
      </section>
    </div>
  );
}
