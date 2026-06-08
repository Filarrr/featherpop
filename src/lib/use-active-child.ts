"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  ChildProgress,
  defaultChildProgress,
  readChildProgress,
  saveChildProgress,
  activeChildKey,
} from "./child-profile";
import { getChildProgressAction } from "./child-progress-actions";
import { saveProgress, readProgress } from "./player";

export interface UseActiveChild {
  activeChildId: string | null;
  progress: ChildProgress;
  ready: boolean;
  setActiveChildId: (id: string | null) => void;
  refresh: () => void;
  setProgress: (p: ChildProgress) => void;
}

// --- Module-level shared store ---------------------------------------------
// Every <Component /> that calls useActiveChild() subscribes to the same
// `currentActiveId` slot. setActiveChildId() in any island instantly
// re-renders every other island in the same tab.

let currentActiveId: string | null = null;
let initialized = false;
let childrenVersion = 0;
const subs = new Set<() => void>();

function readFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(activeChildKey);
  } catch {
    return null;
  }
}

function notify() {
  for (const s of subs) s();
}

function subscribe(cb: () => void) {
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
}

function getSnapshot(): string | null {
  return currentActiveId;
}

function getServerSnapshot(): string | null {
  return null;
}

/** Set active child everywhere (writes localStorage + notifies all subscribers). */
export function setActiveChildIdGlobal(id: string | null) {
  if (typeof window !== "undefined") {
    try {
      if (id) window.localStorage.setItem(activeChildKey, id);
      else window.localStorage.removeItem(activeChildKey);
    } catch {
      /* ignore */
    }
  }
  currentActiveId = id;
  notify();
}

/** Bump version to force children-list re-reads (e.g. after add/remove). */
export function bumpChildrenVersion() {
  childrenVersion += 1;
  notify();
}

function getChildrenVersionSnapshot(): number {
  return childrenVersion;
}

export function useChildrenVersion(): number {
  return useSyncExternalStore(subscribe, getChildrenVersionSnapshot, () => 0);
}

// ---------------------------------------------------------------------------

function mirrorLegacy(p: ChildProgress) {
  const legacy = readProgress();
  saveProgress({ ...legacy, totalFeatherPop: p.featherPop });
}

export function useActiveChild(): UseActiveChild {
  const activeChildId = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [progress, setProgressState] = useState<ChildProgress>(defaultChildProgress);
  const [ready, setReady] = useState(false);

  // Hydrate the module store from localStorage on first mount.
  useEffect(() => {
    if (!initialized && typeof window !== "undefined") {
      initialized = true;
      const id = readFromStorage();
      if (id !== currentActiveId) {
        currentActiveId = id;
        notify();
      }
    }
    function onStorage(e: StorageEvent) {
      if (e.key === activeChildKey) {
        currentActiveId = readFromStorage();
        notify();
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Reload progress whenever activeChildId changes.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (!activeChildId) {
          setProgressState(defaultChildProgress);
          return;
        }
        try {
          const cached = readChildProgress(activeChildId);
          setProgressState(cached);
          try { mirrorLegacy(cached); } catch { /* quota / disabled storage */ }
        } catch { /* corrupt cache — keep default */ }
      } finally {
        setReady(true);
      }
      try {
        const server = await getChildProgressAction(activeChildId);
        if (cancelled) return;
        setProgressState(server);
        try { saveChildProgress(activeChildId, server); } catch {}
        try { mirrorLegacy(server); } catch {}
      } catch {
        /* offline / unauthed — keep cache */
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [activeChildId]);

  const setActiveChildId = useCallback((id: string | null) => {
    setActiveChildIdGlobal(id);
  }, []);

  const setProgress = useCallback(
    (p: ChildProgress) => {
      if (!activeChildId) return;
      setProgressState(p);
      saveChildProgress(activeChildId, p);
      mirrorLegacy(p);
    },
    [activeChildId],
  );

  const refresh = useCallback(() => {
    // Force progress reload by re-running the effect via a no-op state set.
    setProgressState((p) => ({ ...p }));
  }, []);

  return {
    activeChildId,
    progress,
    ready,
    setActiveChildId,
    refresh,
    setProgress,
  };
}
