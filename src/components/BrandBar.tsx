"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Gift, HelpCircle, Home, Printer, Wallet } from "lucide-react";
import { SoundToggle } from "@/components/SoundToggle";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/how-to-play", label: "How to Play", icon: HelpCircle },
  { href: "/scan", label: "Scan", icon: Camera },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/print", label: "Print", icon: Printer },
];

export function BrandBar() {
  const pathname = usePathname();
  return (
    <header className="brandbar">
      <div className="brandbar-inner">
        <Link href="/" className="brand-mark" aria-label="Ms. Feather Pop home">
          <Image
            src="/media/logo-dark.jpeg"
            alt=""
            width={44}
            height={44}
            priority
          />
          <span>
            <strong>Ms. Feather Pop</strong>
            <small>Word Quest</small>
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

        <SoundToggle />
      </div>
    </header>
  );
}
