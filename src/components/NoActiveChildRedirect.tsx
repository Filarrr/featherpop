"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useActiveChild } from "@/lib/use-active-child";

/**
 * Renders nothing. When children exist on the account but no active child is
 * selected, push the user to the profile picker so home isn't a dead end.
 */
export function NoActiveChildRedirect({
  hasChildren,
  to = "/account/profiles",
}: {
  hasChildren: boolean;
  to?: string;
}) {
  const router = useRouter();
  const { ready, activeChildId } = useActiveChild();
  useEffect(() => {
    if (hasChildren && ready && !activeChildId) {
      router.replace(to);
    }
  }, [hasChildren, ready, activeChildId, router, to]);
  return null;
}
