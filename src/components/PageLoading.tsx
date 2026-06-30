// Lightweight, instant route fallback (used by each route's loading.tsx).
// Server component — pure markup + CSS animation, no JS needed.
export function PageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <main className="page">
      <div className="page-loading" role="status" aria-live="polite">
        <span className="page-loading-spinner" aria-hidden />
        <p className="page-loading-label">{label}</p>
      </div>
    </main>
  );
}
