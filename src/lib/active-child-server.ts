// Server-only helpers for the "active child" selection.
//
// Source of truth: an httpOnly cookie on the parent's browser, populated by
// server actions. Reading happens in server components / route handlers via
// `cookies()`. The client never touches the cookie directly — it calls a
// server action that revalidates the affected paths.

import "server-only";
import { cookies } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";
import type { ChildProfile } from "@/lib/child-profile";

export const ACTIVE_CHILD_COOKIE = "mfp-active-child";

/**
 * Reads the active-child cookie. If no valid cookie is set, falls back
 * to the same auto-select behavior as resolveActiveChild() — if the
 * Clerk account has exactly one child, that child is treated as active.
 *
 * This fallback matters because the parent's browser may have lost the
 * cookie (cleared cookies, new device, expiry), yet the chip / layout
 * still shows the kid because resolveActiveChild() auto-selects. Every
 * action that called this function used to silently return null in
 * that case and the UI would 'stuck' with no usable child id.
 */
export async function getActiveChildId(): Promise<string | null> {
  const store = await cookies();
  const v = store.get(ACTIVE_CHILD_COOKIE)?.value;
  // Hot path: cookie is set. Caller has already done auth so we can
  // optimistically return the value — every server action that uses
  // this id wraps the actual write in its own try/catch which would
  // reject an unknown child anyway.
  if (v && v.length > 0) return v;
  // Cold path: no cookie. Fall back to auto-selecting the only-child
  // so the chip / actions see the same kid (resolveActiveChild does
  // this for the UI; we mirror it here for actions).
  const children = await listChildrenServer();
  if (children.length === 1) return children[0].id;
  return null;
}

/** Raw cookie read, no fallback. Used when we explicitly need 'was the
 *  cookie set' (e.g. the setActiveChildAction). */
export async function getActiveChildCookie(): Promise<string | null> {
  const store = await cookies();
  const v = store.get(ACTIVE_CHILD_COOKIE)?.value;
  return v && v.length > 0 ? v : null;
}

export async function setActiveChildCookie(id: string | null) {
  const store = await cookies();
  if (id) {
    store.set(ACTIVE_CHILD_COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  } else {
    store.delete(ACTIVE_CHILD_COOKIE);
  }
}

export async function listChildrenServer(): Promise<ChildProfile[]> {
  const user = await currentUser();
  if (!user) return [];
  const raw = (user.publicMetadata?.children ?? []) as unknown;
  return Array.isArray(raw) ? (raw as ChildProfile[]) : [];
}

/**
 * Active child + the canonical children list. The cookie is reconciled
 * against the live list — if the cookie points at a deleted child, it gets
 * cleared and the first remaining child auto-selected.
 */
export async function resolveActiveChild(): Promise<{
  children: ChildProfile[];
  activeChildId: string | null;
  active: ChildProfile | null;
}> {
  const [children, cookieId] = await Promise.all([
    listChildrenServer(),
    getActiveChildId(),
  ]);
  let activeChildId = cookieId;
  if (cookieId && !children.some((c) => c.id === cookieId)) {
    activeChildId = null;
  }
  // Auto-select if exactly one child and no cookie.
  if (!activeChildId && children.length === 1) {
    activeChildId = children[0].id;
  }
  const active = activeChildId
    ? children.find((c) => c.id === activeChildId) ?? null
    : null;
  return { children, activeChildId, active };
}
