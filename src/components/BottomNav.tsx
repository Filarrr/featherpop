"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Feather, Gamepad2, Home, Sparkles } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/scan", label: "Scan", icon: Camera },
  { href: "/missions", label: "Missions", icon: Sparkles },
  { href: "/feathers", label: "Feathers", icon: Feather },
  { href: "/play", label: "Letter Pop", icon: Gamepad2 },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
    return null;
  }
  return (
    <nav className="bottom-nav" aria-label="Quest navigation">
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
            className={isActive ? "is-active" : ""}
          >
            <Icon aria-hidden className="h-5 w-5" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
