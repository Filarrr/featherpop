"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Gamepad2, Gift, Home, Wand2 } from "lucide-react";

type LinkDef = {
  href: string;
  label: string;
  // When true, the label renders as a small 'Play' kicker on top of the
  // game name (per client: kids don't realize the nav items are games).
  prefix?: "Play";
  icon: typeof Home;
  featured?: boolean;
};

const links: LinkDef[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/sort", label: "Feather Match", icon: Wand2, prefix: "Play" },
  { href: "/play", label: "Letter Pop", icon: Gamepad2, prefix: "Play", featured: true },
  { href: "/word-hero", label: "Park Hunt", icon: Camera, prefix: "Play" },
  { href: "/rewards", label: "Prizes", icon: Gift },
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
            <span className="bottom-nav-label">
              {link.prefix ? (
                <small className="bottom-nav-prefix">{link.prefix}</small>
              ) : null}
              <span className="bottom-nav-name">{link.label}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
