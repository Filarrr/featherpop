import Link from "next/link";
import {
  BookOpen,
  Crown,
  Egg,
  Feather,
  Lock,
  MapPin,
  QrCode,
  Sparkles,
} from "lucide-react";
import { CheckoutButton } from "@/components/CheckoutButton";
import { MailingListForm } from "@/components/MailingListForm";
import { MEMBERSHIP_PRICE_LABEL, PREMIUM_PRICE_LABEL } from "@/lib/stripe";
import { getMembership, isMemberActive } from "@/lib/membership";

export const metadata = { title: "Adventure Membership" };

const UNLOCKS = [
  { icon: MapPin,   label: "Unlimited Park Hunt Adventures", color: "linear-gradient(135deg, #a76bff, #6a2dff)" },
  { icon: QrCode,   label: "6 Printable Adventure Stations", color: "linear-gradient(135deg, #34e3a4, #1ea672)" },
  { icon: BookOpen, label: "Daily Word Hunts",               color: "linear-gradient(135deg, #ff9a3a, #ff6b3a)" },
  { icon: Feather,  label: "Feather Rewards",                color: "linear-gradient(135deg, #ff7ab8, #ff2d8e)" },
  { icon: Egg,      label: "Egg Hatching",                   color: "linear-gradient(135deg, #b13bff, #6a2dff)" },
  { icon: Crown,    label: "Golden Feather Challenge",       color: "linear-gradient(135deg, #ffd14a, #f0a900)" },
];

export default async function MembershipPage() {
  const m = await getMembership();
  const active = isMemberActive(m);

  return (
    <main className="page membership-page-wrap">
      <div className="membership-page">
        <header className="membership-header">
          <Link href="/" className="prizes-back" aria-label="Back">
            <span aria-hidden>←</span>
          </Link>
          <h1 className="membership-header-title">Adventure Membership</h1>
          <span className="membership-header-icon" aria-hidden>🪶</span>
        </header>

        <section className="membership-hero">
          <div className="membership-hero-body">
            <h2 className="membership-hero-title">
              <span className="h-gradient">Ms.</span>
              <br />
              <span className="membership-hero-brand">Featherpop</span>
            </h2>
            <p className="membership-hero-sub">Adventure Membership</p>
            <p className="membership-hero-msg">
              Turn any park, backyard, or party into a{" "}
              <strong>Ms. Featherpop Adventure!</strong>
            </p>
          </div>
          <div className="membership-hero-art" aria-hidden>
            <span className="membership-hero-bird">🦅</span>
            <span className="membership-hero-butterfly">🦋</span>
            <span className="membership-hero-flowers">🌸</span>
          </div>
        </section>

        <div className="membership-price">
          <span>$9.99</span>
          <small>/month</small>
        </div>

        <section className="membership-unlocks">
          <p className="membership-unlocks-title">Unlock:</p>
          <div className="membership-unlocks-grid">
            {UNLOCKS.map((u, i) => {
              const Icon = u.icon;
              return (
                <article key={i} className="membership-unlock">
                  <div className="membership-unlock-icon" style={{ background: u.color }}>
                    <Icon aria-hidden className="h-6 w-6" />
                  </div>
                  <span>{u.label}</span>
                </article>
              );
            })}
          </div>
        </section>

        {active ? (
          <div className="membership-active-wrap">
            <p className="membership-active" role="status">
              <Crown aria-hidden className="h-5 w-5" />
              You're a member — thank you!{" "}
              <Link href="/account">Manage subscription</Link>.
            </p>
            <div className="membership-qr-banner">
              <QrCode aria-hidden className="h-8 w-8" />
              <div>
                <strong>Print your Adventure Stations</strong>
                <p>Print and set up the QR code stations for your Park Hunt adventure.</p>
              </div>
              <Link href="/print/park-hunt-qrs" className="btn btn-gold btn-pulse">
                Print QR Codes
              </Link>
            </div>
          </div>
        ) : (
          <div className="membership-cta-wrap">
            <CheckoutButton priceLabel={MEMBERSHIP_PRICE_LABEL} />
            <p className="membership-fine-print">
              <Lock aria-hidden className="h-3.5 w-3.5" />
              Includes printable stations, rewards, certificates, and future updates.
            </p>
          </div>
        )}

        {/* Coming Soon — VIP Interest List */}
        <section className="membership-coming-soon">
          <span className="kicker">
            <Sparkles aria-hidden className="h-4 w-4" />
            Coming Soon · Premium {PREMIUM_PRICE_LABEL}
          </span>
          <h3>Join the VIP Interest List</h3>
          <ul>
            <li><span aria-hidden>🎤</span> Meet &amp; greet Miss Feather Pop</li>
            <li><span aria-hidden>📸</span> Photos with Miss Feather Pop</li>
            <li><span aria-hidden>🎉</span> Live experiences</li>
            <li><span aria-hidden>🎁</span> Real prizes</li>
            <li><span aria-hidden>⭐</span> Special events</li>
          </ul>
          <p className="membership-coming-soon-tag">
            No payment required now — join our mailing list and we&apos;ll
            email you when Premium launches.
          </p>
          <MailingListForm />
        </section>
      </div>
    </main>
  );
}
