import { useMemo, useState } from 'react';
import type { FlowApi } from '../types';
import { FlowShell } from '../components/FlowShell';

function todayISO(): string {
  const d = new Date();
  // Local YYYY-MM-DD (not UTC) so the date picker matches the user's calendar.
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function daysBetween(fromISO: string, toISO: string): number {
  const ms = new Date(toISO).getTime() - new Date(fromISO).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function Screen3MoveInDate({ flow }: { flow: FlowApi }) {
  const today = todayISO();
  const [picked, setPicked] = useState<string>(today);

  const status = useMemo(() => {
    const days = daysBetween(picked, today); // positive = past, negative = future
    if (days < 0) {
      const start = new Date(picked);
      const deadline = new Date(start);
      deadline.setDate(deadline.getDate() + 14);
      return {
        kind: 'future' as const,
        daysUntilMove: -days,
        deadlineISO: deadline.toISOString().slice(0, 10),
      };
    }
    if (days <= 14) {
      const moveDate = new Date(picked);
      const deadline = new Date(moveDate);
      deadline.setDate(deadline.getDate() + 14);
      return {
        kind: 'on-time' as const,
        daysSince: days,
        daysLeft: 14 - days,
        deadlineISO: deadline.toISOString().slice(0, 10),
      };
    }
    return { kind: 'overdue' as const, daysSince: days };
  }, [picked, today]);

  return (
    <FlowShell
      onBack={() => flow.update({ hasAddress: null })}
      onReset={flow.reset}
    >
      <div className="pt-6 sm:pt-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          Step 4 of 4
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          When did you{' '}
          <span className="headline-accent">move in?</span>
        </h1>
        <p className="mt-3 text-helfa-ink/75 leading-relaxed">
          The 14-day clock starts on the day your lease begins or you take
          possession — whichever is later.
        </p>
      </div>

      <div className="mt-8">
        <label
          htmlFor="moveInDate"
          className="block text-sm font-semibold text-helfa-ink"
        >
          Move-in date
        </label>
        <input
          id="moveInDate"
          type="date"
          value={picked}
          onChange={(e) => setPicked(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-helfa-ink/15 bg-white px-4 py-3 text-base font-medium shadow-sm focus:border-helfa-ink focus:outline-none focus:ring-2 focus:ring-helfa-lime"
        />

        {status.kind === 'on-time' && (
          <div className="mt-5 surface-card px-5 py-4">
            <p className="font-semibold">You're on time.</p>
            <p className="mt-1 text-sm text-helfa-ink/80 leading-relaxed">
              {status.daysSince === 0 ? (
                <>You moved in today — you have the full 14 days.</>
              ) : (
                <>
                  {status.daysSince} day{status.daysSince === 1 ? '' : 's'} since
                  you moved in. {status.daysLeft} day
                  {status.daysLeft === 1 ? '' : 's'} left — deadline{' '}
                  <strong>{formatDate(status.deadlineISO)}</strong>.
                </>
              )}
            </p>
          </div>
        )}

        {status.kind === 'future' && (
          <div className="mt-5 surface-card px-5 py-4">
            <p className="font-semibold">Planning ahead — that's fine.</p>
            <p className="mt-1 text-sm text-helfa-ink/80 leading-relaxed">
              Your 14-day clock will start on{' '}
              <strong>{formatDate(picked)}</strong>. Deadline:{' '}
              <strong>{formatDate(status.deadlineISO)}</strong>. You can still
              gather documents now.
            </p>
          </div>
        )}

        {status.kind === 'overdue' && (
          <div className="mt-5 surface-card px-5 py-4">
            <p className="font-semibold">You're past the 14-day deadline.</p>
            <p className="mt-1 text-sm text-helfa-ink/80 leading-relaxed">
              In practice, fines are rare unless months have passed, and most
              Kundenzentrum staff don't ask. The longer you wait, the more
              services (bank, insurance, residence permit) get blocked. Let's
              do it now.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <button
          type="button"
          className="btn-pill-cta"
          onClick={() => flow.update({ moveInDate: picked })}
        >
          {status.kind === 'overdue'
            ? "Let's get this sorted"
            : 'Continue → Documents'}
        </button>
      </div>
    </FlowShell>
  );
}
