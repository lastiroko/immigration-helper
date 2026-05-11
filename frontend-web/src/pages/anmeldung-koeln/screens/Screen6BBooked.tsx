import { useState } from 'react';
import type { FlowApi } from '../types';
import { FlowShell } from '../components/FlowShell';
import { Toast } from '../components/Toast';
import { KUNDENZENTREN } from '../state';
import { parseConfirmation } from '../parseConfirmation';

const KOELN_BOOKING_URL =
  'https://termine.stadt-koeln.de/m/kundenzentren/extern/calendar/?uid=b5a5a394-ec33-4130-9af3-490f99517071';

export function Screen6BBooked({ flow }: { flow: FlowApi }) {
  const [pasted, setPasted] = useState('');
  const [manual, setManual] = useState<{
    date: string;
    time: string;
    kundenzentrum: string;
  }>({ date: '', time: '', kundenzentrum: 'Innenstadt' });
  const [showManual, setShowManual] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleParse = () => {
    if (!pasted.trim()) {
      setToast('Paste your confirmation email body first.');
      return;
    }
    const parsed = parseConfirmation(pasted);
    if (parsed.date && parsed.time && parsed.kundenzentrum) {
      // Full match — save directly; derivation routes to companion.
      flow.update({
        appointment: {
          date: parsed.date,
          time: parsed.time,
          kundenzentrum: parsed.kundenzentrum,
        },
      });
      return;
    }
    // Partial or no match — pre-fill the manual form with whatever was found.
    setManual({
      date: parsed.date ?? '',
      time: parsed.time ?? '',
      kundenzentrum: parsed.kundenzentrum ?? 'Innenstadt',
    });
    setShowManual(true);
    setToast(
      "We couldn't read all three fields — fill in what's missing below.",
    );
  };

  const handleManualSave = () => {
    if (!manual.date || !manual.time || !manual.kundenzentrum) {
      setToast('Please fill all three fields.');
      return;
    }
    flow.update({
      appointment: {
        date: manual.date,
        time: manual.time,
        kundenzentrum: manual.kundenzentrum,
      },
    });
  };

  return (
    <FlowShell
      onBack={() => flow.update({ appointmentPath: null })}
      onReset={flow.reset}
    >
      <div className="pt-6 sm:pt-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          Booked appointment
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          Köln runs the calendar.{' '}
          <span className="headline-accent">We point you at it.</span>
        </h1>
        <p className="mt-3 text-helfa-ink/75 leading-relaxed">
          Tue/Thu/Fri appointments are booked through Köln's official system.
          We don't sit in front of it for you — but here's the honest reality
          and the two links that matter.
        </p>
      </div>

      <ul className="mt-6 space-y-3">
        <li className="surface-card px-5 py-4">
          <p className="font-semibold text-sm">Slots are scarce.</p>
          <p className="mt-1 text-sm text-helfa-ink/80 leading-relaxed">
            It's normal to refresh the calendar every day for a week or two
            and see nothing. New slots tend to open in small batches (often
            early morning) and get claimed within minutes.
          </p>
        </li>
        <li className="surface-card px-5 py-4">
          <p className="font-semibold text-sm">
            From abroad? You must appear in person.
          </p>
          <p className="mt-1 text-sm text-helfa-ink/80 leading-relaxed">
            Köln does not accept a Vollmacht for a first registration from
            abroad — whoever you book for, that's who shows up.
          </p>
        </li>
        <li className="surface-card px-5 py-4">
          <p className="font-semibold text-sm">
            Someone built a slot watcher.
          </p>
          <p className="mt-1 text-sm text-helfa-ink/80 leading-relaxed">
            <a
              href="https://terminator.koeln"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline decoration-helfa-slate/40 underline-offset-2 hover:decoration-helfa-ink"
            >
              terminator.koeln
            </a>{' '}
            is third-party — not ours, not endorsed beyond "this exists and
            many people use it." Read its terms before signing up.
          </p>
        </li>
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          href={KOELN_BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pill-cta"
        >
          Open Köln's official booking page ↗
        </a>
        <a
          href="https://terminator.koeln"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pill-ghost"
        >
          Open Terminator (third-party) ↗
        </a>
        <button
          type="button"
          className="btn-pill-ghost"
          onClick={() => flow.update({ appointmentPath: 'walkin' })}
        >
          I prefer the walk-in route
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────────── */}
      {/* v1.2 — Closing the loop                                          */}
      {/* ──────────────────────────────────────────────────────────────── */}

      <section className="mt-12 border-t border-helfa-ink/10 pt-8">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          When you've booked
        </p>
        <h2 className="display-headline mt-2 text-2xl sm:text-3xl">
          Bring your appointment back here.
        </h2>

        {/* A. Recognition card */}
        <div className="mt-5 surface-card px-5 py-4">
          <p className="font-semibold text-sm">Look for this email:</p>
          <ul className="mt-2 space-y-1 text-sm text-helfa-ink/85">
            <li>
              <span className="text-helfa-slate">Subject:</span>{' '}
              <em>Terminbestätigung</em>
            </li>
            <li>
              <span className="text-helfa-slate">From:</span> an address
              ending in <code className="rounded bg-helfa-stone/60 px-1.5 py-0.5 text-xs">stadt-koeln.de</code>
            </li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-helfa-slate">
            That's your trigger to come back here. We'll help you prepare for
            the day.
          </p>
        </div>

        {/* B. Paste-to-parse */}
        <div className="mt-4">
          <label
            htmlFor="confirmationBody"
            className="block text-sm font-semibold text-helfa-ink"
          >
            Paste the email body
          </label>
          <p className="mt-1 text-xs text-helfa-slate leading-relaxed">
            We extract the date, time, and Kundenzentrum locally — nothing
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

        {/* Manual fallback */}
        {showManual && (
          <div className="mt-6 surface-card px-5 py-4">
            <p className="font-semibold text-sm">
              Fill in what we couldn't read.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
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
              <label className="block">
                <span className="block text-xs font-semibold text-helfa-slate">
                  Kundenzentrum
                </span>
                <select
                  value={manual.kundenzentrum}
                  onChange={(e) =>
                    setManual((m) => ({ ...m, kundenzentrum: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-helfa-ink/15 bg-white px-3 py-2 text-sm focus:border-helfa-ink focus:outline-none focus:ring-2 focus:ring-helfa-lime"
                >
                  {KUNDENZENTREN.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="button"
              className="btn-pill-cta mt-4"
              onClick={handleManualSave}
            >
              Save my appointment
            </button>
          </div>
        )}

        <p className="mt-5 text-xs text-helfa-slate leading-relaxed">
          <strong>Why we don't run our own slot watcher in v1:</strong> the
          city's booking host disallows automated polling in robots.txt.
          Building a polite watcher anyway is a v2 decision.
        </p>
      </section>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </FlowShell>
  );
}
