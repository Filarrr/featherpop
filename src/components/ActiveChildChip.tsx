"use client";

import Image from "next/image";
import Link from "next/link";
import { useActiveChild } from "@/lib/use-active-child";

export function ActiveChildChip() {
  const { active } = useActiveChild();

  if (!active) {
    return (
      <Link href="/account/profiles" className="active-child-chip is-empty">
        <span>Pick a child</span>
      </Link>
    );
  }

  return (
    <Link href="/account/profiles" className="active-child-chip">
      <span className="active-child-chip-avatar">
        <Image
          src={`/media/avatars/${active.avatar ?? "kid-ari"}-wave.png`}
          alt=""
          width={32}
          height={32}
          unoptimized
        />
      </span>
      <span>{active.nickname}</span>
    </Link>
  );
}
