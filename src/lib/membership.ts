// Server-side helpers for reading a user's membership status.
// Source of truth: Clerk publicMetadata.membership, written by the Stripe
// webhook handler. This file is server-only — do NOT import from client code.

import { auth, currentUser } from "@clerk/nextjs/server";
import { isOwnerUser } from "@/lib/owner";

export type MembershipStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "none";

export type Membership = {
  status: MembershipStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: number; // unix seconds
  trialEnd?: number; // unix seconds
};

export async function getMembership(): Promise<Membership> {
  const user = await currentUser();
  if (!user) return { status: "none" };
  // Owner accounts are treated as active members (full access for testing /
  // running the platform, no Stripe subscription needed).
  if (isOwnerUser(user)) return { status: "active" };
  const m = (user.publicMetadata?.membership ?? {}) as Partial<Membership>;
  return { status: m.status ?? "none", ...m };
}

export function isMemberActive(m: Membership): boolean {
  return m.status === "active" || m.status === "trialing";
}

export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}
