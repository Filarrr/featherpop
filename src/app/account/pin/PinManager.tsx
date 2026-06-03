"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ShieldCheck, Trash2 } from "lucide-react";
import {
  clearParentPinAction,
  setParentPinAction,
} from "./actions";

export function PinManager({ hasPin }: { hasPin: boolean }) {
  const [state, action, pending] = useActionState(setParentPinAction, null);

  return (
    <div className="grid gap-4">
      <section className="card">
        <span className="kicker">
          <ShieldCheck aria-hidden className="h-4 w-4" />
          Parent PIN
        </span>
        <h1 className="h-display mt-2 text-3xl">
          {hasPin ? "Change parent PIN" : "Set a parent PIN"}
        </h1>
        <p className="text-[var(--ink-soft)]">
          4–6 digits. The PIN is required to approve missions that need a
          grown-up. Stored hashed (scrypt) in your private account metadata —
          never sent to the child&apos;s device.
        </p>

        <form action={action} className="mt-4 grid gap-3 max-w-sm">
          <label className="grid gap-1">
            <span className="kicker">New PIN</span>
            <input
              required
              type="password"
              name="pin"
              inputMode="numeric"
              pattern="\d{4,6}"
              minLength={4}
              maxLength={6}
              className="profile-input"
              autoComplete="new-password"
            />
          </label>
          <label className="grid gap-1">
            <span className="kicker">Confirm PIN</span>
            <input
              required
              type="password"
              name="confirm"
              inputMode="numeric"
              pattern="\d{4,6}"
              minLength={4}
              maxLength={6}
              className="profile-input"
              autoComplete="new-password"
            />
          </label>
          {state?.error ? (
            <p className="pinpad-error" role="alert">
              {state.error}
            </p>
          ) : null}
          {state?.ok ? (
            <p style={{ color: "var(--mint)", fontWeight: 700 }}>
              PIN saved.
            </p>
          ) : null}
          <button
            type="submit"
            className="btn btn-gold"
            disabled={pending}
          >
            {pending ? "Saving…" : hasPin ? "Update PIN" : "Save PIN"}
          </button>
        </form>
      </section>

      {hasPin ? (
        <section className="card">
          <span className="kicker">Danger zone</span>
          <h2 className="h-display mt-2 text-xl">Remove PIN</h2>
          <p className="text-[var(--ink-soft)]">
            Removing the PIN means parent-approval missions will block until you
            set a new one.
          </p>
          <form
            action={async () => {
              await clearParentPinAction();
            }}
            className="mt-3"
          >
            <button type="submit" className="btn btn-ghost">
              <Trash2 aria-hidden className="h-4 w-4" />
              Remove PIN
            </button>
          </form>
        </section>
      ) : null}

      <Link href="/account/profiles" className="btn btn-ghost btn-sm w-fit">
        Back to profiles
      </Link>
    </div>
  );
}
