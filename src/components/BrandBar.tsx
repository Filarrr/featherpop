"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Camera, Feather, Gamepad2, Gift, Home, Wand2 } from "lucide-react";
import { SoundToggle } from "@/components/SoundToggle";
import { ActiveChildChip } from "@/components/ActiveChildChip";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/sort", label: "Play Feather Match", icon: Wand2 },
  { href: "/play", label: "Play Letter Pop", icon: Gamepad2 },
  { href: "/scan", label: "Play ParkHunt Scan", icon: Camera },
  { href: "/feathers", label: "Feathers", icon: Feather },
  { href: "/rewards", label: "Prizes", icon: Gift },
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
            <small>Feather Adventures</small>
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
