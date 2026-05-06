import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const primaryHref = isAuthenticated ? '/dashboard' : '/register';
  const primaryLabel = isAuthenticated ? 'Open my plan' : 'Build my plan';

  return (
    <div className="min-h-screen bg-helfa-cream text-helfa-ink">
      <TopNav isAuthenticated={isAuthenticated} />
      <Hero primaryHref={primaryHref} primaryLabel={primaryLabel} />
      <TrustStrip />
      <WhyItMatters />
      <Eligibility />
      <ApplySteps primaryHref={primaryHref} primaryLabel={primaryLabel} />
      <RequiredDocuments />
      <WhatYouCanDo />
      <VerifyBand />
      <BottomFooter />
    </div>
  );
}

function TopNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <header className="sticky top-0 z-30 bg-helfa-cream/85 backdrop-blur border-b border-helfa-ink/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-full bg-helfa-lime flex items-center justify-center text-helfa-ink font-display text-base">H</span>
          <span className="font-display text-lg uppercase tracking-tightest">Helfa</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-helfa-ink/70">
          <a href="#why" className="hover:text-helfa-ink">Why Helfa</a>
          <a href="#eligibility" className="hover:text-helfa-ink">Eligibility</a>
          <a href="#steps" className="hover:text-helfa-ink">How it works</a>
          <a href="#docs" className="hover:text-helfa-ink">Documents</a>
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-pill-lime !py-2 !px-4 text-sm">
              Open dashboard <ArrowRight />
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline text-sm font-medium hover:opacity-80">
                Sign in
              </Link>
              <Link to="/register" className="btn-pill-lime !py-2 !px-4 text-sm">
                Get started <ArrowRight />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero({ primaryHref, primaryLabel }: { primaryHref: string; primaryLabel: string }) {
  return (
    <section className="relative overflow-hidden bg-helfa-dark text-white">
      {/* faint giant wallpaper text */}
      <div aria-hidden className="absolute inset-0 flex items-center justify-end pointer-events-none">
        <span className="font-display uppercase text-helfa-deep/70 text-[18rem] sm:text-[22rem] leading-none -mr-16 select-none">
          HELFA
        </span>
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-24 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <span className="badge-pill bg-white/10 text-white/80 backdrop-blur">
            Made for newcomers · Munich · Berlin · Stuttgart
          </span>
          <h1 className="display-headline text-5xl sm:text-7xl lg:text-8xl mt-6">
            GET YOUR <span className="text-helfa-lime underline decoration-helfa-lime/60 decoration-[6px] underline-offset-[10px]">OFFICIAL</span><br />
            HELFA PLAN
          </h1>
          <p className="mt-7 max-w-xl text-base text-white/70 leading-relaxed">
            A personalised task list that turns the German immigration maze into clear,
            ordered steps — from Anmeldung and your visa appointment to opening a bank
            account and finding a flat.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link to={primaryHref} className="btn-pill-lime">
              {primaryLabel} <ArrowRight />
            </Link>
            <a href="#eligibility" className="btn-pill-outline !bg-transparent !text-white !border-white/30 hover:!border-white">
              Check eligibility
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-wider text-white/60">
            <span>✓ Built by people who moved here</span>
            <span>✓ 100 % free to start</span>
            <span>✓ Trusted by 8 000+ newcomers</span>
          </div>
        </div>

        {/* phone-card mockup */}
        <div className="lg:col-span-5 relative">
          <PlanCardMock />
        </div>
      </div>
    </section>
  );
}

function PlanCardMock() {
  return (
    <div className="relative">
      <div className="absolute -top-3 -right-3 z-10 bg-helfa-lime text-helfa-ink text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md rotate-3 shadow-md">
        Live preview
      </div>
      <div className="rounded-3xl bg-helfa-deep/80 ring-1 ring-helfa-lime/20 p-5 backdrop-blur">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <div className="h-10 w-10 rounded-full bg-helfa-lime/30 grid place-items-center font-display text-helfa-lime">A</div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Aisha · Nigeria → Munich</div>
            <div className="text-xs text-white/50">Student visa · arrives in 18 days</div>
          </div>
          <span className="badge-pill bg-helfa-lime text-helfa-ink">PLAN</span>
        </div>
        <div className="mt-4 space-y-2.5">
          <PlanRow status="done" title="Book Anmeldung appointment" due="last week" />
          <PlanRow status="due" title="Open blocked account (Sperrkonto)" due="due in 3 days" />
          <PlanRow status="due" title="Get health insurance offer" due="due in 5 days" />
          <PlanRow status="upcoming" title="Confirm dorm address" due="next Tue" />
          <PlanRow status="upcoming" title="Visa appointment — Ausländerbehörde" due="May 22" />
        </div>
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
          <span>5 of 14 tasks complete</span>
          <span className="text-helfa-lime">on track →</span>
        </div>
      </div>
    </div>
  );
}

