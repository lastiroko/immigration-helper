import { useMemo, useState } from 'react';
import type { FlowApi } from '../types';
import { FlowShell } from '../components/FlowShell';
import { KUNDENZENTREN_DETAILS, getKundenzentrum } from '../kundenzentren';

const STEPS = [
  'Take a number from the machine ("Anmeldung" / "Wohnsitz anmelden").',
  'Wait for your number on the screen.',
  'Go to the assigned counter.',
  'Hand over your documents in the order you have them.',
  "They'll print your Meldebescheinigung on the spot — keep it safe, you'll need it many times.",
];

function todayDayOfWeek(): number {
  return new Date().getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function Screen6AWalkIn({ flow }: { flow: FlowApi }) {
  const [selectedName, setSelectedName] = useState<string>('Innenstadt');
  const [showAll, setShowAll] = useState(false);
  const selected = useMemo(
    () => getKundenzentrum(selectedName) ?? KUNDENZENTREN_DETAILS[2],
    [selectedName],
  );

  const dow = todayDayOfWeek();
  const isWalkInDay = dow === 1 || dow === 3; // Mon or Wed
  const isWednesday = dow === 3;

  const handleGoing = () => {
    flow.update({
      wentToAppointment: true,
      appointment: {
        date: todayISO(),
        time: 'walk-in',
        kundenzentrum: selected.name,
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
          Walk-in plan
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          Go to Kundenzentrum {selected.name} on{' '}
          <span className="headline-accent">
            {isWalkInDay ? 'today' : 'Monday or Wednesday'} morning.
          </span>
        </h1>
      </div>

      {/* Selected Kundenzentrum panel */}
      <article className="mt-8 surface-card overflow-hidden border-l-4 border-l-helfa-lime">
        <div className="px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-helfa-slate">
            {selected.district}
          </p>
          <h2 className="mt-1 font-semibold text-helfa-ink">
            Kundenzentrum {selected.name}
          </h2>
          <p className="mt-1 text-sm text-helfa-ink/80">
            {selected.address}, {selected.postalCode} Köln
          </p>
          <p className="mt-3 text-sm leading-relaxed text-helfa-ink/80">
            <strong>Open:</strong> Mon 7:30–15:00 (full day) · Wed 7:30–12:00
            (half day). Tue/Thu/Fri are appointment-only.
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

      {/* Switch Kundenzentrum */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="text-sm font-semibold text-helfa-slate hover:text-helfa-ink"
          aria-expanded={showAll}
        >
          {showAll
            ? '− Hide other Kundenzentren'
            : '+ Choose a different Kundenzentrum'}
        </button>
        {showAll && (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {KUNDENZENTREN_DETAILS.map((k) => {
              const isSelected = k.name === selected.name;
              return (
                <li key={k.name}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedName(k.name);
                      setShowAll(false);
                    }}
                    className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition ${
                      isSelected
                        ? 'border-helfa-ink bg-helfa-ink text-white'
                        : 'border-helfa-ink/15 bg-white text-helfa-ink hover:border-helfa-ink/50'
                    }`}
                  >
                    <span className="block font-semibold">{k.name}</span>
                    <span
                      className={`mt-0.5 block text-xs ${
                        isSelected ? 'text-white/80' : 'text-helfa-slate'
                      }`}
                    >
                      {k.address}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Day-specific tip */}
      <div className="mt-6 surface-card px-5 py-4">
        <p className="font-semibold text-sm">
          Arrive by 7:15 for a 7:30 opening.
        </p>
        <p className="mt-1 text-sm leading-relaxed text-helfa-ink/80">
          Bring a book or laptop — phone signal is patchy inside.
          {isWednesday && (
            <>
              {' '}
              <strong>Wednesday closes at 12:00</strong> — they stop pulling
              new numbers around 11:30. Be there at opening to be safe.
            </>
          )}
        </p>
      </div>

      {/* Innenstadt-specific note */}
      {selected.name === 'Innenstadt' && (
        <div className="mt-3 rounded-2xl border border-helfa-ink/10 bg-helfa-stone/40 px-5 py-3 text-sm leading-relaxed text-helfa-ink/85">
          <strong>Heads-up:</strong> Innenstadt I (ground floor) is the walk-in
          entrance. Innenstadt II (4th floor of the same building) is
          appointment-only — don't go up to 4 if you're walking in.
        </div>
      )}

      {/* What happens at the desk */}
      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-helfa-slate">
          What happens once you're inside
        </h3>
        <ol className="mt-3 space-y-2 text-sm text-helfa-ink/85">
          {STEPS.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-helfa-ink text-xs font-semibold text-white"
              >
                {i + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* From-abroad note */}
      {flow.state.originIsAbroad === true && (
        <div className="mt-6 rounded-2xl border border-helfa-ink/10 bg-helfa-stone/40 px-5 py-3 text-sm leading-relaxed text-helfa-ink/85">
          <strong>From abroad:</strong> you must appear in person. Köln does
          not accept a Vollmacht (proxy) for a first registration from abroad
          — don't waste a morning trying.
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 mb-4">
        <button type="button" className="btn-pill-cta w-full" onClick={handleGoing}>
          I'm going to {selected.name}
        </button>
      </div>
    </FlowShell>
  );
}
