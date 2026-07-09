"use client";

import Link from "next/link";

export function StartQuest() {
  // Simple backward-compatible start button used on the home page.
  return (
    <Link href="/quest/welcome" className="btn btn-gold">
      <span>Start a quest</span>
    </Link>
  );
}
