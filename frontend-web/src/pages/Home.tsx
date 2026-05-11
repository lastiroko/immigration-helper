import { Link } from 'react-router-dom';
import { CheckIcon } from './anmeldung-koeln/components/CheckIcon';

/**
 * Public landing at `/`. Previously the root was a ProtectedRoute that
 * sent unauthenticated visitors to /login — an auth wall for what is
 * actually a public product. This page replaces that: people who hit
 * the bare domain see what Helfa is and can pick a sub-product.
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-helfa-cream text-helfa-ink">
      <header className="px-5 pt-6 pb-2 sm:px-8 sm:pt-8">
        <span className="display-headline text-sm tracking-[0.18em] text-helfa-slate">
          Helfa
        </span>
      </header>

      <main className="flex-1 px-5 sm:px-8">
        <section className="relative mx-auto max-w-[720px] pt-10 sm:pt-16">
          <span
            className="ghost-watermark text-[clamp(4.5rem,20vw,10rem)] -top-2 left-0 right-0 text-center sm:text-left sm:left-[-0.25em]"
            aria-hidden
          >
            Helfa
          </span>
          <div className="relative">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-helfa-slate">
              Köln · German bureaucracy · in English
            </p>
            <h1 className="display-headline text-[clamp(2.75rem,11vw,5.5rem)]">
              German bureaucracy,{' '}
              <span className="headline-accent">in plain English.</span>
            </h1>
            <p className="mt-6 text-[1.0625rem] leading-relaxed text-helfa-ink/80 sm:text-lg">
              We walk you through one bureaucracy step at a time. No signup,
              no email. Everything stays in your browser. Free.
            </p>
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-[720px] sm:mt-12">
          <div className="flex flex-wrap gap-2">
            {[
              'No signup',
              'No data leaves your browser',
              'Fills official forms for you',
            ].map((label) => (
              <span key={label} className="chip-fact">
                <CheckIcon />
                {label}
              </span>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-[720px] grid gap-4 sm:grid-cols-2">
          <Link
            to="/anmeldung-koeln"
            className="surface-card block px-6 py-6 transition hover:border-helfa-ink/40 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-helfa-slate">
              Step 1 · everyone
            </p>
            <h2 className="display-headline mt-2 text-2xl sm:text-3xl">
              Anmeldung in Köln
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-helfa-ink/80">
              Register your address within 14 days of moving in. Six
              documents, nine Kundenzentren, one walk-through. Fills Köln's
              official Anmeldeformular for you.
            </p>
            <p className="mt-4 text-sm font-semibold text-helfa-ink">
              Start →
            </p>
          </Link>

          <Link
            to="/auslaenderbehoerde-koeln"
            className="surface-card block px-6 py-6 transition hover:border-helfa-ink/40 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-helfa-slate">
              Step 2 · non-EU only
            </p>
            <h2 className="display-headline mt-2 text-2xl sm:text-3xl">
              Residence permit
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-helfa-ink/80">
              Once you're registered, get your Aufenthaltstitel. Routes you
              to the right Bezirksausländeramt by postal code. Fills form
              33-F07 for you.
            </p>
            <p className="mt-4 text-sm font-semibold text-helfa-ink">
              Start →
            </p>
          </Link>
        </section>

        <section className="mx-auto mt-20 max-w-[720px] sm:mt-28">
          <h2 className="display-headline text-xs uppercase tracking-[0.22em] text-helfa-slate">
            Why us
          </h2>
          <ul className="mt-4 space-y-3 text-[0.95rem] leading-relaxed text-helfa-ink/85 sm:text-base">
            <li className="flex gap-3">
              <span aria-hidden className="mt-2 inline-block h-1 w-3 shrink-0 bg-helfa-ink" />
              <span>
                Every fact links to an official source — stadt-koeln.de,
                BAMF, AufenthG. No translated forum scraps.
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="mt-2 inline-block h-1 w-3 shrink-0 bg-helfa-ink" />
              <span>
                We fill Köln's actual government PDFs in your browser. Print,
                sign, hand in. The clerk gets their own form, just typed.
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="mt-2 inline-block h-1 w-3 shrink-0 bg-helfa-ink" />
              <span>
                Did Anmeldung here? We auto-fill your residence permit form
                with the data you already entered. No re-typing.
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="mt-2 inline-block h-1 w-3 shrink-0 bg-helfa-ink" />
              <span>
                Free. No account. No affiliates. No newsletter.
              </span>
            </li>
          </ul>
        </section>
      </main>

      <footer className="mt-24 border-t border-helfa-ink/10 px-5 py-8 text-xs leading-relaxed text-helfa-slate sm:px-8">
        <div className="mx-auto max-w-[720px] space-y-2">
          <p>
            We're not lawyers. Köln-only for now. If something on the page
            looks wrong, tell us — we fix it the same day.
          </p>
          <p className="space-x-3">
            <Link to="/imprint" className="hover:text-helfa-ink">Imprint</Link>
            <span aria-hidden>·</span>
            <Link to="/privacy" className="hover:text-helfa-ink">Privacy</Link>
            <span aria-hidden>·</span>
            <Link to="/terms" className="hover:text-helfa-ink">Terms</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
