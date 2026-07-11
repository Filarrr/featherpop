"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";

/**
 * Opens the Stripe Billing Portal, where a parent can update their card
 * or cancel the membership. Shown on the account page for subscribers.
 */
export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function open() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setErr(data.error ?? "Could not open the billing page");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      setErr((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={loading}
        className="btn btn-ghost btn-sm"
      >
        <CreditCard aria-hidden className="h-4 w-4" />
        {loading ? "Opening…" : "Manage / cancel subscription"}
      </button>
      {err ? <p className="text-sm font-bold text-red-400">{err}</p> : null}
    </>
  );
}
