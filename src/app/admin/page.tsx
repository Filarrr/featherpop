"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpenCheck, Database, Gift, RefreshCcw } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";
import { listChallenges, listRewards, resetContent } from "@/lib/admin-store";

function Dashboard() {
  const [stats, setStats] = useState({
    challenges: 0,
    activeChallenges: 0,
    rewards: 0,
  });

  useEffect(() => {
    const c = listChallenges();
    const r = listRewards();
    setStats({
      challenges: c.length,
      activeChallenges: c.filter((x) => x.active).length,
      rewards: r.length,
    });
  }, []);

  function reset() {
    if (!confirm("Reset all challenges and rewards to defaults?")) return;
    resetContent();
    location.reload();
  }

  return (
    <main className="page">
      <header className="mb-6">
        <span className="kicker">Admin</span>
        <h1 className="h-display mt-2 text-4xl md:text-5xl">
          <span className="h-gradient">Word Quest control</span>
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">
          Manage challenges and rewards. Currently backed by browser storage —
          Supabase sync arrives in the next milestone.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/challenges" className="card">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--magenta)] text-white">
            <BookOpenCheck className="h-6 w-6" />
          </div>
          <h2 className="h-display mt-4 text-2xl">Challenges</h2>
          <p className="text-[var(--ink-soft)]">
            {stats.activeChallenges} active · {stats.challenges} total
          </p>
        </Link>

        <Link href="/admin/rewards" className="card">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--mint)] text-[var(--ink)]">
            <Gift className="h-6 w-6" />
          </div>
          <h2 className="h-display mt-4 text-2xl">Rewards</h2>
          <p className="text-[var(--ink-soft)]">{stats.rewards} configured</p>
        </Link>

        <div className="card card-deep">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-[var(--gold)]">
            <Database className="h-6 w-6" />
          </div>
          <h2 className="h-display mt-4 text-2xl">Data</h2>
          <p className="text-white/75">
            Clear local overrides and restore default content.
          </p>
          <button onClick={reset} className="btn btn-gold mt-4 self-start">
            <RefreshCcw aria-hidden className="h-4 w-4" />
            Reset to defaults
          </button>
        </div>
      </section>
    </main>
  );
}

export default function AdminPage() {
  return (
    <AdminGate>
      <Dashboard />
    </AdminGate>
  );
}
