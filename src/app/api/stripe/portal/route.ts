// POST /api/stripe/portal
// Creates a Stripe Billing Portal session for the signed-in family and
// returns its URL. The portal is where parents update their card or
// CANCEL the subscription — Stripe hosts it, we just deep-link.

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await currentUser();
  const customerId = (
    user?.publicMetadata?.membership as { stripeCustomerId?: string } | undefined
  )?.stripeCustomerId;
  if (!customerId) {
    return NextResponse.json(
      { error: "No subscription found for this account." },
      { status: 400 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const session = await stripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/account`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
