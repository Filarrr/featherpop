"use client";

// Client context for the active child. Server components hydrate it once via
// <ActiveChildProvider>, client components read via useActiveChild(), and
// mutations go through server actions that revalidatePath the layout — the
// provider is then re-rendered with fresh data.

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { ChildProgress, ChildProfile, defaultChildProgress } from "./child-profile";

export interface ActiveChildContextValue {
  activeChildId: string | null;
  active: ChildProfile | null;
  children: ChildProfile[];
  progress: ChildProgress;
  // Optional readiness flag used by some client pages
  ready?: boolean;
  // Backwards-compatible setter used by some client components
  setProgress: (p: ChildProgress) => void;
  setActiveChildId: (id: string | null) => void;
}

const ActiveChildContext = createContext<ActiveChildContextValue>({
  activeChildId: null,
  active: null,
  children: [],
  progress: defaultChildProgress,
  setProgress: () => {},
  setActiveChildId: () => {},
});


export function ActiveChildProvider({
  value,
  children,
}: {
  value: ActiveChildContextValue;
  children: ReactNode;
}) {
  return (
    <ActiveChildContext.Provider value={value}>
      {children}
    </ActiveChildContext.Provider>
  );
}

export function useActiveChild(): ActiveChildContextValue {
  const ctx = useContext(ActiveChildContext);
  // Always merge over defaults so a partial/legacy progress object can never
  // leave a numeric field undefined (which crashed pages calling
  // .toLocaleString() on it, e.g. featherPop on Progress/Rewards).
  return { ...ctx, progress: { ...defaultChildProgress, ...ctx.progress }, setProgress: ctx.setProgress ?? (() => {}) };
}

// Backwards-compatible client helpers expected by some client components.
import { setActiveChildId as _setActiveChildId, activeChildKey } from "./child-profile";

export function setActiveChildIdGlobal(id: string | null) {
  try {
    _setActiveChildId(id);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("ms-feather-active-child-changed"));
    }
  } catch {
    // noop in SSR or if localStorage is unavailable
  }
}

export function bumpChildrenVersion() {
  try {
    if (typeof window === "undefined") return;
    const key = "ms-feather-children-version";
    const v = Number(window.localStorage.getItem(key) || "0") + 1;
    window.localStorage.setItem(key, String(v));
    window.dispatchEvent(new Event("ms-feather-children-version-changed"));
  } catch {
    // noop
  }
}

// Hook to read the children-version counter and update when bumped elsewhere.
export function useChildrenVersion(): number {
  const [v, setV] = useState(() => {
    if (typeof window === "undefined") return 0;
    return Number(window.localStorage.getItem("ms-feather-children-version") || "0");
  });
  useEffect(() => {
    const h = () => setV(Number(window.localStorage.getItem("ms-feather-children-version") || "0"));
    if (typeof window !== "undefined") {
      window.addEventListener("ms-feather-children-version-changed", h);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("ms-feather-children-version-changed", h);
      }
    };
  }, []);
  return v;
}
