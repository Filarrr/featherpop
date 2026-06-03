// Clerk 7.4.0 was built for Next 15's `middleware.ts` convention. Next 16
// renamed the file to `proxy.ts` but Turbopack's dev runtime doesn't yet wrap
// Clerk's handler correctly when the file is named `proxy.ts` — it throws
// "adapterFn is not a function" on the first request. Keep `middleware.ts`
// until Clerk ships native proxy.ts support.
//
// Hard gate: every route requires sign-in EXCEPT the public allowlist
// (auth pages, Stripe webhook, and static assets).

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublic = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/stripe/webhook(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) {
    await auth.protect({ unauthenticatedUrl: new URL("/sign-in", req.url).toString() });
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|.*\\..*).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
