import { UserProfile } from "@clerk/nextjs";
import { getMembership, isMemberActive } from "@/lib/membership";
import { MEMBERSHIP_PRICE_LABEL } from "@/lib/stripe";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const m = await getMembership();
  const active = isMemberActive(m);
  const trialEnds = m.trialEnd ? new Date(m.trialEnd * 1000).toLocaleDateString() : null;

  return (
    <main className="grid gap-6 p-4 md:p-8">
      <section className="card">
        <span className="kicker">Membership</span>
        <h1 className="h-display mt-2 text-3xl">
          {active ? "Active" : "Not active"}
        </h1>
        <p className="mt-2 text-[var(--ink-soft)]">
          Plan: {MEMBERSHIP_PRICE_LABEL} · status: <strong>{m.status}</strong>
          {trialEnds ? <> · trial ends {trialEnds}</> : null}
        </p>
        {!active ? (
          <a href="/membership" className="btn btn-gold btn-sm mt-4">
            See plans
          </a>
        ) : null}
      </section>

      <section className="grid place-items-center">
        <UserProfile routing="hash" />
      </section>
    </main>
  );
}
