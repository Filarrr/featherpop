"use server";

// Owner-only writes for the global content store. Every mutation re-checks
// isOwner() server-side, so a non-owner calling the action directly is
// rejected even though the UI hides it.

import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { Challenge, MediaItem, Reward } from "@/lib/game-data";
import { isOwner, getOwnerUserId } from "@/lib/owner";
import {
  StoredGlobalContent,
  getGlobalVideos,
  getGlobalSongs,
} from "@/lib/global-content";

async function writeGlobal(patch: Partial<StoredGlobalContent>): Promise<void> {
  if (!(await isOwner())) throw new Error("Forbidden");
  const ownerId = await getOwnerUserId();
  if (!ownerId) throw new Error("No owner account found.");
  const client = await clerkClient();
  const owner = await client.users.getUser(ownerId);
  const existing = (owner.publicMetadata?.globalContent ??
    {}) as StoredGlobalContent;
  await client.users.updateUserMetadata(ownerId, {
    publicMetadata: {
      ...owner.publicMetadata,
      globalContent: { ...existing, ...patch },
    },
  });
}

export async function saveGlobalWordBankAction(
  words: string[],
): Promise<{ ok: true; count: number } | { ok: false; reason: string }> {
  try {
    const clean = Array.from(
      new Set(
        words
          .map((w) => w.toUpperCase().trim())
          .filter((w) => /^[A-Z]{2,12}$/.test(w)),
      ),
    );
    if (clean.length < 20) {
      return {
        ok: false,
        reason: "Need at least 20 words (one full station).",
      };
    }
    await writeGlobal({ wordBank: clean });
    revalidatePath("/admin");
    revalidatePath("/admin/park-hunt");
    revalidatePath("/park-hunt");
    revalidatePath("/print/park-hunt-qrs");
    return { ok: true, count: clean.length };
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}

export async function saveGlobalRewardsAction(
  rewards: Reward[],
): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    await writeGlobal({ rewards });
    revalidatePath("/admin/rewards");
    revalidatePath("/rewards");
    revalidatePath("/print");
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}

export async function saveGlobalChallengesAction(
  challenges: Challenge[],
): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    await writeGlobal({ challenges });
    revalidatePath("/admin/challenges");
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}

function cleanMedia(items: MediaItem[]): MediaItem[] {
  return items
    .map((m) => ({
      id: m.id,
      title: (m.title || "").trim().slice(0, 120),
      url: (m.url || "").trim().slice(0, 500),
    }))
    .filter((m) => m.title && /^https?:\/\//i.test(m.url));
}

export async function saveGlobalVideosAction(
  videos: MediaItem[],
): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    await writeGlobal({ videos: cleanMedia(videos) });
    revalidatePath("/admin/media");
    revalidatePath("/story");
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}

export async function saveGlobalSongsAction(
  songs: MediaItem[],
): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    await writeGlobal({ songs: cleanMedia(songs) });
    revalidatePath("/admin/media");
    revalidatePath("/music");
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}

/** Public reads so the client Story/Music pages can list the owner's media. */
export async function getVideosAction(): Promise<MediaItem[]> {
  return getGlobalVideos();
}
export async function getSongsAction(): Promise<MediaItem[]> {
  return getGlobalSongs();
}
