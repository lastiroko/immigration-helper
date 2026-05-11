import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { FlowApi, AuslaenderbehoerdeState } from '../types';
import {
  buildIcs,
  downloadIcs,
  googleCalendarUrl,
  type CalendarEvent,
} from '../../anmeldung-koeln/calendar';
import { StubShell } from './_StubShell';

type TimelineItem = {
  key: string;
  band: string;
  title: string;
  body: string;
  reminderDate: string | null;
  helpText: string;
};

function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function buildTimeline(s: AuslaenderbehoerdeState): TimelineItem[] {
  const day0 = s.fiktionsbescheinigungObtainedAt!;
  // Most permits issue for 2 years initially for non-EU first-issue.
  // We use a placeholder 2-year horizon for the renewal reminder; the
  // user can re-enter their actual permit expiry on Screen 4 to refine
  // (or wait until the eAT card arrives with the real date).
  const renewalRemind = s.permitExpires
    ? addDays(s.permitExpires, -90) // 3 months before expiry per th-koeln.de
    : addDays(day0, 365 * 2 - 90); // best-effort placeholder
  return [
    {
      key: 'day0',
      band: 'Day 0 (today)',
      title: 'Keep your Fiktionsbescheinigung safe',
      body:
        'Photo + cloud backup. It is your legal proof of residence until the eAT card arrives.',
      reminderDate: null,
      helpText:
        'Fiktionsbescheinigung §81(3) means no work + no travel; §81(4) means continuing work rights from your previous permit + travel allowed within validity. Check which one yours is.',
    },
    {
      key: 'pin',
      band: 'Day 14–28',
      title: 'PIN letter from Bundesdruckerei arrives',
      body:
        'Separate envelope from the card. Contains the PIN you need to activate the eID function on your eAT card. KEEP THIS — they only print it once.',
      reminderDate: addDays(day0, 14),
      helpText:
        'If lost, you can request a new PIN at the Ausländerbehörde for a fee. Cheaper to keep the letter.',
    },
    {
      key: 'card',
      band: 'Day 28–56',
      title: 'eAT card arrives or is ready for pickup',
      body:
        'Köln typically sends it by post. If it ships to the wrong address, the Ausländerbehörde holds it for pickup. Bring your Fiktionsbescheinigung + passport.',
      reminderDate: addDays(day0, 28),
      helpText:
        "When the card arrives, hand back the Fiktionsbescheinigung (or it's voided automatically once the new permit starts).",
    },
    {
      key: 'renewal',
      band: '3 months before your permit expires',
      title: 'Book the renewal (Verlängerung) appointment',
      body:
        'Same Bezirksamt, different appointment type. Apply early — late renewals risk a gap and another Fiktionsbescheinigung.',
      reminderDate: renewalRemind,
      helpText:
        "For students from the 4th semester onward: bring a Studienverlaufsbescheinigung (progress certificate) showing your academic standing.",
    },
    {
      key: 'permanent',
      band: 'After 5 years (typically)',
      title: 'Niederlassungserlaubnis (permanent settlement)',
      body:
        'Different process, different documents — usually requires B1 German, social insurance contributions for 5 years, and integration course completion. Not part of v1.',
      reminderDate: null,
      helpText:
        'EU Blue Card holders can apply after 33 months (or 21 months with B1 German). Standard work-permit holders after 5 years.',
    },
  ];
}

function toCalendarEvent(item: TimelineItem): CalendarEvent | null {
  if (!item.reminderDate) return null;
  return {
    uid: `helfa-aat-${item.key}-${item.reminderDate}@auslaenderbehoerde.helfa.app`,
    date: item.reminderDate,
    title: item.title,
    description: item.body,
  };
}

export function Screen8WhatsNext({ flow }: { flow: FlowApi }) {
  const { state } = flow;
  const timeline = useMemo(() => buildTimeline(state), [state]);

  const downloadAll = () => {
    const events = timeline
      .map(toCalendarEvent)
      .filter((e): e is CalendarEvent => e !== null);
    if (events.length === 0) return;
    const ics = buildIcs(events, 'Ausländerbehörde Köln — first months');
    downloadIcs(ics, 'helfa-auslaenderbehoerde-koeln.ics');
  };

  return (
    <StubShell onReset={flow.reset}>
      <div className="pt-6 sm:pt-10 space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-lime">
          Done
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          Fiktionsbescheinigung in hand.{' '}
          <span className="headline-accent">Here's what happens next.</span>
        </h1>
        <p className="text-helfa-ink/80 leading-relaxed">
          Your eAT card is being printed. A few things arrive by post in
          the coming weeks. None should surprise you.
        </p>
      </div>

      <ol className="mt-8 space-y-3">
        {timeline.map((item) => (
          <li key={item.key}>
            <TimelineCard item={item} />
          </li>
        ))}
      </ol>

      <div className="mt-10 mb-4">
        <button type="button" className="btn-pill-cta w-full" onClick={downloadAll}>
          Download all reminders (.ics)
        </button>
        <p className="mt-2 text-center text-xs text-helfa-slate">
          Same .ics format as the Anmeldung timeline. Imports into Apple
          Calendar, Outlook, Google Calendar.
        </p>
      </div>

      <p className="mt-10 text-sm text-helfa-slate leading-relaxed">
        Tell a friend if this helped — that's how the page gets to the next
        non-EU newcomer in Köln. The shipped flow next door for the address
        registration is at{' '}
        <Link
          to="/anmeldung-koeln"
          className="font-semibold text-helfa-ink underline decoration-helfa-slate/40 underline-offset-2 hover:decoration-helfa-ink"
        >
          /anmeldung-koeln
        </Link>
        .
      </p>
    </StubShell>
  );
}

function TimelineCard({ item }: { item: TimelineItem }) {
  const [helpOpen, setHelpOpen] = useState(false);
  const event = toCalendarEvent(item);
  return (
    <article className="surface-card overflow-hidden">
      <div className="px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-helfa-slate">
          {item.band}
        </p>
        <h3 className="mt-1 font-semibold text-helfa-ink">{item.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-helfa-ink/80">
          {item.body}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {event && (
            <a
              href={googleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pill-ghost"
            >
              Add to Google Calendar ↗
            </a>
          )}
          <button
            type="button"
            onClick={() => setHelpOpen((o) => !o)}
            aria-expanded={helpOpen}
            className="btn-pill-ghost"
          >
            {helpOpen ? '− Hide help' : 'Help me with this'}
          </button>
        </div>
        {helpOpen && (
          <div className="mt-3 rounded-xl bg-helfa-stone/40 px-4 py-3 text-sm leading-relaxed text-helfa-ink/85">
            {item.helpText}
          </div>
        )}
      </div>
    </article>
  );
}
