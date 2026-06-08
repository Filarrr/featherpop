// No longer needed — the layout resolves active child server-side and
// pages redirect from the server. Left as a no-op shim to avoid breaking
// stale imports until the next sweep removes them.

export function NoActiveChildRedirect(_props: {
  hasChildren?: boolean;
  to?: string;
}): null {
  return null;
}
