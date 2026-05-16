"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { readProfile, saveProfile } from "@/lib/player";
import { speak } from "@/lib/audio";

export function StartQuest() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    setHasProfile(!!readProfile());
  }, []);

  function go() {
    if (hasProfile) {
      router.push("/intro");
      return;
    }
    setOpen(true);
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = nickname.trim() || "Word Explorer";
    saveProfile({ nickname: trimmed, createdAt: new Date().toISOString() });
    speak(`Welcome, ${trimmed}!`);
    setOpen(false);
    router.push("/intro");
  }

  function skip() {
    saveProfile({
      nickname: "Word Explorer",
      createdAt: new Date().toISOString(),
    });
    setOpen(false);
    router.push("/intro");
  }

  return (
    <>
      <button type="button" onClick={go} className="btn btn-primary btn-lg">
        <Sparkles aria-hidden className="h-5 w-5" />
        Start the Quest
        <ArrowRight aria-hidden className="h-5 w-5" />
      </button>

      {open ? (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <form
            className="modal"
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="kicker">Quest pass</p>
                <h2 className="h-display mt-2 text-3xl">
                  What should we call you?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="icon-btn"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Use any first name or fun nickname. We never collect emails.
            </p>

            <label className="field mt-5">
              Nickname
              <input
                autoFocus
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Ari, Bee, Star"
                maxLength={24}
              />
            </label>

            <div className="mt-5 grid gap-2">
              <button type="submit" className="btn btn-primary">
                Begin Adventure
                <ArrowRight aria-hidden className="h-5 w-5" />
              </button>
              <button type="button" onClick={skip} className="btn btn-ghost">
                Skip for now
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
