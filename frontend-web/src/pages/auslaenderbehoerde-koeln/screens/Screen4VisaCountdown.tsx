import { useState } from 'react';
import type { FlowApi } from '../types';
import { StubShell } from './_StubShell';

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysUntil(iso: string): number {
  const target = new Date(`${iso}T00:00:00`).getTime();
  const today = new Date(`${todayISO()}T00:00:00`).getTime();
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

export function Screen4VisaCountdown({ flow }: { flow: FlowApi }) {
  const [picked, setPicked] = useState<string>(flow.state.visaExpires ?? '');
  const days = picked ? daysUntil(picked) : null;

  let banner: { tone: 'green' | 'yellow' | 'red'; text: string } | null = null;
  if (days !== null) {
    if (days < 0) banner = { tone: 'red', text: `Your visa expired ${-days} day${-days === 1 ? '' : 's'} ago. Book the appointment today and apply for a Fiktionsbescheinigung at the desk — it's the bridge that keeps you legal until the eAT card arrives.` };
    else if (days < 30) banner = { tone: 'red', text: `${days} day${days === 1 ? '' : 's'} until expiry. Tight — book the soonest available appointment.` };
    else if (days < 90) banner = { tone: 'yellow', text: `${days} days until expiry. You have runway, but Köln waitlists are long. Book now.` };
    else banner = { tone: 'green', text: `${days} days until expiry. Plenty of time, but slot scarcity means booking now is still the move.` };
  }

  return (
    <StubShell
      onBack={() => flow.update({ anmeldungDone: null })}
      onReset={flow.reset}
    >
      <div className="pt-6 sm:pt-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          Step 4 of 4
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          When does your{' '}
          <span className="headline-accent">visa expire?</span>
        </h1>
        <p className="mt-3 text-helfa-ink/75 leading-relaxed">
          The date on your entry visa, entry stamp, or current
          Fiktionsbescheinigung. Determines how urgent the booking is.
        </p>
      </div>

      <div className="mt-8">
        <label htmlFor="visaExpires" className="block text-sm font-semibold text-helfa-ink">
          Visa expiry date
        </label>
        <input
          id="visaExpires"
          type="date"
          value={picked}
          onChange={(e) => setPicked(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-helfa-ink/15 bg-white px-4 py-3 text-base font-medium shadow-sm focus:border-helfa-ink focus:outline-none focus:ring-2 focus:ring-helfa-lime"
        />

        {banner && (
          <div
            className={`mt-5 rounded-2xl px-5 py-4 text-sm leading-relaxed ${
              banner.tone === 'red'
                ? 'border border-red-300 bg-red-50 text-helfa-ink'
                : banner.tone === 'yellow'
                  ? 'border border-yellow-300 bg-yellow-50 text-helfa-ink'
                  : 'surface-card text-helfa-ink/80'
            }`}
          >
            {banner.text}
          </div>
        )}
      </div>

      <div className="mt-8">
        <button
          type="button"
          className="btn-pill-cta"
          disabled={!picked}
          aria-disabled={!picked}
          onClick={() => flow.update({ visaExpires: picked })}
        >
          Continue → Documents
        </button>
      </div>
    </StubShell>
  );
}
