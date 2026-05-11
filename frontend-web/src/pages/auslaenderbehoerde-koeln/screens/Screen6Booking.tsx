import { useMemo, useState } from 'react';
import type { FlowApi } from '../types';
import { Toast } from '../../anmeldung-koeln/components/Toast';
import { StubShell } from './_StubShell';
import {
  BEZIRKSAEMTER,
  bezirksamtForPostalCode,
  isMuelheim,
  BOOKING_URL,
} from '../bezirksaemter';
import { parseConfirmation } from '../parseConfirmation';
import { readAnmeldungSnapshot } from '../formFill';

export function Screen6Booking({ flow }: { flow: FlowApi }) {
  const anmeldung = readAnmeldungSnapshot();
  const koelnPLZ = anmeldung?.koelnPostalCode ?? '';
  const auto = bezirksamtForPostalCode(koelnPLZ);

  const [manualBezirksamt, setManualBezirksamt] = useState<string>(
    auto?.name ?? 'Innenstadt',
  );
  const selected = useMemo(
    () => BEZIRKSAEMTER.find((b) => b.name === manualBezirksamt) ?? auto ?? BEZIRKSAEMTER[0],
    [manualBezirksamt, auto],
  );

  const [pasted, setPasted] = useState('');
  const [manual, setManual] = useState({ date: '', time: '' });
  const [showManual, setShowManual] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleParse = () => {
    if (!pasted.trim()) {
      setToast('Paste your confirmation email body first.');
      return;
    }
    const parsed = parseConfirmation(pasted);
    const bezirksamtName = parsed.bezirksamt ?? selected.name;
    if (parsed.date && parsed.time) {
      flow.update({
        appointment: {
          date: parsed.date,
          time: parsed.time,
          bezirksamt: bezirksamtName,
        },
      });
      return;
    }
    setManual({ date: parsed.date ?? '', time: parsed.time ?? '' });
    setShowManual(true);
    setToast("We couldn't read the date/time — fill them in below.");
  };

  const handleManualSave = () => {
    if (!manual.date || !manual.time) {
      setToast('Please fill date and time.');
      return;
    }
    flow.update({
      appointment: {
        date: manual.date,
        time: manual.time,
        bezirksamt: selected.name,
      },
    });
  };

  return (
    <StubShell
      onBack={() => flow.update({ documentsConfirmed: false })}
      onReset={flow.reset}
    >
      <div className="pt-6 sm:pt-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          Booking
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          {auto
            ? <>Your Bezirksamt is <span className="headline-accent">{auto.name}.</span></>
            : <>9 Bezirksausländerämter. <span className="headline-accent">Pick yours by district.</span></>}
        </h1>
        {auto && (
          <p className="mt-3 text-helfa-ink/75 leading-relaxed">
            Routed automatically from your Anmeldung postal code (
            <strong>{koelnPLZ}</strong>). Override below if needed.
          </p>
        )}
        {!auto && (
          <p className="mt-3 text-helfa-ink/75 leading-relaxed">
            We don't have your Köln postal code yet
            {koelnPLZ
              ? ` (${koelnPLZ} doesn't match any of the 9 districts)`
              : ''}
            . Pick the office that covers your address.
          </p>
        )}
      </div>

      {/* Selected Bezirksamt card */}
      <article className="mt-8 surface-card overflow-hidden border-l-4 border-l-helfa-lime">
        <div className="px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-helfa-slate">
            Bezirksausländeramt
          </p>
          <h2 className="mt-1 font-semibold text-helfa-ink">{selected.name}</h2>
          <p className="mt-1 text-sm text-helfa-ink/80">
            {selected.street}, {selected.postalCode} Köln
          </p>
          <p className="mt-2 text-xs text-helfa-slate">
            Serves PLZ: {selected.postalCodesServed.join(', ')}
          </p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${selected.mapsQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pill-ghost mt-4 inline-flex"
          >
            Open in Google Maps ↗
          </a>
        </div>
      </article>

      {/* Mülheim caveat */}
      {isMuelheim(selected) && (
        <div className="mt-3 rounded-2xl border border-yellow-300 bg-yellow-50 px-5 py-3 text-sm leading-relaxed text-helfa-ink">
          <strong>Heads-up:</strong> Since 2026-01-01, Mülheim-resident
          applications are not processed at the Mülheim office due to
          staffing shortages. Call the Bürgertelefon (
          <a className="underline" href="tel:0221221-0">
            0221/221-0
          </a>
          ) before booking to confirm which office is handling Mülheim cases.
        </div>
      )}

      {/* Manual override */}
      <div className="mt-3">
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-helfa-slate hover:text-helfa-ink">
            Wrong office? Override here
          </summary>
          <select
            value={manualBezirksamt}
            onChange={(e) => setManualBezirksamt(e.target.value)}
            className="mt-2 w-full rounded-xl border border-helfa-ink/15 bg-white px-3 py-2 text-sm focus:border-helfa-ink focus:outline-none focus:ring-2 focus:ring-helfa-lime"
          >
            {BEZIRKSAEMTER.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name} — {b.street}
              </option>
            ))}
          </select>
        </details>
      </div>

      {/* Reality bullets */}
      <ul className="mt-6 space-y-3">
        <li className="surface-card px-5 py-4">
          <p className="font-semibold text-sm">Slots are scarce in Köln.</p>
          <p className="mt-1 text-sm text-helfa-ink/80 leading-relaxed">
            Months-long waitlists are common. New slots open in small batches
            (often early morning). Refresh daily.
          </p>
        </li>
        <li className="surface-card px-5 py-4">
          <p className="font-semibold text-sm">
            Apply 3 months before your visa expires, not later.
          </p>
          <p className="mt-1 text-sm text-helfa-ink/80 leading-relaxed">
            If your visa expires while you wait, the Fiktionsbescheinigung
            you receive at the appointment keeps you legal.
          </p>
        </li>
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pill-cta"
        >
          Open Köln's booking calendar ↗
        </a>
      </div>

      {/* Closing the loop */}
      <section className="mt-12 border-t border-helfa-ink/10 pt-8">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          When you've booked
        </p>
        <h2 className="display-headline mt-2 text-2xl sm:text-3xl">
          Bring your appointment back here.
        </h2>

        <div className="mt-5 surface-card px-5 py-4">
          <p className="font-semibold text-sm">Look for this email:</p>
          <ul className="mt-2 space-y-1 text-sm text-helfa-ink/85">
            <li>
              <span className="text-helfa-slate">Subject:</span>{' '}
              <em>Terminbestätigung</em>
            </li>
            <li>
              <span className="text-helfa-slate">From:</span> an address
              ending in{' '}
              <code className="rounded bg-helfa-stone/60 px-1.5 py-0.5 text-xs">
                stadt-koeln.de
              </code>
            </li>
          </ul>
        </div>

        <div className="mt-4">
          <label
            htmlFor="confirmationBody"
            className="block text-sm font-semibold text-helfa-ink"
          >
            Paste the email body
          </label>
          <p className="mt-1 text-xs text-helfa-slate leading-relaxed">
            We extract the date, time, and Bezirksamt locally — nothing
            leaves your browser.
          </p>
          <textarea
            id="confirmationBody"
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={6}
            placeholder="Sehr geehrte/r ..., hiermit bestätigen wir Ihren Termin am ..."
            className="mt-2 w-full rounded-2xl border border-helfa-ink/15 bg-white px-4 py-3 text-sm font-normal shadow-sm focus:border-helfa-ink focus:outline-none focus:ring-2 focus:ring-helfa-lime"
          />
          <button
            type="button"
            className="btn-pill-cta mt-3"
            onClick={handleParse}
          >
            Save my appointment
          </button>
        </div>

        {showManual && (
          <div className="mt-6 surface-card px-5 py-4">
            <p className="font-semibold text-sm">
              Fill what we couldn't read.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="block text-xs font-semibold text-helfa-slate">
                  Date
                </span>
                <input
                  type="date"
                  value={manual.date}
                  onChange={(e) =>
                    setManual((m) => ({ ...m, date: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-helfa-ink/15 bg-white px-3 py-2 text-sm focus:border-helfa-ink focus:outline-none focus:ring-2 focus:ring-helfa-lime"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-helfa-slate">
                  Time
                </span>
                <input
                  type="time"
                  value={manual.time}
                  onChange={(e) =>
                    setManual((m) => ({ ...m, time: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-helfa-ink/15 bg-white px-3 py-2 text-sm focus:border-helfa-ink focus:outline-none focus:ring-2 focus:ring-helfa-lime"
                />
              </label>
            </div>
            <p className="mt-3 text-xs text-helfa-slate">
              Saved for: <strong>Bezirksausländeramt {selected.name}</strong>
            </p>
            <button
              type="button"
              className="btn-pill-cta mt-4"
              onClick={handleManualSave}
            >
              Save my appointment
            </button>
          </div>
        )}
      </section>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </StubShell>
  );
}
