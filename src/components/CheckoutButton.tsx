"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export function CheckoutButton({ priceLabel }: { priceLabel: string }) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function start() {
    setErr(null);
    if (!isSignedIn) {
      router.push("/sign-up?redirect_url=/membership");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setErr(data.error ?? "Could not start checkout");
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
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className="btn btn-gold btn-lg"
      >
        <Sparkles aria-hidden className="h-5 w-5" />
        {loading ? "Opening checkout…" : `Start 3-day free trial · ${priceLabel}`}
      </button>
      {err ? <p className="text-sm font-bold text-red-300">{err}</p> : null}
      <p className="text-xs text-[var(--ink-soft)]">
        Cancel any time during the trial — you won&apos;t be charged.
      </p>
    </div>
  );
}
