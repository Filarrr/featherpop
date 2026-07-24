"use client";

import Image from "next/image";
import Link from "next/link";
import { useActiveChild } from "@/lib/use-active-child";

export function ActiveChildChip() {
  const { active, progress } = useActiveChild();

  if (!active) {
    return (
      <Link href="/account/profiles" className="active-child-chip is-empty">
        <span>Pick a child</span>
      </Link>
    );
  }

  // Golden Feather champion — 1,000 words in a month. Badge the avatar so the
  // achievement travels with the child everywhere they go.
  const isChampion = (progress.goldenFeatherMonths ?? []).length > 0;

  return (
    <Link
      href="/account/profiles"
      className={`active-child-chip ${isChampion ? "is-champion" : ""}`}
      title={isChampion ? "Golden Feather champion!" : undefined}
    >
      <span className="active-child-chip-avatar">
        <Image
          src={`/media/avatars/${active.avatar ?? "kid-ari"}-wave.png`}
          alt=""
          width={32}
          height={32}
          unoptimized
        />
        {isChampion ? (
          <span
            className="active-child-chip-crown"
            aria-label="Golden Feather champion"
          >
            👑
          </span>
        ) : null}
      </span>
      <span>{active.nickname}</span>
    </Link>
  );
}
