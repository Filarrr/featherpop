"use client";

// Client context for the active child. Server components hydrate it once via
// <ActiveChildProvider>, client components read via useActiveChild(), and
// mutations go through server actions that revalidatePath the layout — the
// provider is then re-rendered with fresh data.

import { createContext, ReactNode, useContext } from "react";
import { ChildProgress, ChildProfile, defaultChildProgress } from "./child-profile";

export interface ActiveChildContextValue {
  activeChildId: string | null;
  active: ChildProfile | null;
  children: ChildProfile[];
  progress: ChildProgress;
}

const ActiveChildContext = createContext<ActiveChildContextValue>({
  activeChildId: null,
  active: null,
  children: [],
  progress: defaultChildProgress,
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
  return useContext(ActiveChildContext);
}
