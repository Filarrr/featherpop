import { Check, Printer, Sparkles, Star, Trophy } from "lucide-react";
import { CheckoutButton } from "@/components/CheckoutButton";
import { MEMBERSHIP_PRICE_LABEL } from "@/lib/stripe";
import { getMembership, isMemberActive } from "@/lib/membership";

export const metadata = {
  title: "Membership",
};

const PERKS = [
  { icon: Trophy, title: "All 6 quest zones", body: "Free players get 2 zones; members unlock every zone and every QR card." },
  { icon: Sparkles, title: "Unlimited daily quests", body: "Free play is capped to 3 quests a day. Members never hit the cap." },
  { icon: Printer, title: "Printable rewards & QR packs", body: "Download bookmarks, certificates, and the full classroom QR pack." },
  { icon: Star, title: "Cosmetic reward tier", body: "Glittery member-only stickers, badges, and avatar frames." },
];

export default async function MembershipPage() {
  const m = await getMembership();
  const active = isMemberActive(m);

  return (
    <main className="grid gap-6 p-4 md:p-8">
      <section className="card">
        <span className="kicker">Ms. Feather Pop Membership</span>
        <h1 className="h-display mt-2 text-4xl md:text-5xl">
          <span className="h-gradient">{MEMBERSHIP_PRICE_LABEL}</span>
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
          {MEMBERSHIP_PRICE_LABEL} — unlocks every zone, every printable, every reward, and
          Champions Battle Words for one little explorer or a whole family.
        </p>

        <div className="mt-5">
          {active ? (
            <p className="rounded-2xl bg-emerald-500/15 px-4 py-3 font-bold text-emerald-200">
              You're a member — thank you! Manage in{" "}
              <a className="underline" href="/account">your account</a>.
            </p>
          ) : (
            <CheckoutButton priceLabel={MEMBERSHIP_PRICE_LABEL} />
          )}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {PERKS.map(({ icon: Icon, title, body }) => (
          <article key={title} className="tier">
            <div className="flex items-start gap-3">
              <div
                className="grid h-11 w-11 place-items-center rounded-2xl text-white"
                style={{ background: "linear-gradient(135deg, var(--purple), var(--magenta))" }}
              >
                <Icon aria-hidden className="h-5 w-5" />
              </div>
              <div>
                <h3 className="h-display text-xl">{title}</h3>
                <p className="text-sm text-[var(--ink-soft)]">{body}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="card">
        <h2 className="h-display text-2xl">What's free vs members-only</h2>
        <ul className="mt-3 grid gap-2 text-sm">
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-300" /> Free: 2 zones (Feather Forest, Sky Stage), 3 quests/day, side games, basic rewards.</li>
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-300" /> Members: all 6 zones, unlimited quests, all printables, cosmetic rewards, certificate printing.</li>
        </ul>
      </section>
    </main>
  );
}
