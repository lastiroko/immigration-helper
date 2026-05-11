import { useState } from 'react';
import type { FlowApi } from '../types';
import { BEZIRKSAUSLAENDERAEMTER, type BezirksamtName } from '../state';
import { StubShell } from './_StubShell';

export function Screen6Booking({ flow }: { flow: FlowApi }) {
  const [bezirksamt, setBezirksamt] = useState<BezirksamtName>('Innenstadt');

  const handleBook = () => {
    // Placeholder: real flow uses paste-to-parse confirmation like
    // Anmeldung 6B. For scaffold, just record a sentinel appointment.
    flow.update({
      appointment: {
        date: new Date().toISOString().slice(0, 10),
        time: 'TBC',
        bezirksamt,
      },
    });
  };

  return (
    <StubShell
      onBack={() => flow.update({ documentsConfirmed: false })}
      onReset={flow.reset}
    >
      <div className="pt-6 sm:pt-10 space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          Booking · scaffold (v0.2 spec)
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          9 Bezirksausländerämter.{' '}
          <span className="headline-accent">You go to the one for your district.</span>
        </h1>
        <p className="text-helfa-ink/80 leading-relaxed">
          Unlike Anmeldung — where any Kundenzentrum accepts you — the
          Ausländeramt is postal-code-routed. Pick the wrong office and
          they'll turn you away. Real PLZ → Bezirksamt mapping ships once
          per-district addresses are verified.
        </p>
      </div>

      <div className="mt-8">
        <label htmlFor="bezirksamt" className="block text-sm font-semibold text-helfa-ink">
          Your Bezirksausländeramt
        </label>
        <select
          id="bezirksamt"
          value={bezirksamt}
          onChange={(e) => setBezirksamt(e.target.value as BezirksamtName)}
          className="mt-2 w-full rounded-2xl border border-helfa-ink/15 bg-white px-4 py-3 text-base font-medium shadow-sm focus:border-helfa-ink focus:outline-none focus:ring-2 focus:ring-helfa-lime"
        >
          {BEZIRKSAUSLAENDERAEMTER.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-helfa-slate">
          Once we have PLZ → office mapping, this will auto-pick from your
          Köln address (read from your Anmeldung details).
        </p>
      </div>

      <div className="mt-8">
        <a
          href="https://www.stadt-koeln.de/artikel/06415/index.html#ziel_0_72"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pill-cta inline-flex"
        >
          Open Köln's appointment overview ↗
        </a>
      </div>

      <div className="mt-8">
        <button type="button" className="btn-pill-ghost" onClick={handleBook}>
          I've booked it (scaffold — record appointment)
        </button>
      </div>
    </StubShell>
  );
}
