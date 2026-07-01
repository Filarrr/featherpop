"use server";

// Public mailing-list signup for the Coming Soon / Premium interest list.
// Stored on the OWNER account's privateMetadata.mailingList so there's no
// external email service to wire up yet — the owner can view/export it from
// the admin dashboard and later hand it to Mailchimp etc.

import { clerkClient } from "@clerk/nextjs/server";
import { getOwnerUserId } from "@/lib/owner";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ENTRIES = 5000;

export async function subscribeMailingListAction(
  rawEmail: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const email = (rawEmail || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return { ok: false, reason: "Please enter a valid email." };
  }
  try {
    const ownerId = await getOwnerUserId();
    if (!ownerId) return { ok: false, reason: "Signups aren't open yet." };
    const client = await clerkClient();
    const owner = await client.users.getUser(ownerId);
    const existing = Array.isArray(owner.privateMetadata?.mailingList)
      ? (owner.privateMetadata.mailingList as string[])
      : [];
    if (existing.includes(email)) return { ok: true }; // idempotent
    if (existing.length >= MAX_ENTRIES) {
      return { ok: false, reason: "The list is full — please contact us." };
    }
    await client.users.updateUserMetadata(ownerId, {
      privateMetadata: {
        ...owner.privateMetadata,
        mailingList: [...existing, email],
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: "Something went wrong — try again." };
  }
}
