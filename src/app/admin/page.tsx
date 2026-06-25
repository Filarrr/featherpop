import Link from "next/link";
import {
  BookOpenCheck,
  Crown,
  Database,
  Egg,
  Gift,
  MapPin,
  Printer,
  Sparkles,
  Users,
} from "lucide-react";
import { resolveActiveChild } from "@/lib/active-child-server";
import { getMembership, isMemberActive } from "@/lib/membership";
import { weekKey, weeklyStations } from "@/lib/park-hunt";
import { getChildProgressAction } from "@/lib/child-progress-actions";
import { defaultChildProgress } from "@/lib/child-profile";
import { TestSeedCard } from "@/components/admin/TestSeedCard";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

// Clerk middleware already requires sign-in for /admin. The dashboard
// only ever shows the *current Clerk user's* family (their children +
// their membership) — there's no cross-account exposure here, so the
// legacy localStorage password gate isn't needed.
export default async function AdminPage() {
  // Server-side: pull current week's stations + this account's children +
  // membership state in parallel. Each kid's progress is fetched then
  // aggregated for the family overview row.
  const week = weekKey();
  const [{ children }, membership] = await Promise.all([
    resolveActiveChild(),
    getMembership(),
  ]);
  const childrenWithProgress = await Promise.all(
    children.map(async (c) => {
      const p = await getChildProgressAction(c.id).catch(() => defaultChildProgress);
      return { profile: c, progress: p };
    }),
  );

  const totalFeatherPop = childrenWithProgress.reduce(
    (s, c) => s + (c.progress.featherPop ?? 0),
    0,
  );
  const totalWords = childrenWithProgress.reduce(
    (s, c) => s + (c.progress.wordsFound ?? 0),
    0,
  );
  const totalEggs = childrenWithProgress.reduce(
    (s, c) => s + (c.progress.hatched?.length ?? 0),
    0,
  );
  const goldenFeathers = childrenWithProgress.reduce(
    (s, c) => s + (c.progress.goldenFeatherMonths?.length ?? 0),
    0,
  );

  const { stations } = weeklyStations(week);
  const member = isMemberActive(membership);

  return (
    <main className="page admin-page">
      <header className="mb-6">
        <span className="kicker">Admin · {week} (this week)</span>
        <h1 className="h-display mt-2 text-4xl md:text-5xl">
          <span className="h-gradient">Control room</span>
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">
          Manage children, monitor progress, preview the live Park Hunt
          word lists, print station QRs, and check membership status.
        </p>
      </header>

      {/* Family stats */}
      <section className="admin-stats">
        <StatCard icon={<Users />} label="Children" value={children.length} tag="on this account" color="#a76bff" />
        <StatCard icon={<Sparkles />} label="FeatherPop" value={totalFeatherPop} tag="across the family" color="#ffd14a" />
        <StatCard icon={<BookOpenCheck />} label="Words found" value={totalWords} tag="lifetime, all kids" color="#4cc4ff" />
        <StatCard icon={<Egg />} label="Eggs hatched" value={totalEggs} tag="across the family" color="#34e3a4" />
        <StatCard icon={<Crown />} label="Golden Feathers" value={goldenFeathers} tag="monthly badges earned" color="#ff7ab8" />
        <StatCard
          icon={<Crown />}
          label="Membership"
          value={member ? "Active" : "None"}
          tag={member ? `Status: ${membership.status}` : "Upgrade for printables"}
          color={member ? "#34e3a4" : "#c98a52"}
          asString
        />
      </section>

      {/* Quick actions */}
      <section className="admin-actions">
        <Link href="/print/park-hunt-qrs" className="card admin-action-card">
          <div className="admin-action-icon" style={{ background: "linear-gradient(135deg, #a76bff, #6a2dff)" }}>
            <Printer aria-hidden className="h-6 w-6" />
          </div>
          <div>
            <h2 className="h-display mt-2 text-2xl">Print station QRs</h2>
            <p className="text-[var(--ink-soft)]">
              {member ? "Print 6 station QRs with this week's word lists." : "Members only — unlock to print."}
            </p>
          </div>
        </Link>

        <Link href="/admin/challenges" className="card admin-action-card">
          <div className="admin-action-icon" style={{ background: "linear-gradient(135deg, #ff9a3a, #ff6b3a)" }}>
            <BookOpenCheck aria-hidden className="h-6 w-6" />
          </div>
          <div>
            <h2 className="h-display mt-2 text-2xl">Legacy challenges</h2>
            <p className="text-[var(--ink-soft)]">Edit the older Word Quest seed challenges.</p>
          </div>
        </Link>

        <Link href="/admin/rewards" className="card admin-action-card">
          <div className="admin-action-icon" style={{ background: "linear-gradient(135deg, #34e3a4, #1ea672)" }}>
            <Gift aria-hidden className="h-6 w-6" />
          </div>
          <div>
            <h2 className="h-display mt-2 text-2xl">Rewards</h2>
            <p className="text-[var(--ink-soft)]">Add or edit prizes shown on /rewards.</p>
          </div>
        </Link>

        <Link href="/account/profiles" className="card admin-action-card">
          <div className="admin-action-icon" style={{ background: "linear-gradient(135deg, #ff7ab8, #ff2d8e)" }}>
            <Users aria-hidden className="h-6 w-6" />
          </div>
          <div>
            <h2 className="h-display mt-2 text-2xl">Child profiles</h2>
            <p className="text-[var(--ink-soft)]">Add a child or switch the active profile.</p>
          </div>
        </Link>
      </section>

      {/* This week's station word lists */}
      <section className="admin-section">
        <header className="admin-section-head">
          <span className="kicker">
            <MapPin aria-hidden className="h-4 w-4" />
            This week&apos;s Park Hunt words
          </span>
          <h2 className="h-display text-2xl">6 stations × 20 words</h2>
          <p className="text-[var(--ink-soft)]">
            Same set kids see this week. Rotates automatically every Monday.
          </p>
        </header>
        <div className="admin-stations-grid">
          {stations.map((words, i) => (
            <article key={i} className="admin-station-card">
              <h3>Station {i + 1}</h3>
              <ol>
                {words.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      {/* Children overview */}
      <section className="admin-section">
        <header className="admin-section-head">
          <span className="kicker">
            <Users aria-hidden className="h-4 w-4" />
            Children
          </span>
          <h2 className="h-display text-2xl">Per-kid progress</h2>
        </header>
        {childrenWithProgress.length === 0 ? (
          <p className="text-[var(--ink-soft)]">
            No children yet.{" "}
            <Link href="/account/profiles" style={{ color: "var(--gold)", fontWeight: 800 }}>
              Add one →
            </Link>
          </p>
        ) : (
          <div className="admin-children-grid">
            {childrenWithProgress.map(({ profile, progress }) => (
              <article key={profile.id} className="admin-child-card">
                <h3>{profile.nickname}</h3>
                <ul>
                  <li><span>FeatherPop</span> <strong>{progress.featherPop}</strong></li>
                  <li><span>Words found</span> <strong>{progress.wordsFound ?? 0}</strong></li>
                  <li><span>Words this month</span> <strong>{progress.wordsThisMonth ?? 0}</strong></li>
                  <li><span>Eggs hatched</span> <strong>{progress.hatched?.length ?? 0}</strong></li>
                  <li><span>Free spins</span> <strong>{progress.freeSpins ?? 0}</strong></li>
                  <li><span>Streak</span> <strong>{progress.streakDays}d</strong></li>
                  <li><span>Golden Feathers</span> <strong>{progress.goldenFeatherMonths?.length ?? 0}</strong></li>
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>

      <TestSeedCard />

      <section className="admin-section">
        <header className="admin-section-head">
          <span className="kicker">
            <Database aria-hidden className="h-4 w-4" />
            System
          </span>
          <h2 className="h-display text-2xl">Where data lives</h2>
        </header>
        <p className="text-[var(--ink-soft)]">
          Children + per-child progress: Clerk privateMetadata.
          Membership status: Clerk publicMetadata.membership (written by
          the Stripe webhook). Park Hunt word lists are deterministic from
          the week key — no DB write needed.
        </p>
      </section>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  tag,
  color,
  asString,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tag: string;
  color: string;
  asString?: boolean;
}) {
  return (
    <article className="admin-stat-card" style={{ ["--stat-color" as string]: color }}>
      <div className="admin-stat-icon">{icon}</div>
      <span className="admin-stat-label">{label}</span>
      <span className="admin-stat-value">
        {asString ? value : (value as number).toLocaleString()}
      </span>
      <span className="admin-stat-tag">{tag}</span>
    </article>
  );
}
