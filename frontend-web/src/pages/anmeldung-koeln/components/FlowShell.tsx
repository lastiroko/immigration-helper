import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type FlowShellProps = {
  children: ReactNode;
  /** Optional click handler for the back chevron in the header. */
  onBack?: () => void;
  /** Optional reset action for the small "Restart" link in the footer. */
  onReset?: () => void;
};

export function FlowShell({ children, onBack, onReset }: FlowShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-helfa-cream text-helfa-ink">
      <header className="px-5 pt-6 pb-2 sm:px-8 sm:pt-8">
        <div className="mx-auto flex max-w-[640px] items-center justify-between">
          <span className="display-headline text-sm tracking-[0.18em] text-helfa-slate">
            Helfa
          </span>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-medium text-helfa-slate hover:text-helfa-ink"
              aria-label="Back to previous step"
            >
              ← Back
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 px-5 sm:px-8">
        <div className="mx-auto max-w-[640px]">{children}</div>
      </main>

      <footer className="mt-24 border-t border-helfa-ink/10 px-5 py-8 text-xs leading-relaxed text-helfa-slate sm:px-8">
        <div className="mx-auto max-w-[640px] space-y-2">
          <p>
            We're not lawyers. Official source for everything on this page is{' '}
            <a
              href="https://www.stadt-koeln.de/leben-in-koeln/an-um-melden/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-helfa-slate/40 underline-offset-2 hover:decoration-helfa-ink"
            >
              stadt-koeln.de
            </a>
            . If you spot an error, tell us — we fix it the same day.
          </p>
          <p className="space-x-3">
            <Link to="/imprint" className="hover:text-helfa-ink">Imprint</Link>
            <span aria-hidden>·</span>
            <Link to="/privacy" className="hover:text-helfa-ink">Privacy</Link>
            {onReset && (
              <>
                <span aria-hidden>·</span>
                <button
                  type="button"
                  onClick={onReset}
                  className="hover:text-helfa-ink"
                >
                  Restart from beginning
                </button>
              </>
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}
