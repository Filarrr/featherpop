// POST /api/stripe/checkout
// Creates a Stripe Checkout Session for the Ms. Feather Pop membership
// and returns its URL. The user must be authenticated with Clerk
// (enforced in src/proxy.ts).
//
// Per client (2026-06): the 3-day free trial was removed. Subscription
// starts billing immediately on checkout completion.

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { MEMBERSHIP_PRICE_ID, stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!MEMBERSHIP_PRICE_ID) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_STRIPE_PRICE_ID is not configured" },
      { status: 500 },
    );
  }

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Reuse an existing customer id if we've stored one on the user.
  const existingCustomerId = (user?.publicMetadata?.membership as { stripeCustomerId?: string } | undefined)
    ?.stripeCustomerId;

  let session;
  try {
    session = await stripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: MEMBERSHIP_PRICE_ID, quantity: 1 }],
      subscription_data: {
        // No trial — billing starts immediately.
        metadata: { clerkUserId: userId },
      },
      customer: existingCustomerId,
      customer_email: existingCustomerId ? undefined : email,
      client_reference_id: userId,
      metadata: { clerkUserId: userId },
      success_url: `${appUrl}/account?checkout=success`,
      cancel_url: `${appUrl}/membership?checkout=cancel`,
      allow_promotion_codes: true,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
