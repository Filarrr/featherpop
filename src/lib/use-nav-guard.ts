"use client";

// Register an "in-progress" flag with the global NavGuardProvider.
// While the flag is true, the provider intercepts any <Link> click in
// the document and shows the on-brand "Leave the game?" modal instead
// of letting the navigation through. Hard navigations (refresh / tab
// close) still use the browser's native beforeunload dialog — there's
// no way to customize that one.
//
// Each call site gets its own key so multiple components can guard at
// the same time without stomping on each other.

import { useEffect, useId } from "react";
import { useNavGuardContext } from "@/components/NavGuardProvider";

export function useNavGuard(active: boolean) {
  const id = useId();
  const ctx = useNavGuardContext();
  useEffect(() => {
    ctx.setActive(id, active);
    return () => ctx.setActive(id, false);
  }, [ctx, id, active]);
}
