"use client";

import { FormEvent, useState, useTransition } from "react";
import { Mail } from "lucide-react";
import { subscribeMailingListAction } from "@/lib/mailing-list-actions";

export function MailingListForm() {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await subscribeMailingListAction(email);
      if (res.ok) {
        setDone(true);
        setEmail("");
      } else {
        setError(res.reason);
      }
    });
  }

  if (done) {
    return (
      <p className="mailing-list-done" role="status">
        🎉 You&apos;re on the list — we&apos;ll be in touch when Premium
        launches!
      </p>
    );
  }

  return (
    <form className="mailing-list-form" onSubmit={submit}>
      <label className="sr-only" htmlFor="ml-email">
        Email address
      </label>
      <input
        id="ml-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-gold" disabled={pending}>
        <Mail aria-hidden className="h-4 w-4" />
        {pending ? "Joining…" : "Join the list"}
      </button>
      {error ? (
        <p className="mailing-list-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
