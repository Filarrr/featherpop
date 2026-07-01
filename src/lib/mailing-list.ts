// Read side of the VIP / Premium interest mailing list. Stored on the owner
// account's privateMetadata.mailingList by subscribeMailingListAction.

import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { getOwnerUserId } from "@/lib/owner";

export async function getMailingList(): Promise<string[]> {
  try {
    const ownerId = await getOwnerUserId();
    if (!ownerId) return [];
    const client = await clerkClient();
    const owner = await client.users.getUser(ownerId);
    const list = owner.privateMetadata?.mailingList;
    return Array.isArray(list) ? (list as string[]) : [];
  } catch {
    return [];
  }
}
