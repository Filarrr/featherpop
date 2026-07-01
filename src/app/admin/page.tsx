import Link from "next/link";
import {
  BookOpenCheck,
  Crown,
  Database,
  Egg,
  Gift,
  Lock,
  MapPin,
  Printer,
  Sparkles,
  Users,
} from "lucide-react";
import { clerkClient } from "@clerk/nextjs/server";
import { isMemberActive, type MembershipStatus } from "@/lib/membership";
import { weekKey, weeklyStations } from "@/lib/park-hunt";
import { isOwner, ownerEmails } from "@/lib/owner";
import { getGlobalWordBank } from "@/lib/global-content";
import { getMailingList } from "@/lib/mailing-list";
import { MailingListPanel } from "@/components/admin/MailingListPanel";
import type { ChildProfile, ChildProgress } from "@/lib/child-profile";
import { TestSeedCard } from "@/components/admin/TestSeedCard";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

interface FamilyRow {
  userId: string;
  label: string;
  email: string;
  childCount: number;
  featherPop: number;
  words: number;
  eggs: number;
  golden: number;
  member: boolean;
  status: MembershipStatus;
}

/**
 * Owner-wide control room. Unlike the old per-account dashboard, this reads
 * EVERY family on the platform (gated to OWNER_EMAILS) so the owner has one
 * place to see all activity, preview the live Park Hunt words, and print
 * station QRs. Clerk middleware already requires sign-in; isOwner() narrows
 * that to the owner account(s).
 */
