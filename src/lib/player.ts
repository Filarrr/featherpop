// Intentionally empty. All player state moved to Clerk metadata via
// child-progress-actions.ts. Sound + music preferences remain in audio.ts.
//
// This file is kept (empty) so any stale "@/lib/player" import errors loudly
// instead of silently bringing back the deprecated localStorage layer.

export {};
