"use client";

import Link from "next/link";
import {
  Camera,
  Feather,
  Sparkles,
  Wallet as WalletIcon,
} from "lucide-react";
import { useActiveChild } from "@/lib/use-active-child";
import { totalFeathers } from "@/lib/child-profile";
import { FEATHER_META } from "@/lib/levels";

function timeAgo(at: number) {
  const s = Math.floor((Date.now() - at) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function WalletClient() {
  const { active, progress, activeChildId } = useActiveChild();

  if (!activeChildId) {
    return (
      <section className="empty-state">
        <h2 className="h-display text-2xl">No active child</h2>
        <p>Pick a profile to see their wallet.</p>
        <div className="empty-state-actions">
          <Link href="/account/profiles" className="btn btn-gold">
            Pick a child
          </Link>
        </div>
      </section>
    );
  }

  const total = totalFeathers(progress);

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <section className="balance">
        <WalletIcon aria-hidden className="h-12 w-12 text-[var(--gold)]" />
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-white/70">
          FeatherPop wallet
        </p>
        <p className="number">{progress.featherPop}</p>
        <p className="mt-2 font-bold text-white/85">
          {active ? `${active.nickname}'s adventure` : ""}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Link href="/scan" className="btn btn-gold btn-sm">
            <Camera aria-hidden className="h-4 w-4" />
            Earn more
          </Link>
          <Link href="/rewards" className="btn btn-ghost btn-sm">
            <Sparkles aria-hidden className="h-4 w-4" />
            Spend
          </Link>
        </div>
      </section>

      <section className="card">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="kicker">
              <Feather aria-hidden className="h-4 w-4" />
              Feather totals
            </span>
            <h2 className="h-display mt-2 text-3xl">
              {total} feathers · {progress.totalMissions} missions
            </h2>
          </div>
        </div>

        <div className="row-list">
          {progress.history.length === 0 ? (
            <p className="text-[var(--ink-soft)]">
              No missions yet — scan your first QR.
            </p>
          ) : (
            progress.history.slice(0, 12).map((e, i) => {
              const m = FEATHER_META[e.feather];
              return (
                <div key={`${e.at}-${i}`} className="row">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ background: m.color }}
                      aria-hidden
                    />
                    <strong className="text-base">{m.name}</strong>
                  </span>
                  <span className="flex items-center gap-2 text-sm font-bold">
                    +{e.featherPop}
                    <span className="text-xs text-[var(--ink-soft)]">
                      {timeAgo(e.at)}
                    </span>
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
