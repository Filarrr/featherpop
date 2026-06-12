"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Gamepad2, Gift, Home, Wand2 } from "lucide-react";

// 5 items, Letter Pop centered + styled as the featured button.
// Feathers moved off the bottom nav — accessible from Prizes and the
// BrandBar (it was making the row feel crowded on phones).
const links = [
  { href: "/", label: "Home", icon: Home, featured: false },
  { href: "/sort", label: "Feather Match", icon: Wand2, featured: false },
  { href: "/play", label: "Letter Pop", icon: Gamepad2, featured: true },
  // Free users hit Word Hero (in-app game); membership flow can route
  // members to /scan for the physical 6-station park hunt later.
  { href: "/word-hero", label: "Park Hunt", icon: Camera, featured: false },
  { href: "/rewards", label: "Prizes", icon: Gift, featured: false },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
    return null;
  }
  return (
    <nav className="bottom-nav" aria-label="Game navigation">
      {links.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname?.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`${isActive ? "is-active" : ""} ${
              link.featured ? "is-featured" : ""
            }`}
          >
            <Icon aria-hidden className="h-5 w-5" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
