"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Gamepad2, Gift, Home, Wand2 } from "lucide-react";

// Renders inside a <Link>, so it can read that link's pending state and show
// a small spinner on the tapped tab while the next page loads.
function NavPending() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`bottom-nav-pending ${pending ? "is-pending" : ""}`}
    />
  );
}

type LinkDef = {
  href: string;
  label: string;
  // When true, the label renders as a small 'Play' kicker on top of the
  // game name (per client: kids don't realize the nav items are games).
  prefix?: "Play";
  icon: typeof Home;
  featured?: boolean;
};

// Park Hunt is intentionally NOT a bottom-nav destination — it's a contextual
// flow that opens after the eagle hands the child a target word. Bottom nav
// is the always-on shortcut to the things the child reaches between sessions.
const links: LinkDef[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/sort", label: "Feather Match", icon: Wand2, prefix: "Play" },
  { href: "/play", label: "Letter Pop", icon: Gamepad2, prefix: "Play", featured: true },
  { href: "/progress", label: "My Progress", icon: BarChart3 },
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
            <span className="bottom-nav-icon">
              <Icon aria-hidden className="h-5 w-5" />
              <NavPending />
            </span>
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
