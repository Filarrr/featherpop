// Owner identity — the single "control room" account(s) that can see and
// manage EVERY family, not just their own. Gated by email so the owner can
// sign in with a normal Clerk account (e.g. admin@msfeatherpop.com) and the
// app recognises it as the owner.
//
// Configure via the OWNER_EMAILS env var (comma-separated). Defaults to
// admin@msfeatherpop.com so it works out of the box once that account exists.

import "server-only";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";

const DEFAULT_OWNER_EMAILS = "admin@msfeatherpop.com";

/** Lower-cased list of emails allowed into the owner control room. */
export function ownerEmails(): string[] {
  return (process.env.OWNER_EMAILS ?? DEFAULT_OWNER_EMAILS)
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** All emails on a Clerk user, lower-cased. */
export function emailsOf(user: Pick<User, "emailAddresses">): string[] {
  return (user.emailAddresses ?? []).map((e) =>
    e.emailAddress.toLowerCase(),
  );
}

/** Is the currently signed-in user one of the owners? */
export async function isOwner(): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false;
  const allow = ownerEmails();
  return emailsOf(user).some((e) => allow.includes(e));
}

/**
 * Clerk user id of the owner account — the place global content (word bank,
 * rewards) is stored so every family reads the same set. Returns the first
 * OWNER_EMAILS match. Null if no owner account exists yet.
 */
export async function getOwnerUserId(): Promise<string | null> {
  const allow = ownerEmails();
  const client = await clerkClient();
  const { data } = await client.users.getUserList({
    emailAddress: allow,
    limit: 10,
  });
  for (const u of data) {
    if (emailsOf(u).some((e) => allow.includes(e))) return u.id;
  }
  return null;
}
