"use server";

import { revalidatePath } from "next/cache";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import type { ChildProfile } from "@/lib/child-profile";
import {
  getActiveChildId,
  listChildrenServer,
  setActiveChildCookie,
} from "@/lib/active-child-server";

function newId() {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

async function writeMeta(children: ChildProfile[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { ...user.publicMetadata, children },
  });
}

export async function addChildAction(
  formData: FormData,
): Promise<{ id: string } | null> {
  const nickname = String(formData.get("nickname") ?? "").trim().slice(0, 20);
  const avatar = String(formData.get("avatar") ?? "").trim() || undefined;
  if (!nickname) return null;
  const list = await listChildrenServer();
  if (list.length >= 6) return null;
  const next: ChildProfile = {
    id: newId(),
    nickname,
    avatar,
    createdAt: Date.now(),
  };
  await writeMeta([...list, next]);
  // Auto-select the new child for this parent's browser.
  await setActiveChildCookie(next.id);
  revalidatePath("/", "layout");
  return { id: next.id };
}

export async function removeChildAction(
  formData: FormData,
): Promise<{ removedId: string } | null> {
  const id = String(formData.get("id") ?? "");
  if (!id) return null;
  const list = await listChildrenServer();
  await writeMeta(list.filter((c) => c.id !== id));

  // Prune private progress map.
  try {
    const { userId } = await auth();
    if (userId) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const priv = (user.privateMetadata ?? {}) as Record<string, unknown>;
      const mapRaw = priv.childProgress;
      if (mapRaw && typeof mapRaw === "object") {
        const map = { ...(mapRaw as Record<string, unknown>) };
        if (id in map) {
          delete map[id];
          await client.users.updateUserMetadata(userId, {
            privateMetadata: { ...priv, childProgress: map },
          });
        }
      }
    }
  } catch {
    /* best-effort prune */
  }

  // Clear cookie if this was the active child.
  const active = await getActiveChildId();
  if (active === id) await setActiveChildCookie(null);

  revalidatePath("/", "layout");
  return { removedId: id };
}

export async function setActiveChildAction(formData: FormData): Promise<void> {
  const raw = String(formData.get("id") ?? "");
  const id = raw === "" ? null : raw;
  // Validate against the live list — refuse unknown ids.
  if (id) {
    const list = await listChildrenServer();
    if (!list.some((c) => c.id === id)) return;
  }
  await setActiveChildCookie(id);
  revalidatePath("/", "layout");
}

export async function listChildren(): Promise<ChildProfile[]> {
  return listChildrenServer();
}

// Verify the caller is signed in. Pages call this from server components.
export async function requireSignedIn() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
