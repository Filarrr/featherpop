"use server";

import { revalidatePath } from "next/cache";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import type { ChildProfile } from "@/lib/child-profile";

function newId() {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

async function getMeta(): Promise<ChildProfile[]> {
  const user = await currentUser();
  if (!user) return [];
  const raw = (user.publicMetadata?.children ?? []) as unknown;
  return Array.isArray(raw) ? (raw as ChildProfile[]) : [];
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

export async function addChildAction(formData: FormData): Promise<{ id: string } | null> {
  const nickname = String(formData.get("nickname") ?? "").trim().slice(0, 20);
  const avatar = String(formData.get("avatar") ?? "").trim() || undefined;
  if (!nickname) return null;
  const list = await getMeta();
  if (list.length >= 6) return null;
  const next: ChildProfile = {
    id: newId(),
    nickname,
    avatar,
    createdAt: Date.now(),
  };
  await writeMeta([...list, next]);
  revalidatePath("/account/profiles");
  revalidatePath("/");
  return { id: next.id };
}

export async function removeChildAction(
  formData: FormData,
): Promise<{ removedId: string } | null> {
  const id = String(formData.get("id") ?? "");
  if (!id) return null;
  const list = await getMeta();
  await writeMeta(list.filter((c) => c.id !== id));

  // Prune private progress map for the removed child.
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

  revalidatePath("/account/profiles");
  revalidatePath("/");
  return { removedId: id };
}

export async function listChildren(): Promise<ChildProfile[]> {
  return getMeta();
}
