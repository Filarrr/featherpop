"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import {
  ADMIN_PASSWORD,
  isAdminAuthed,
  setAdminAuthed,
} from "@/lib/admin-store";

export function AdminGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setAuthed(isAdminAuthed());
    setReady(true);
  }, []);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAdminAuthed(true);
      setAuthed(true);
      setError("");
      setPassword("");
    } else {
      setError("Wrong password.");
    }
  }

  function logout() {
    setAdminAuthed(false);
    setAuthed(false);
  }

  if (!ready) return null;

  if (!authed) {
    return (
      <main className="page">
        <section className="card mx-auto max-w-md">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--purple)] text-white">
            <ShieldCheck aria-hidden className="h-6 w-6" />
          </div>
          <span className="kicker mt-3">Admin</span>
          <h1 className="h-display mt-2 text-3xl">Sign in</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Enter the admin password to manage challenges and rewards.
          </p>
          <form onSubmit={submit} className="mt-5 grid gap-3">
            <label className="field">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </label>
            {error ? (
              <p className="text-sm font-bold text-[var(--pink)]">{error}</p>
            ) : null}
            <button type="submit" className="btn btn-primary">
              <LogIn aria-hidden className="h-5 w-5" />
              Sign in
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <>
      <div className="no-print mx-auto flex max-w-6xl items-center justify-end px-4 pt-4">
        <button onClick={logout} className="btn btn-ghost btn-sm">
          <LogOut aria-hidden className="h-4 w-4" />
          Sign out
        </button>
      </div>
      {children}
    </>
  );
}
