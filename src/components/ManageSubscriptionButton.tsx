"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";

// Stripe's no-code portal login page (activated in the Stripe dashboard,
// 2026-07-11). Used as a fallback when we can't mint a direct portal
// session (e.g. no stored customer id) — the parent signs in there with
// their billing email and can cancel just the same.
const PORTAL_LOGIN_URL =
  process.env.NEXT_PUBLIC_STRIPE_PORTAL_URL ??
  "https://billing.stripe.com/p/login/3cIcN51HMdJL0Aa0Zb6c000";

/**
 * Opens the Stripe Billing Portal, where a parent can update their card
 * or cancel the membership. Shown on the account page for subscribers.
 */
export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function open() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
    } catch {
      /* fall through to the login-link fallback */
    }
    // Direct session failed — send them to Stripe's portal login page.
    window.location.href = PORTAL_LOGIN_URL;
  }

  return (
    <button
      type="button"
      onClick={open}
      disabled={loading}
      className="btn btn-ghost btn-sm"
    >
      <CreditCard aria-hidden className="h-4 w-4" />
      {loading ? "Opening…" : "Manage / cancel subscription"}
    </button>
  );
}
