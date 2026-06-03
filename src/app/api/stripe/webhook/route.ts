// POST /api/stripe/webhook
// Receives Stripe subscription lifecycle events and mirrors the membership
// status onto the Clerk user's publicMetadata so the rest of the app can
// read it without re-hitting Stripe.

import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import type { Membership, MembershipStatus } from "@/lib/membership";

export const runtime = "nodejs";

function mapStatus(s: Stripe.Subscription.Status): MembershipStatus {
  switch (s) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return "none";
  }
}

async function applyToUser(clerkUserId: string, m: Membership) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { membership: m },
  });
}

async function syncFromSubscription(sub: Stripe.Subscription) {
  let clerkUserId = sub.metadata?.clerkUserId as string | undefined;
  if (!clerkUserId) {
    const cust =
      typeof sub.customer === "string"
        ? await stripe().customers.retrieve(sub.customer)
        : sub.customer;
    if (!cust.deleted) {
      clerkUserId = cust.metadata?.clerkUserId as string | undefined;
    }
  }
  if (!clerkUserId) return;

  const m: Membership = {
    status: mapStatus(sub.status),
    stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripeSubscriptionId: sub.id,
    currentPeriodEnd: (sub as unknown as { current_period_end?: number }).current_period_end,
    trialEnd: sub.trial_end ?? undefined,
  };
  await applyToUser(clerkUserId, m);
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "webhook secret not set" }, { status: 500 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return NextResponse.json({ error: `bad signature: ${(err as Error).message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkUserId = (session.client_reference_id ?? session.metadata?.clerkUserId) as
        | string
        | undefined;
      if (clerkUserId && session.subscription) {
        const sub = await stripe().subscriptions.retrieve(session.subscription as string);
        // Make sure metadata carries the clerkUserId for subsequent events.
        if (!sub.metadata?.clerkUserId) {
          await stripe().subscriptions.update(sub.id, {
            metadata: { ...sub.metadata, clerkUserId },
          });
        }
        await syncFromSubscription({ ...sub, metadata: { ...sub.metadata, clerkUserId } });
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.trial_will_end": {
      await syncFromSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
