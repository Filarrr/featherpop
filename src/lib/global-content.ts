// Owner-controlled GLOBAL content — one source of truth every family shares.
//
// Stored on the owner account's Clerk publicMetadata.globalContent. Replaces
// the old per-browser localStorage admin store, which gave every visitor their
// own private copy of the rewards/challenges. Now the owner edits once and
// everyone sees the same set.
//
// Reads are deduped per request with React cache() so a single render that
// touches the word bank + rewards only hits Clerk once.

import "server-only";
import { cache } from "react";
import { clerkClient } from "@clerk/nextjs/server";
import {
  Challenge,
  MediaItem,
  Reward,
  defaultChallenges,
  defaultRewards,
} from "./game-data";
import { PARK_HUNT_BANK } from "./park-hunt-words";
import { ownerEmails } from "./owner";

export interface StoredGlobalContent {
  rewards?: Reward[];
  challenges?: Challenge[];
  wordBank?: string[];
  videos?: MediaItem[];
  songs?: MediaItem[];
}

export interface GlobalContent {
  rewards: Reward[];
  challenges: Challenge[];
  wordBank: string[];
  /** Whether an owner account was found to read from. */
  ownerFound: boolean;
}

/**
 * Read the raw stored content off the owner account. ONE Clerk call: the
 * email-filtered getUserList already returns the full user (with metadata),
 * so we don't need a follow-up getUser. Deduped per request.
 */
export const getStoredGlobalContent = cache(
  async (): Promise<{ content: StoredGlobalContent; ownerFound: boolean }> => {
    try {
      const allow = ownerEmails();
      const client = await clerkClient();
      const { data } = await client.users.getUserList({
        emailAddress: allow,
        limit: 10,
      });
      const owner = data.find((u) =>
        (u.emailAddresses ?? []).some((e) =>
          allow.includes(e.emailAddress.toLowerCase()),
        ),
      );
      if (!owner) return { content: {}, ownerFound: false };
      const content = (owner.publicMetadata?.globalContent ??
        {}) as StoredGlobalContent;
      return { content, ownerFound: true };
    } catch {
      return { content: {}, ownerFound: false };
    }
  },
);

export async function getGlobalContent(): Promise<GlobalContent> {
  const { content, ownerFound } = await getStoredGlobalContent();
  return {
    rewards: content.rewards?.length ? content.rewards : defaultRewards,
    challenges: content.challenges?.length
      ? content.challenges
      : defaultChallenges,
    wordBank: content.wordBank?.length ? content.wordBank : PARK_HUNT_BANK,
    ownerFound,
  };
}

/** The active Park Hunt word bank (owner override, or the built-in default). */
export async function getGlobalWordBank(): Promise<string[]> {
  const { content } = await getStoredGlobalContent();
  return content.wordBank?.length ? content.wordBank : PARK_HUNT_BANK;
}

export async function getGlobalRewards(): Promise<Reward[]> {
  const { content } = await getStoredGlobalContent();
  return content.rewards?.length ? content.rewards : defaultRewards;
}

export async function getGlobalChallenges(): Promise<Challenge[]> {
  const { content } = await getStoredGlobalContent();
  return content.challenges?.length ? content.challenges : defaultChallenges;
}

export async function getGlobalVideos(): Promise<MediaItem[]> {
  const { content } = await getStoredGlobalContent();
  return Array.isArray(content.videos) ? content.videos : [];
}

export async function getGlobalSongs(): Promise<MediaItem[]> {
  const { content } = await getStoredGlobalContent();
  return Array.isArray(content.songs) ? content.songs : [];
}
