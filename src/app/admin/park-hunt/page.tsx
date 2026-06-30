import Link from "next/link";
import { isOwner } from "@/lib/owner";
import { getGlobalWordBank } from "@/lib/global-content";
import { WordBankEditor } from "@/components/admin/WordBankEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Park Hunt words" };

export default async function AdminParkHuntPage() {
  if (!(await isOwner())) {
    return (
      <main className="page">
        <div className="card mx-auto max-w-md text-center">
          <h1 className="h-display text-2xl">Owners only</h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            Sign in with the owner account to manage the word bank.
          </p>
          <Link href="/" className="btn btn-gold mt-4">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  const words = await getGlobalWordBank();
  return (
    <main className="page">
      <header className="mb-5">
        <span className="kicker">Admin · Park Hunt</span>
        <h1 className="h-display mt-2 text-4xl">
          <span className="h-gradient">Word bank</span>
        </h1>
        <p className="mt-1 text-[var(--ink-soft)]">
          The global pool the weekly 5 × 20 station lists are drawn from.
        </p>
      </header>
      <WordBankEditor initial={words} />
    </main>
  );
}
