import Link from "next/link";
import { isOwner } from "@/lib/owner";
import { getGlobalChallenges } from "@/lib/global-content";
import { AdminChallengeManager } from "@/components/AdminChallengeManager";

export const dynamic = "force-dynamic";

export default async function AdminChallengesPage() {
  if (!(await isOwner())) {
    return (
      <main className="page">
        <div className="card mx-auto max-w-md text-center">
          <h1 className="h-display text-2xl">Owners only</h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            Sign in with the owner account to manage challenges.
          </p>
          <Link href="/" className="btn btn-gold mt-4">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  const challenges = await getGlobalChallenges();
  return (
    <main className="page">
      <header className="mb-5">
        <span className="kicker">Admin · Challenges</span>
        <h1 className="h-display mt-2 text-4xl">
          <span className="h-gradient">Manage challenges</span>
        </h1>
      </header>
      <AdminChallengeManager initial={challenges} />
    </main>
  );
}
