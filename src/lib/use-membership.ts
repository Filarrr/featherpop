// Client-side membership helper. Reads Clerk's user.publicMetadata.membership,
// which is mirrored from Stripe via /api/stripe/webhook. Use this to gate UI
// and let pages render optimistically without an extra round-trip.

"use client";

import { useUser } from "@clerk/nextjs";
import type { Membership } from "@/lib/membership";
import { isOwnerEmail } from "@/lib/owner-emails";

export function useMembership(): { membership: Membership; isMember: boolean; isLoaded: boolean } {
  const { user, isLoaded } = useUser();
  const m = ((user?.publicMetadata?.membership ?? { status: "none" }) as Membership);
  // Owner accounts are treated as active members.
  const owner = isOwnerEmail(
    (user?.emailAddresses ?? []).map((e) => e.emailAddress),
  );
  const isMember = owner || m.status === "active" || m.status === "trialing";
  return { membership: m, isMember, isLoaded };
}
