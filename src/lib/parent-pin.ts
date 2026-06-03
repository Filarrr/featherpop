// Server-only parent-PIN helpers. The PIN hash lives in Clerk
// `privateMetadata` (not readable from the client), salted scrypt.

import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";

const scryptAsync = promisify(scrypt) as (
  pwd: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

async function hash(pin: string, salt?: string): Promise<string> {
  const s = salt ?? randomBytes(16).toString("hex");
  const buf = await scryptAsync(pin, s, 32);
  return `${s}:${buf.toString("hex")}`;
}

async function verify(pin: string, stored: string): Promise<boolean> {
  const [salt, hex] = stored.split(":");
  if (!salt || !hex) return false;
  const buf = await scryptAsync(pin, salt, 32);
  const expected = Buffer.from(hex, "hex");
  if (buf.length !== expected.length) return false;
  return timingSafeEqual(buf, expected);
}

function readStoredHash(meta: unknown): string | undefined {
  if (!meta || typeof meta !== "object") return undefined;
  const v = (meta as Record<string, unknown>).parentPinHash;
  return typeof v === "string" ? v : undefined;
}

export async function hasParentPin(): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false;
  return Boolean(readStoredHash(user.privateMetadata));
}

export async function setParentPin(pin: string): Promise<void> {
  if (!/^\d{4,6}$/.test(pin)) throw new Error("PIN must be 4–6 digits");
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const stored = await hash(pin);
  await client.users.updateUserMetadata(userId, {
    privateMetadata: { ...user.privateMetadata, parentPinHash: stored },
  });
}

export async function clearParentPin(): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const next = { ...user.privateMetadata } as Record<string, unknown>;
  delete next.parentPinHash;
  await client.users.updateUserMetadata(userId, { privateMetadata: next });
}

export async function verifyParentPin(pin: string): Promise<boolean> {
  // Small delay slows brute force from the client side.
  await new Promise((r) => setTimeout(r, 250));
  if (!/^\d{4,6}$/.test(pin)) return false;
  const user = await currentUser();
  if (!user) return false;
  const stored = readStoredHash(user.privateMetadata);
  if (!stored) return false;
  return verify(pin, stored);
}
