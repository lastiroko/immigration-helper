import { Link } from 'react-router-dom';

const credibilityHooks = [
  'Wednesday morning is a walk-in window at every Kundenzentrum in Köln (until 12:00). Most guides won’t tell you that.',
  'You can use any Kundenzentrum in the city, not just the one in your district.',
  'The form your landlord must sign is called a Wohnungsgeberbescheinigung. Without it, you’ll be turned away.',
];

const whyUs = [
  'Every claim links to a Köln city source. No translated forum posts, no SEO blog spam.',
  'Written for international students and professionals just arriving from abroad — not a German translating their own bureaucracy.',
  'Free. No account. No affiliate commissions.',
];

export default function AnmeldungKoeln() {
  return (
    <div className="min-h-screen flex flex-col bg-helfa-cream text-helfa-ink">
      <header className="px-5 pt-6 pb-2 sm:px-8 sm:pt-8">
        <span className="display-headline text-sm tracking-[0.18em] text-helfa-slate">
          Helfa
        </span>
      </header>

      <main className="flex-1 px-5 sm:px-8">
        <section className="mx-auto max-w-[640px] pt-8 sm:pt-14">
          <h1 className="display-headline text-[clamp(2.5rem,11vw,5rem)]">
            Anmeldung in Köln, without the German.
          </h1>

          <p className="mt-6 text-[1.0625rem] leading-relaxed text-helfa-ink/80 sm:text-lg">
            A 14-day legal deadline, six required documents, nine Kundenzentren,
            two languages of confusion. We walk you through it once, perfectly.
            Free.
          </p>
        </section>

        <section className="mx-auto mt-10 max-w-[640px] space-y-3 sm:mt-14">
          {credibilityHooks.map((hook, i) => (
            <article
              key={i}
              className="surface-card px-5 py-4 text-[0.95rem] leading-relaxed text-helfa-ink/90 sm:text-base"
            >
              {hook}
            </article>
          ))}
        </section>

        <section className="mx-auto mt-12 flex max-w-[640px] flex-col items-center gap-2 sm:mt-16">
          <button
            type="button"
            className="btn-pill-cta w-full max-w-[320px]"
            aria-label="Start the Anmeldung walk-through"
          >
            Start — takes 4 minutes
          </button>
          <span className="text-xs text-helfa-slate">(building this next)</span>
        </section>

        <section className="mx-auto mt-20 max-w-[640px] sm:mt-28">
          <h2 className="display-headline text-xs uppercase tracking-[0.22em] text-helfa-slate">
            Why us
          </h2>
          <ul className="mt-4 space-y-3 text-[0.95rem] leading-relaxed text-helfa-ink/85 sm:text-base">
            {whyUs.map((line, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden className="mt-2 inline-block h-1 w-3 shrink-0 bg-helfa-ink" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="mt-24 border-t border-helfa-ink/10 px-5 py-8 text-xs leading-relaxed text-helfa-slate sm:px-8">
        <div className="mx-auto max-w-[640px] space-y-2">
          <p>
            We’re not lawyers. Official source for everything on this page is{' '}
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
          </p>
        </div>
      </footer>
    </div>
  );
}
