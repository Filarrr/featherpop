"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { BookOpen, Camera, Feather, Gamepad2, Gift, Home, Sparkles } from "lucide-react";
import { SoundToggle } from "@/components/SoundToggle";
import { ActiveChildChip } from "@/components/ActiveChildChip";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/scan", label: "Scan", icon: Camera },
  { href: "/missions", label: "Missions", icon: Sparkles },
  { href: "/feathers", label: "Feathers", icon: Feather },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/story", label: "Story", icon: BookOpen },
  { href: "/play", label: "Letter Pop", icon: Gamepad2 },
];

export function BrandBar() {
  const pathname = usePathname();
  if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
    return null;
  }
  return (
    <header className="brandbar">
      <div className="brandbar-inner">
        <Link href="/" className="brand-mark" aria-label="Ms. Feather Pop home">
          <span className="brand-avatar">
            <Image
              src="/media/avatars/feather-pop-head.png"
              alt=""
              width={48}
              height={48}
              priority
              unoptimized
            />
          </span>
          <span>
            <strong>Ms. Feather Pop</strong>
            <small>Feather Missions</small>
          </span>
        </Link>

        <nav className="top-nav" aria-label="Main">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={isActive ? "is-active" : ""}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="brandbar-actions">
          <ActiveChildChip />
          <SoundToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
