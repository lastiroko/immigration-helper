/**
 * Generic loading fallback for Suspense boundaries. Used while the
 * pdf-lib chunk (and any other lazy chunks we add later) is in flight.
 * Visually quiet — a single spinner + label, no skeleton-shimmer.
 */
export function LoadingFallback({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-3 py-6 text-sm text-helfa-slate"
    >
      <svg
        className="h-5 w-5 animate-spin text-helfa-ink"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="3"
        />
        <path
          d="M22 12a10 10 0 0 1-10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span>{label}</span>
    </div>
  );
}
