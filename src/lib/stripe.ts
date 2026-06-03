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
export const MEMBERSHIP_PRICE_LABEL = "$23.99/month";
