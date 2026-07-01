import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

// Singleton — instantiated lazily so build/preview without keys doesn't crash.
let _stripe: Stripe | null = null;
export function stripe(): Stripe {
  if (!_stripe) {
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export const MEMBERSHIP_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ?? "";
export const TRIAL_DAYS = 3;
// Current live plan. The $23.99 "Premium" tier (meet & greet, photos, live
// experiences, prizes) is marketed as Coming Soon, not chargeable yet.
export const MEMBERSHIP_PRICE_LABEL = "$9.99/month";
export const PREMIUM_PRICE_LABEL = "$23.99/month";
