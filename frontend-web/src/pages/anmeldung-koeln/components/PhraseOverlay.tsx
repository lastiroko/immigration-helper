import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type PhraseOverlayProps = {
  english: string;
  german: string;
  pronunciation: string;
  onClose: () => void;
};

/**
 * Full-screen overlay for showing one German phrase in massive type so the
 * user can hold the phone up to a Bürgeramt clerk. Renders into document.body
 * via a portal, locks body scroll while open, dismissible by tap or Escape.
 *
 * Accessibility:
 * - role=dialog + aria-modal so screen readers announce it as a modal
 * - Initial focus on the Close button (consistent target for keyboard users)
 * - Original focus restored on close (so the underlying trigger gets focus back)
 * - Escape closes
 * - aria-hidden on decorative bits
 */
export function PhraseOverlay({
  english,
  german,
  pronunciation,
  onClose,
}: PhraseOverlayProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Remember what had focus before we opened
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    // Lock body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Move focus into the overlay
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      // Restore focus to whatever opened the overlay
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  // Avoid swallowing clicks inside the dialog content — we want only
  // clicks on the backdrop (the outer div) to close.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`German phrase: ${english}`}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex flex-col bg-helfa-ink text-white"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 z-10 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-helfa-lime"
        aria-label="Close phrase overlay"
      >
        Close <span aria-hidden>✕</span>
      </button>

      <div
        className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p
          className="text-sm font-semibold uppercase tracking-[0.22em] text-helfa-lime"
          aria-hidden
        >
          Show this to the clerk
        </p>

        <p className="mt-4 max-w-3xl text-sm font-medium uppercase tracking-[0.18em] text-white/60">
          {english}
        </p>

        <h2
          lang="de"
          className="display-headline mt-8 max-w-4xl text-[clamp(2.5rem,9vw,5.5rem)] leading-[1.05]"
          style={{ textTransform: 'none' }}
        >
          {german}
        </h2>

        <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
          <span
            className="font-semibold uppercase tracking-[0.18em] text-white/50"
            aria-hidden
          >
            Sounds like
          </span>
          <br />
          <span aria-label={`Pronunciation: ${pronunciation}`}>
            {pronunciation}
          </span>
        </p>

        <p className="mt-12 text-xs text-white/40" aria-hidden>
          Tap anywhere to close
        </p>
      </div>
    </div>,
    document.body,
  );
}