export default async function AdminPage() {
  const owner = await isOwner();

  if (!owner) {
    return (
      <main className="page">
        <section className="card mx-auto max-w-md text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--purple)] text-white">
            <Lock aria-hidden className="h-6 w-6" />
          </div>
          <span className="kicker mt-3">Owners only</span>
          <h1 className="h-display mt-2 text-3xl">Control room</h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            This area is for the Ms. Feather Pop owner account. Sign in with
            the owner login ({ownerEmails().join(", ")}) to manage the
            platform.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href="/" className="btn btn-gold">
              Back home
            </Link>
            <Link href="/account/profiles" className="btn btn-ghost">
              Manage your children
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const week = weekKey();
  const bank = await getGlobalWordBank();
  const { stations } = weeklyStations(week, bank);
  const mailingList = await getMailingList();

  // Pull every family. limit 100 covers the MVP; if there are more we flag it.
  const client = await clerkClient();
  const { data: users, totalCount } = await client.users.getUserList({
    limit: 100,
    orderBy: "-created_at",
  });

  const families: FamilyRow[] = users.map((u) => {
    const children = (u.publicMetadata?.children ?? []) as ChildProfile[];
    const progressMap = (u.privateMetadata?.childProgress ?? {}) as Record<
      string,
      ChildProgress
    >;
    const progresses = Object.values(progressMap);
    const featherPop = progresses.reduce((s, p) => s + (p.featherPop ?? 0), 0);
    const words = progresses.reduce((s, p) => s + (p.wordsFound ?? 0), 0);
    const eggs = progresses.reduce((s, p) => s + (p.hatched?.length ?? 0), 0);
    const golden = progresses.reduce(
      (s, p) => s + (p.goldenFeatherMonths?.length ?? 0),
      0,
    );
    const membership = (u.publicMetadata?.membership ?? {}) as {
      status?: MembershipStatus;
    };
    const status: MembershipStatus = membership.status ?? "none";
    const email = u.emailAddresses?.[0]?.emailAddress ?? "—";
    const name =
      [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || email;
    return {
      userId: u.id,
      label: name,
      email,
      childCount: Array.isArray(children) ? children.length : 0,
      featherPop,
      words,
      eggs,
      golden,
      member: isMemberActive({ status }),
      status,
    };
  });

  const totals = families.reduce(
    (acc, f) => {
      acc.children += f.childCount;
      acc.featherPop += f.featherPop;
      acc.words += f.words;
      acc.eggs += f.eggs;
      acc.golden += f.golden;
      acc.members += f.member ? 1 : 0;
      return acc;
    },
    { children: 0, featherPop: 0, words: 0, eggs: 0, golden: 0, members: 0 },
  );

  return (
    <main className="page admin-page">
      <header className="mb-6">
        <span className="kicker">Owner control room · {week} (this week)</span>
        <h1 className="h-display mt-2 text-4xl md:text-5xl">
          <span className="h-gradient">Everything, everywhere</span>
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">
          Every family on Ms. Feather Pop in one place. Monitor activity,
          manage global content, preview this week&apos;s Park Hunt words, and
          print station QRs.
        </p>
      </header>

      {/* Platform-wide stats */}
      <section className="admin-stats">
        <StatCard icon={<Users />} label="Families" value={families.length} tag="accounts signed up" color="#a76bff" />
        <StatCard icon={<Users />} label="Children" value={totals.children} tag="across all families" color="#6a2dff" />
        <StatCard icon={<Sparkles />} label="FeatherPop" value={totals.featherPop} tag="earned platform-wide" color="#ffd14a" />
        <StatCard icon={<BookOpenCheck />} label="Words found" value={totals.words} tag="lifetime, everyone" color="#4cc4ff" />
        <StatCard icon={<Egg />} label="Eggs hatched" value={totals.eggs} tag="across all families" color="#34e3a4" />
        <StatCard icon={<Crown />} label="Members" value={totals.members} tag="active subscriptions" color="#ff7ab8" />
      </section>

      {/* Quick actions */}
      <section className="admin-actions">
        <Link href="/print/park-hunt-qrs" className="card admin-action-card">
          <div className="admin-action-icon" style={{ background: "linear-gradient(135deg, #a76bff, #6a2dff)" }}>
            <Printer aria-hidden className="h-6 w-6" />
          </div>
          <div>
            <h2 className="h-display mt-2 text-2xl">Print station QRs</h2>
            <p className="text-[var(--ink-soft)]">Print 5 station QRs with this week&apos;s word lists.</p>
          </div>
        </Link>

        <Link href="/admin/park-hunt" className="card admin-action-card">
          <div className="admin-action-icon" style={{ background: "linear-gradient(135deg, #34e3a4, #1ea672)" }}>
            <MapPin aria-hidden className="h-6 w-6" />
          </div>
          <div>
            <h2 className="h-display mt-2 text-2xl">Park Hunt words</h2>
            <p className="text-[var(--ink-soft)]">Edit the global word bank every family hunts.</p>
          </div>
        </Link>

        <Link href="/admin/rewards" className="card admin-action-card">
          <div className="admin-action-icon" style={{ background: "linear-gradient(135deg, #ff9a3a, #ff6b3a)" }}>
            <Gift aria-hidden className="h-6 w-6" />
          </div>
          <div>
            <h2 className="h-display mt-2 text-2xl">Rewards</h2>
            <p className="text-[var(--ink-soft)]">Add or edit the prizes every family can earn.</p>
          </div>
        </Link>

        <Link href="/admin/media" className="card admin-action-card">
          <div className="admin-action-icon" style={{ background: "linear-gradient(135deg, #4cc4ff, #6a2dff)" }}>
            <Sparkles aria-hidden className="h-6 w-6" />
          </div>
          <div>
            <h2 className="h-display mt-2 text-2xl">Videos &amp; Songs</h2>
            <p className="text-[var(--ink-soft)]">Add TikTok/YouTube links kids watch &amp; listen to.</p>
          </div>
        </Link>

        <Link href="/admin/challenges" className="card admin-action-card">
          <div className="admin-action-icon" style={{ background: "linear-gradient(135deg, #ff7ab8, #ff2d8e)" }}>
            <BookOpenCheck aria-hidden className="h-6 w-6" />
          </div>
          <div>
            <h2 className="h-display mt-2 text-2xl">Legacy challenges</h2>
            <p className="text-[var(--ink-soft)]">Edit the older Word Quest seed challenges.</p>
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
          <h2 className="h-display text-2xl">5 stations × 20 words = 100</h2>
          <p className="text-[var(--ink-soft)]">
            Same set every family sees this week. Rotates automatically every Monday.
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

      {/* Families overview */}
      <section className="admin-section">
        <header className="admin-section-head">
          <span className="kicker">
            <Users aria-hidden className="h-4 w-4" />
            Families
          </span>
          <h2 className="h-display text-2xl">All accounts</h2>
          <p className="text-[var(--ink-soft)]">
            Showing {families.length} of {totalCount}.{" "}
            {totalCount > families.length
              ? "More exist — paging coming soon."
              : ""}
          </p>
        </header>
        {families.length === 0 ? (
          <p className="text-[var(--ink-soft)]">No families yet.</p>
        ) : (
          <div className="admin-families-table">
            <div className="admin-families-row admin-families-head">
              <span>Family</span>
              <span>Kids</span>
              <span>FeatherPop</span>
              <span>Words</span>
              <span>Eggs</span>
              <span>Membership</span>
            </div>
            {families.map((f) => (
              <div key={f.userId} className="admin-families-row">
                <span className="admin-families-name">
                  <strong>{f.label}</strong>
                  <small>{f.email}</small>
                </span>
                <span>{f.childCount}</span>
                <span>{f.featherPop.toLocaleString()}</span>
                <span>{f.words.toLocaleString()}</span>
                <span>{f.eggs}</span>
                <span>
                  <em className={`admin-badge ${f.member ? "is-member" : ""}`}>
                    {f.member ? f.status : "free"}
                  </em>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* VIP / Premium interest list */}
      <section className="admin-section">
        <header className="admin-section-head">
          <span className="kicker">
            <Crown aria-hidden className="h-4 w-4" />
            Premium interest
          </span>
          <h2 className="h-display text-2xl">VIP wishlist</h2>
          <p className="text-[var(--ink-soft)]">
            Emails collected from the &ldquo;Coming Soon · Premium&rdquo; signup
            on the membership page.
          </p>
        </header>
        <MailingListPanel emails={mailingList} />
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
          Children + per-child progress: Clerk privateMetadata. Membership
          status: Clerk publicMetadata.membership (written by the Stripe
          webhook). Global content (Park Hunt word bank + rewards): the owner
          account&apos;s Clerk publicMetadata. Park Hunt station splits are
          deterministic from the week key.
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
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tag: string;
  color: string;
}) {
  return (
    <article className="admin-stat-card" style={{ ["--stat-color" as string]: color }}>
      <div className="admin-stat-icon">{icon}</div>
      <span className="admin-stat-label">{label}</span>
      <span className="admin-stat-value">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
      <span className="admin-stat-tag">{tag}</span>
    </article>
  );
}
