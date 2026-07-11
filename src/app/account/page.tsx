import { UserProfile } from "@clerk/nextjs";
import { getMembership, isMemberActive } from "@/lib/membership";
import { isOwner } from "@/lib/owner";
import { MEMBERSHIP_PRICE_LABEL } from "@/lib/stripe";
import { ChampionsBattleWords } from "@/components/ChampionsBattleWords";
import { ManageSubscriptionButton } from "@/components/ManageSubscriptionButton";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const [m, owner] = await Promise.all([getMembership(), isOwner()]);
  const active = isMemberActive(m);
  // The owner runs the platform — they always see member features.
  const member = active || owner;
  const trialEnds = m.trialEnd ? new Date(m.trialEnd * 1000).toLocaleDateString() : null;

  return (
    <main className="grid gap-6 p-4 md:p-8">
      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="kicker">Membership</span>
            <h1 className="h-display mt-2 text-3xl">
              {active ? "Active" : "Not active"}
            </h1>
            <p className="mt-2 text-[var(--ink-soft)]">
              Plan: {MEMBERSHIP_PRICE_LABEL} · status: <strong>{m.status}</strong>
              {trialEnds ? <> · trial ends {trialEnds}</> : null}
            </p>
            {member ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <a href="/print/park-hunt-qrs" className="btn btn-gold btn-sm">
                  🖨️ Print Park Hunt QR codes
                </a>
                <a href="/print" className="btn btn-ghost btn-sm">
                  Printable quest pack
                </a>
                {active ? <ManageSubscriptionButton /> : null}
              </div>
            ) : (
              <a href="/membership" className="btn btn-gold btn-sm mt-4">
                See plans
              </a>
            )}
          </div>
          <ChampionsBattleWords member={member} />
        </div>
      </section>

      <section className="grid place-items-center">
        <UserProfile routing="hash" />
      </section>
    </main>
  );
}
