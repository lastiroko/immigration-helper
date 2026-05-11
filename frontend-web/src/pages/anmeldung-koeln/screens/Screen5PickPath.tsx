import type { FlowApi } from '../types';
import { FlowShell } from '../components/FlowShell';

// Manual override per spec — flip to false (and update the date) if Köln
// suspends walk-in days. Verified active by calling 0221/221-0.
const WALK_IN_AVAILABLE = true;
const WALK_IN_LAST_VERIFIED = '2026-05-11';

export function Screen5PickPath({ flow }: { flow: FlowApi }) {
  return (
    <FlowShell
      onBack={() => flow.update({ documentsConfirmed: false })}
      onReset={flow.reset}
    >
      <div className="pt-6 sm:pt-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          Appointment
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          How fast do you want this{' '}
          <span className="headline-accent">done?</span>
        </h1>
        <p className="mt-3 text-helfa-ink/75 leading-relaxed">
          Köln gives you two ways. Walk-in is faster but you wait. Booked is
          predictable but slots are scarce.
        </p>
      </div>

      {!WALK_IN_AVAILABLE && (
        <div className="mt-6 rounded-2xl border border-yellow-300 bg-yellow-50 px-5 py-3 text-sm leading-relaxed text-helfa-ink">
          <strong>Heads-up:</strong> Walk-in days are temporarily suspended at
          Köln Kundenzentren. Use the booking calendar instead. (Last
          verified: {WALK_IN_LAST_VERIFIED} via 0221/221-0.)
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <PathCard
          eyebrow="Today or tomorrow morning"
          title="Walk-in"
          tagline={
            WALK_IN_AVAILABLE ? 'No appointment needed' : 'Currently suspended'
          }
          bullets={[
            <>
              <strong>Mon</strong> 7:30–15:00 (full day) ·{' '}
              <strong>Wed</strong> 7:30–12:00 (half day)
            </>,
            <>Arrive 15 min before opening; expect 1–3 hours waiting.</>,
            <>Best for anyone whose schedule allows a morning off.</>,
          ]}
          onClick={() => flow.update({ appointmentPath: 'walkin' })}
          disabled={!WALK_IN_AVAILABLE}
        />
        <PathCard
          eyebrow="Tue, Thu, or Fri"
          title="Booked appointment"
          tagline="Predictable but scarce"
          bullets={[
            <>Köln's online calendar is often empty for weeks.</>,
            <>
              We point you straight at the official link and a third-party
              watcher; you book it.
            </>,
            <>
              Best for anyone who can't take an unpredictable morning off.
            </>,
          ]}
          onClick={() => flow.update({ appointmentPath: 'booked' })}
        />
      </div>
    </FlowShell>
  );
}

function PathCard({
  eyebrow,
  title,
  tagline,
  bullets,
  onClick,
  disabled,
}: {
  eyebrow: string;
  title: string;
  tagline: string;
  bullets: React.ReactNode[];
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      className={`choice-card flex-col items-stretch text-left ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-helfa-slate">
        {eyebrow}
      </p>
      <h2 className="display-headline mt-2 text-2xl sm:text-3xl">{title}</h2>
      <p className="mt-1 text-sm font-normal text-helfa-slate">{tagline}</p>

      <ul className="mt-4 space-y-2 text-sm font-normal text-helfa-ink/80">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="mt-2 inline-block h-1 w-3 shrink-0 bg-helfa-ink" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-sm font-semibold text-helfa-ink">
        {disabled ? 'Not available' : 'Choose this path →'}
      </p>
    </button>
  );
}
