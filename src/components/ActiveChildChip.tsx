"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ChildProfile } from "@/lib/child-profile";
import { useActiveChild, useChildrenVersion } from "@/lib/use-active-child";
import { listChildren } from "@/app/account/profiles/actions";

export function ActiveChildChip() {
  const { activeChildId } = useActiveChild();
  const version = useChildrenVersion();
  const [children, setChildren] = useState<ChildProfile[]>([]);

  useEffect(() => {
    let cancelled = false;
    listChildren()
      .then((list) => {
        if (!cancelled) setChildren(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [activeChildId, version]);

  const active = children.find((c) => c.id === activeChildId) ?? null;

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
