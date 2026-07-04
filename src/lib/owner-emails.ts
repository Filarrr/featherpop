// Owner email list — SHARED by client and server (no "server-only" import),
// so both can treat the owner accounts as full members. The server also
// honours the OWNER_EMAILS env var (see owner.ts); the client only knows
// these defaults, which cover the real owner accounts.

export const DEFAULT_OWNER_EMAILS = [
  "chaneljenkins25@gmail.com",
  "theanglroom@gmail.com",
];

export function isOwnerEmail(
  emails: readonly string[],
  allow: readonly string[] = DEFAULT_OWNER_EMAILS,
): boolean {
  const set = allow.map((e) => e.trim().toLowerCase());
  return emails.some((e) => set.includes(e.toLowerCase()));
}
