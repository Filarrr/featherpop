"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Global navigation progress bar. Lights up the instant any internal link is
 * tapped and completes when the destination route renders, so even on a slow
 * network the app feels responsive (the #1 complaint was "buttons don't seem
 * clicked"). Pairs with each route's loading.tsx skeleton.
 *
 * Works by listening for link clicks at the document level (catches every
 * <Link>/<a> without touching each one) and clearing when usePathname changes.
 */
export function TopLoadingBar() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  // Start the bar on a real internal navigation click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented) return;
      // Ignore modified / non-left clicks (open-in-new-tab etc.)
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      if (anchor.hasAttribute("download")) return;
      const anchorTarget = anchor.getAttribute("target");
      if (anchorTarget && anchorTarget !== "_self") return;
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      // External links navigate away — no in-app bar.
      if (url.origin !== window.location.origin) return;
      // Same page → nothing to load.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      setActive(true);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Route changed → navigation finished, hide the bar.
  useEffect(() => {
    setActive(false);
  }, [pathname]);

  // Safety net: if navigation is cancelled (e.g. the nav-guard modal stops
  // it), don't leave the bar spinning forever.
  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => setActive(false), 6000);
    return () => window.clearTimeout(t);
  }, [active]);

  return <div className={`route-progress ${active ? "is-active" : ""}`} aria-hidden />;
}
