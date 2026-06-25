"use client";

// Block accidental navigation while a game is in progress.
//
// When the `active` flag is true:
//   - Hard navigations (browser close / refresh) trigger the
//     browser's native beforeunload dialog.
//   - Client-side <Link> clicks anywhere in the document get a
//     window.confirm() — answer No and the navigation is canceled.
//
// We listen with capture: true so the click handler runs BEFORE
// Next.js's own router-link intercept. preventDefault + stopPropagation
// is enough to keep the kid on the page.

import { useEffect } from "react";

const DEFAULT_MESSAGE =
  "You're in the middle of a game. Leave anyway?";

export function useNavGuard(active: boolean, message: string = DEFAULT_MESSAGE) {
  useEffect(() => {
    if (!active) return;
    if (typeof window === "undefined") return;

    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      // Modern browsers ignore the custom string but still show the
      // generic "Leave site?" dialog when returnValue is non-empty.
      e.returnValue = message;
    }

    function onClick(e: MouseEvent) {
      // Only intercept primary clicks. Middle/cmd-click bypasses.
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      // Same-page anchors / mailto / tel / external new-tab — let through.
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (anchor.target === "_blank") return;

      // Heuristic: if the link points to the current pathname (a
      // refresh / same-page nav), don't prompt.
      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.pathname === window.location.pathname && url.search === window.location.search) {
          return;
        }
      } catch {
        /* fall through */
      }

      const ok = window.confirm(message);
      if (!ok) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [active, message]);
}