function PlanRow({ status, title, due }: { status: 'done' | 'due' | 'upcoming'; title: string; due: string }) {
  const dot =
    status === 'done' ? 'bg-helfa-lime' :
    status === 'due' ? 'bg-amber-300' : 'bg-white/30';
  const text = status === 'done' ? 'line-through text-white/40' : 'text-white/90';
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] transition px-3 py-2.5">
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
      <span className={`flex-1 text-sm ${text}`}>{title}</span>
      <span className="text-[11px] text-white/50">{due}</span>
    </div>
  );
}

function TrustStrip() {
  const stats = [
    { v: '8.2k+', l: 'newcomers helped' },
    { v: '14k+', l: 'tasks completed' },
    { v: '3', l: 'cities supported' },
    { v: '100%', l: 'free to start' },
  ];
  return (
    <section className="bg-helfa-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-helfa-ink/60">
          Trusted by newcomers across Germany
        </p>
        <p className="text-center text-sm text-helfa-slate mt-2">
          A growing community building a clearer path to settling in.
        </p>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-display text-5xl md:text-6xl tracking-tightest">{s.v}</div>
              <div className="mt-2 text-xs uppercase tracking-wider text-helfa-slate">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyItMatters() {
  const cards = [
    { icon: '🪪', title: 'Personal task list', body: 'Answer six questions; we generate the exact paperwork sequence for your visa pathway and city.' },
    { icon: '🏛️', title: 'Find the right office', body: 'Bürgeramt, Ausländerbehörde, Finanzamt — search vetted offices with booking links and phone numbers.' },
    { icon: '🤝', title: 'Vetted partners', body: 'Banks, insurance, housing, translation. Commission disclosed on every card — no hidden incentives.' },
    { icon: '⏱️', title: 'Deadline aware', body: 'Smart reminders so you don\'t miss the 14-day Anmeldung window or the visa-appointment cutoff.' },
  ];
  return (
    <section id="why" className="bg-helfa-stone">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <h2 className="display-headline text-5xl lg:text-6xl">
            WHY<br />IT<br />MATTERS
          </h2>
          <p className="mt-6 text-helfa-slate max-w-sm">
            Settling in Germany is mostly a paperwork problem. Helfa turns it into
            an ordered checklist with the right form, the right office, and the right
            deadline — already filled in for your situation.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="badge-pill bg-helfa-lime text-helfa-ink">✓ Pathway-aware</span>
            <span className="badge-pill bg-helfa-ink text-white">✓ Free to apply</span>
            <span className="badge-pill bg-white text-helfa-ink border border-helfa-ink/10">✓ Built for Munich first</span>
          </div>
        </div>
        <div className="lg:col-span-8 grid sm:grid-cols-2 gap-4">
          {cards.map((c) => (
            <div key={c.title} className="surface-card p-6">
              <div className="h-10 w-10 rounded-full bg-helfa-ink text-helfa-lime grid place-items-center text-base">
                {c.icon}
              </div>
              <h3 className="mt-5 font-bold text-lg">{c.title}</h3>
              <p className="mt-2 text-sm text-helfa-slate leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Eligibility() {
  const items = [
    { n: 1, t: 'Moving to or already in Germany', d: 'You have arrived recently or have a confirmed move date.' },
    { n: 2, t: 'A visa pathway you fit', d: 'Student, Blue Card, Chancenkarte, family reunion, refugee — Helfa supports all of them.' },
    { n: 3, t: 'A supported city', d: 'Munich, Berlin or Stuttgart for now. More cities rolling out monthly.' },
    { n: 4, t: 'Willingness to do the steps', d: 'Helfa lines up the work — you still need to attend the appointments.' },
  ];
  return (
    <section id="eligibility" className="relative bg-helfa-dark text-white overflow-hidden">
      <div aria-hidden className="absolute inset-0 flex items-center justify-start pointer-events-none">
        <span className="font-display uppercase text-helfa-deep/60 text-[14rem] -ml-8 leading-none select-none">
          ELIGIBILITY
        </span>
      </div>
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <p className="text-xs uppercase tracking-[0.2em] text-helfa-lime">Requirements</p>
          <h2 className="display-headline text-5xl lg:text-6xl mt-3">
            WHO CAN<br />APPLY?
          </h2>
          <p className="mt-6 max-w-md text-white/70">
            Helfa is built for people moving to Germany on a long-stay visa. If any of
            the four boxes don't fit — no worries, we'll tell you upfront in the onboarding.
          </p>
          <Link to="/register" className="btn-pill-outline mt-8 !bg-transparent !text-white !border-white/30 hover:!border-white">
            View required documents
          </Link>
        </div>
        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-6 sm:p-8">
            <ul className="divide-y divide-white/10">
              {items.map((i) => (
                <li key={i.n} className="py-4 flex gap-4">
                  <span className="h-7 w-7 shrink-0 rounded-full bg-helfa-lime text-helfa-ink font-semibold grid place-items-center text-sm">
                    {i.n}
                  </span>
                  <div>
                    <div className="font-semibold">{i.t}</div>
                    <div className="text-sm text-white/60 mt-1">{i.d}</div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-white/50">
              Don't fit yet? Sign up anyway — we'll email you when your city or pathway opens.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ApplySteps({ primaryHref, primaryLabel }: { primaryHref: string; primaryLabel: string }) {
  const steps = [
    { n: '01', icon: '📝', title: 'Onboard in 2 minutes', body: 'Tell us your nationality, city, visa pathway, family situation, and arrival date.' },
    { n: '02', icon: '✅', title: 'Get your task plan', body: 'Helfa generates the ordered list of forms, offices, and deadlines for your situation.' },
    { n: '03', icon: '🚀', title: 'Tick off the steps', body: 'Mark tasks complete, postpone, or hand off to a vetted partner from the marketplace.' },
  ];
  return (
    <section id="steps" className="bg-helfa-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="display-headline text-5xl lg:text-6xl">APPLY IN 3 STEPS</h2>
            <p className="mt-3 max-w-xl text-helfa-slate">
              Simple, transparent and entirely online — designed so you spend the morning
              getting things done, not deciphering forms.
            </p>
          </div>
          <span className="badge-pill bg-white text-helfa-ink border border-helfa-ink/10">
            Average setup time · 4 minutes
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="surface-card p-6 h-full">
                <div className="flex items-center justify-between">
                  <span className="font-display text-helfa-slate text-sm">{s.n}</span>
                  <span className="h-10 w-10 rounded-full bg-helfa-lime text-helfa-ink grid place-items-center text-base">
                    {s.icon}
                  </span>
                </div>
                <h3 className="mt-6 font-bold text-lg uppercase">{s.title}</h3>
                <p className="mt-2 text-sm text-helfa-slate leading-relaxed">{s.body}</p>
              </div>
              {i < steps.length - 1 && (
                <div aria-hidden className="hidden md:block absolute top-1/2 -right-3 w-6 border-t-2 border-dashed border-helfa-ink/20" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link to={primaryHref} className="btn-pill-dark">
            {primaryLabel} <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

function RequiredDocuments() {
  const docs = [
    { icon: '🪪', title: 'Passport', body: 'Photo page; valid for at least 12 more months.' },
    { icon: '📄', title: 'Visa or appointment letter', body: 'National D-visa, residence permit, or Ausländerbehörde appointment.' },
    { icon: '🏠', title: 'Address confirmation', body: 'Wohnungsgeberbestätigung from your landlord — required for Anmeldung.' },
  ];
  const sources = ['Anmeldung', 'Sperrkonto', 'Health insurance', 'Tax-ID', 'Residence permit', 'Bank IBAN'];
  return (
    <section id="docs" className="bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="display-headline text-4xl lg:text-5xl">REQUIRED DOCUMENTS</h2>
          <p className="mt-3 text-helfa-slate">
            Have these ready before you start. Helfa highlights what's missing and what's optional for your specific pathway.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {docs.map((d) => (
            <div key={d.title} className="surface-card p-7 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-helfa-ink text-helfa-lime grid place-items-center text-lg">
                {d.icon}
              </div>
              <h3 className="mt-5 font-bold">{d.title}</h3>
              <p className="mt-2 text-sm text-helfa-slate leading-relaxed">{d.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 surface-card p-6 sm:p-8 bg-helfa-cream">
          <p className="text-center text-xs uppercase tracking-wider text-helfa-slate">Things Helfa keeps track of</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {sources.map((s) => (
              <span key={s} className="badge-pill bg-white text-helfa-ink border border-helfa-ink/10">
                {s}
              </span>
            ))}
          </div>
          <p className="mt-5 text-center text-xs text-helfa-slate">
            ⚠ Don't have everything yet? Start onboarding anyway — Helfa schedules document tasks so you collect them in the right order.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhatYouCanDo() {
  const items = [
    { n: '01', t: 'Open a bank account', d: 'Sperrkonto and everyday IBANs from Helfa\'s vetted partners.' },
    { n: '02', t: 'Get health insurance', d: 'Compare statutory and private offers tailored to your visa.' },
    { n: '03', t: 'Find housing', d: 'Short-stay and long-term rentals with relocation help.' },
    { n: '04', t: 'Translate documents', d: 'Sworn translators for birth certificates, diplomas, contracts.' },
    { n: '05', t: 'Learn German', d: 'A1 → C1 with vetted Munich-based language schools.' },
    { n: '06', t: 'Tax & legal', d: 'Talk to a Steuerberater or immigration lawyer when it gets sticky.' },
  ];
  return (
    <section className="bg-helfa-ink text-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <h2 className="display-headline text-5xl lg:text-6xl">WHAT YOU<br />CAN DO</h2>
          <p className="mt-6 text-white/60 max-w-md text-sm leading-relaxed">
            Helfa isn't only a checklist — once you've got your plan, the marketplace
            connects you to vetted partners across the categories that matter for settling in.
          </p>
        </div>
        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-3">
          {items.map((i) => (
            <Link
              key={i.n}
              to="/marketplace"
              className="group rounded-2xl border border-white/10 hover:border-helfa-lime/60 hover:bg-white/[0.03] p-5 transition"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs text-white/40">#{i.n}</span>
                <span className="text-white/40 group-hover:text-helfa-lime transition">↗</span>
              </div>
              <div className="mt-6 font-bold uppercase tracking-tight">{i.t}</div>
              <div className="mt-1 text-xs text-white/50">{i.d}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function VerifyBand() {
  return (
    <section className="bg-helfa-lime text-helfa-ink">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 text-center">
        <h2 className="display-headline text-4xl lg:text-5xl">CHECK YOUR PATHWAY</h2>
        <p className="mt-3 text-helfa-ink/70">
          Tell us where you're from and what visa you're after — we'll show whether
          Helfa supports your route, instantly.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); window.location.href = '/register'; }}
          className="mt-7 flex flex-col sm:flex-row gap-2 sm:gap-0 max-w-xl mx-auto bg-white rounded-full p-1.5 shadow-card"
        >
          <input
            type="text"
            placeholder="e.g. Nigerian → student visa → Munich"
            className="flex-1 bg-transparent px-5 py-3 outline-none text-sm placeholder:text-helfa-ink/40"
          />
          <button type="submit" className="btn-pill-dark !py-2.5 text-sm">
            Check now <ArrowRight />
          </button>
        </form>
      </div>
    </section>
  );
}

function BottomFooter() {
  return (
    <footer className="relative bg-helfa-ink text-white overflow-hidden">
      <div aria-hidden className="absolute inset-x-0 bottom-0 flex items-end justify-center pointer-events-none">
        <span className="font-display uppercase text-white/[0.04] text-[10rem] sm:text-[16rem] leading-none select-none">
          DEUTSCHLAND
        </span>
      </div>
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-helfa-lime flex items-center justify-center text-helfa-ink font-display text-base">H</span>
              <span className="font-display text-lg uppercase tracking-tightest">Helfa</span>
            </Link>
            <p className="mt-4 text-sm text-white/60 max-w-xs">
              Your German immigration co-pilot — built for newcomers in Munich, Berlin and Stuttgart.
            </p>
          </div>
          <FooterCol title="Product" links={[
            { l: 'Build my plan', to: '/register' },
            { l: 'Sign in', to: '/login' },
            { l: 'Marketplace', to: '/marketplace' },
            { l: 'Offices', to: '/offices' },
          ]} />
          <FooterCol title="Company" links={[
            { l: 'Imprint', to: '/imprint' },
            { l: 'Privacy', to: '/privacy' },
            { l: 'Terms', to: '/terms' },
          ]} />
          <div>
            <p className="text-xs uppercase tracking-widest text-helfa-lime">Stay in the loop</p>
            <p className="mt-3 text-sm text-white/60">Monthly product notes — no spam, no marketplace pitches.</p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-4 flex bg-white/5 ring-1 ring-white/10 rounded-full p-1.5"
            >
              <input
                type="email"
                placeholder="you@email.com"
                className="flex-1 bg-transparent px-4 py-2 text-sm placeholder:text-white/40 outline-none"
              />
              <button type="submit" className="rounded-full bg-helfa-lime text-helfa-ink px-4 py-2 text-sm font-semibold">
                Go
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 text-xs text-white/50">
          <span>© {new Date().getFullYear()} Helfa. Built in Munich.</span>
          <span>🇩🇪 Made for newcomers settling in Germany</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { l: string; to: string }[] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-helfa-lime">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((x) => (
          <li key={x.l}>
            <Link to={x.to} className="text-sm text-white/70 hover:text-white">
              {x.l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M3 10a1 1 0 011-1h9.586L9.293 4.707a1 1 0 011.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L13.586 11H4a1 1 0 01-1-1z" />
    </svg>
  );
}
