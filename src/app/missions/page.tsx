"use client";

import Link from "next/link";
import { Camera, Sparkles } from "lucide-react";
import { useActiveChild } from "@/lib/use-active-child";
import { FEATHER_META } from "@/lib/levels";
import { getMission } from "@/lib/missions";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";

function timeAgo(at: number) {
  const s = Math.floor((Date.now() - at) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function MissionsPage() {
  const { progress, activeChildId } = useActiveChild();

  return (
    <main className="page">
      <section className="card">
        <span className="kicker">
          <Sparkles aria-hidden className="h-4 w-4" />
          Recent missions
        </span>
        <h1 className="h-display mt-2 text-3xl">
          <span className="h-gradient">Your adventure log</span>
        </h1>
        <p className="text-[var(--ink-soft)]">
          {activeChildId
            ? "Every QR scan is a new mission. Here are your latest fifty."
            : "Pick a child profile to start logging missions."}
        </p>
        <Link href="/scan" className="btn btn-sky btn-sm mt-3">
          <Camera aria-hidden className="h-4 w-4" />
          Scan a QR
        </Link>
      </section>

      {activeChildId ? (
        progress.history.length === 0 ? (
          <section className="empty-state mt-6">
            <div className="empty-state-art">
              <MsFeatherPopAvatar pose="wave" size={120} />
            </div>
            <h2 className="h-display text-2xl">No missions yet</h2>
            <p>Scan your first QR to start an adventure!</p>
            <div className="empty-state-actions">
              <Link href="/scan" className="btn btn-gold">
                <Camera aria-hidden className="h-4 w-4" />
                Open scanner
              </Link>
            </div>
          </section>
        ) : (
          <section className="mission-log mt-6">
            {progress.history.map((entry, i) => {
              const m = getMission(entry.id);
              const meta = FEATHER_META[entry.feather];
              return (
                <article
                  key={`${entry.at}-${i}`}
                  className="mission-log-row"
                  style={{
                    ["--feather-color" as string]: meta.color,
                    ["--feather-glow" as string]: meta.glow,
                    animationDelay: `${Math.min(i, 8) * 60}ms`,
                  }}
                >
                  <div className="mission-log-orb" aria-hidden />
                  <div className="mission-log-body">
                    <strong>{m?.prompt ?? entry.id}</strong>
                    <small>
                      {meta.name} · +{entry.featherPop} FeatherPop ·{" "}
                      {timeAgo(entry.at)}
                    </small>
                  </div>
                </article>
              );
            })}
          </section>
        )
      ) : (
        <section className="empty-state mt-6">
          <div className="empty-state-art">
            <MsFeatherPopAvatar pose="wave" size={120} />
          </div>
          <h2 className="h-display text-2xl">Choose a child</h2>
          <p>Pick a profile so we know whose log to show.</p>
          <div className="empty-state-actions">
            <Link href="/account/profiles" className="btn btn-gold">
              Pick a child
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
