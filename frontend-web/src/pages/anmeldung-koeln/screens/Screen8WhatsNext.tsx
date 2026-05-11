import { useMemo } from 'react';
import type { FlowApi, AnmeldungState } from '../types';
import { FlowShell } from '../components/FlowShell';
import {
  buildIcs,
  downloadIcs,
  googleCalendarUrl,
  type CalendarEvent,
} from '../calendar';

type TimelineItem = {
  key: string;
  band: string;
  title: string;
  body: string;
  /** ISO date if a calendar reminder makes sense; null otherwise. */
  reminderDate: string | null;
};

function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function buildTimeline(s: AnmeldungState): TimelineItem[] {
  const day0 = s.meldebescheinigungObtainedAt!;
  const items: (TimelineItem | null)[] = [
    {
      key: 'day0',
      band: 'Day 0 (today)',
      title: 'Save your Meldebescheinigung',
      body: 'Photograph it. Keep the original somewhere safe. You will need this document many times in your first year — bank, insurance, residence permit, contracts.',
      reminderDate: null,
    },
    {
      key: 'steuerid',
      band: 'Day 14–21',
      title: 'Steuer-ID arrives by post',
      body: 'Brown envelope, looks official. Do not throw it away. You need it for work, banking, and tax — forever.',
      reminderDate: addDays(day0, 14),
    },
    {
      key: 'gez',
      band: 'Day 14–30',
      title: 'GEZ letter (€18.36/month broadcasting fee)',
      body: 'A letter from "Beitragsservice" demands €18.36/month. PAY IT — ignoring it tanks your credit score (SCHUFA). You can apply for exemption only if you are on benefits.',
      reminderDate: addDays(day0, 14),
    },
    s.isNonEU === true
      ? {
          key: 'residence',
          band: 'Within 90 days',
          title: 'Apply for your residence permit',
          body: 'Apply at the Ausländerbehörde. The wait list in Köln is long — start now, not in month 2.',
          reminderDate: addDays(day0, 30),
        }
      : null,
    {
      key: 'krankenkasse',
      band: 'Within 30 days',
      title: 'Pick a Krankenkasse (health insurance)',
      body: "If you're employed, tell HR your choice. TK is the easiest for English speakers. Mandatory in Germany.",
      reminderDate: addDays(day0, 7),
    },
    {
      key: 'bank',
      band: 'Whenever',
      title: 'Open a German bank account',
      body: 'You needed Anmeldung for this. N26 or bunq if you want it in English in 10 minutes. Most employers and landlords expect a SEPA-capable IBAN.',
      reminderDate: null,
    },
  ];
  return items.filter((i): i is TimelineItem => i !== null);
}

function toCalendarEvent(item: TimelineItem): CalendarEvent | null {
  if (!item.reminderDate) return null;
  return {
    uid: `helfa-${item.key}-${item.reminderDate}@anmeldung.helfa.app`,
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
    const ics = buildIcs(events, 'Anmeldung Köln — first 90 days');
    downloadIcs(ics, 'helfa-anmeldung-koeln.ics');
  };

  return (
    <FlowShell onReset={flow.reset}>
      <div className="pt-6 sm:pt-10 space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-lime">
          Done
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          You're registered.{' '}
          <span className="headline-accent">
            Here's what happens in the next 90 days.
          </span>
        </h1>
        <p className="text-helfa-ink/80 leading-relaxed">
          Six things land in your mailbox or inbox in the coming weeks. Most
          surprise newcomers. None of them should.
        </p>
      </div>

      <ol className="mt-8 space-y-3">
        {timeline.map((item) => {
          const event = toCalendarEvent(item);
          return (
            <li key={item.key}>
              <article className="surface-card overflow-hidden">
                <div className="px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-helfa-slate">
                    {item.band}
                  </p>
                  <h3 className="mt-1 font-semibold text-helfa-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-helfa-ink/80">
                    {item.body}
                  </p>
                  {event && (
                    <a
                      href={googleCalendarUrl(event)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-pill-ghost mt-4 inline-flex"
                    >
                      Add to Google Calendar ↗
                    </a>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ol>

      <div className="mt-10 mb-4">
        <button type="button" className="btn-pill-cta w-full" onClick={downloadAll}>
          Download all reminders (.ics)
        </button>
        <p className="mt-2 text-center text-xs text-helfa-slate">
          Works with Apple Calendar, Outlook, Fastmail, Proton, anything that
          opens .ics. No account, no email.
        </p>
      </div>

      <p className="mt-10 text-sm text-helfa-slate leading-relaxed">
        That's it from us for Köln Anmeldung. If this app helped, tell a
        friend who's about to move — that's how we grow.
      </p>
    </FlowShell>
  );
}
