"use client";

// In-app "leave the game?" confirmation. Mounted once at the root
// layout; any component can request guarding via the useNavGuard
// hook (src/lib/use-nav-guard.ts). When a guard is registered and
// the kid taps a <Link> anywhere in the DOM, we preventDefault the
// click, swap in our own on-brand modal, and only push the route
// if they confirm.
//
// Hard navigations (refresh / tab close) still use the browser's
// native beforeunload dialog — that's the only thing the platform
// gives us for those events.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Sparkles } from "lucide-react";

interface NavGuardCtx {
  setActive: (key: string, active: boolean) => void;
}

const Ctx = createContext<NavGuardCtx | null>(null);

export function useNavGuardContext(): NavGuardCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNavGuardContext outside NavGuardProvider");
  return ctx;
}

export function NavGuardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const activeKeysRef = useRef<Set<string>>(new Set());
  const [activeCount, setActiveCount] = useState(0);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Register / deregister a guard by key. Children call this via the
  // useNavGuard hook. We count rather than a single bool so multiple
  // components can guard at once (e.g. game + modal).
  const setActive = useCallback((key: string, active: boolean) => {
    const set = activeKeysRef.current;
    const had = set.has(key);
    if (active && !had) set.add(key);
    else if (!active && had) set.delete(key);
    if (had !== active) setActiveCount(set.size);
  }, []);

  const guarded = activeCount > 0;

  // Browser-level: refresh / tab-close.
  useEffect(() => {
    if (!guarded) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "You're in the middle of a game. Leave anyway?";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [guarded]);

  // Client-side: catch every <Link> click in the document. Capture
  // phase so this runs before Next.js's own router-link handler.
  useEffect(() => {
    if (!guarded) return;
    function onClick(e: MouseEvent) {
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (anchor.target === "_blank") return;
      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;
        e.preventDefault();
        e.stopPropagation();
        // Use the absolute href (resolved against current location) so
        // relative links work, but strip the origin if same-origin so
        // router.push gets a path it likes.
        const sameOrigin = url.origin === window.location.origin;
        setPendingHref(sameOrigin ? `${url.pathname}${url.search}${url.hash}` : url.href);
      } catch {
        /* malformed — let it through */
      }
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [guarded]);

  function leave() {
    const href = pendingHref;
    setPendingHref(null);
    if (!href) return;
    // External link → full nav. Internal → router.push.
    if (/^https?:/.test(href)) window.location.href = href;
    else router.push(href);
  }
  function stay() {
    setPendingHref(null);
  }

  const value = useMemo<NavGuardCtx>(() => ({ setActive }), [setActive]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {pendingHref ? (
        <div className="nav-guard-overlay" role="dialog" aria-labelledby="nav-guard-title">
          <div className="nav-guard-card">
            <span className="nav-guard-eyebrow">
              <AlertTriangle aria-hidden className="h-4 w-4" />
              HOLD ON!
            </span>
            <div className="nav-guard-emoji" aria-hidden>
              <Sparkles className="h-10 w-10" />
            </div>
            <h2 id="nav-guard-title" className="nav-guard-title">
              You're in the middle of a game!
            </h2>
            <p className="nav-guard-sub">
              If you leave now, you'll lose your round. Are you sure?
            </p>
            <div className="nav-guard-actions">
              <button
                type="button"
                className="btn btn-gold btn-lg nav-guard-stay"
                onClick={stay}
                autoFocus
              >
                Keep playing
              </button>
              <button
                type="button"
                className="nav-guard-leave"
                onClick={leave}
              >
                Leave anyway
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Ctx.Provider>
  );
}
