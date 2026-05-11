import { useMemo, useState } from 'react';
import type { FlowApi, AnmeldungState } from '../types';
import { FlowShell } from '../components/FlowShell';
import { CheckIcon } from '../components/CheckIcon';
import { PhraseOverlay } from '../components/PhraseOverlay';
import { getKundenzentrum } from '../kundenzentren';

type DocKey = keyof AnmeldungState['documentsChecked'];

type BagItem = {
  key: DocKey;
  label: string;
  german: string;
  showWhen?: (s: AnmeldungState) => boolean;
};

const BAG_ITEMS: BagItem[] = [
  { key: 'passport', label: 'Passport / national ID', german: 'Reisepass' },
  { key: 'wohnungsgeber', label: "Landlord's confirmation", german: 'Wohnungsgeberbescheinigung' },
  { key: 'anmeldeformular', label: 'Filled-in registration form', german: 'Anmeldeformular' },
  { key: 'visa', label: 'Visa / eAT card', german: 'Visum / Aufenthaltstitel', showWhen: (s) => s.isNonEU === true },
  { key: 'marriage', label: 'Marriage / birth certificates', german: 'Heirats- / Geburtsurkunde', showWhen: (s) => s.isRegisteringFamily === true },
];

const PHRASES = [
  {
    english: "I'm here for Anmeldung.",
    german: 'Ich möchte mich anmelden.',
    pronunciation: 'ish MURK-tuh mish AN-mel-den',
  },
  {
    english: "I don't speak German, do you speak English?",
    german: 'Ich spreche kein Deutsch. Sprechen Sie Englisch?',
    pronunciation: 'ish SHPREH-khuh kine doytch · SHPREH-khen zee ENG-lish',
  },
  {
    english: 'Could you write that down for me?',
    german: 'Könnten Sie das bitte aufschreiben?',
    pronunciation: 'KURN-ten zee dass BIT-uh OWF-shry-ben',
  },
  {
    english: 'When will I get my Meldebescheinigung?',
    german: 'Wann bekomme ich die Meldebescheinigung?',
    pronunciation: 'vahn beh-KOM-uh ish dee MEL-duh-buh-shy-nih-goong',
  },
  {
    english: 'Thank you, goodbye.',
    german: 'Vielen Dank, auf Wiedersehen.',
    pronunciation: 'FEE-len dahnk · owf VEE-der-zay-en',
  },
];

const WHAT_HAPPENS = [
  "They'll ask for your documents in roughly the order they appear above.",
  'They might ask about religion (church tax) — you can decline by saying konfessionslos (kon-feh-see-OWN-sloss).',
  "They'll print your Meldebescheinigung and you'll walk out with it.",
  'You\'ll receive your Steuer-ID by post in 2–3 weeks.',
];

function formatAppointment(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function Screen7Companion({ flow }: { flow: FlowApi }) {
  const { state } = flow;
  const appt = state.appointment;
  const isWalkIn = appt?.time === 'walk-in';
  const kz = appt ? getKundenzentrum(appt.kundenzentrum) : undefined;

  // Local in-bag confirmations — separate from Screen 4's prep checklist.
  const [inBag, setInBag] = useState<Partial<Record<DocKey, boolean>>>({});
  const [openPhrase, setOpenPhrase] = useState<number | null>(null);

  const visibleBag = useMemo(
    () => BAG_ITEMS.filter((it) => !it.showWhen || it.showWhen(state)),
    [state],
  );

  return (
    <FlowShell
      onBack={() =>
        // Clear both fields so derivation routes back to 6A or 6B
        // (per appointmentPath). User re-confirms walk-in or re-enters
        // booked details — we don't try to preserve the partial choice.
        flow.update({
          wentToAppointment: false,
          appointment: null,
        })
      }
      onReset={flow.reset}
    >
      <div className="pt-6 sm:pt-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          {isWalkIn ? 'Walk-in companion' : 'Appointment companion'}
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          You're at{' '}
          <span className="headline-accent">
            Kundenzentrum {appt?.kundenzentrum ?? 'Köln'}.
          </span>
        </h1>
        {appt && !isWalkIn && (
          <p className="mt-3 text-helfa-ink/80 leading-relaxed">
            {formatAppointment(appt.date)} at <strong>{appt.time}</strong>
            {kz && (
              <>
                {' '}· {kz.address}, {kz.postalCode} Köln
              </>
            )}
            .
          </p>
        )}
        {appt && isWalkIn && kz && (
          <p className="mt-3 text-helfa-ink/80 leading-relaxed">
            {kz.address}, {kz.postalCode} Köln. Walk-in queue.
          </p>
        )}
      </div>

      {/* Bag checklist */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-helfa-slate">
          In your bag right now
        </h2>
        <p className="mt-1 text-sm text-helfa-slate">
          Tap each one to confirm. This is your final check.
        </p>
        <ul className="mt-4 space-y-2">
          {visibleBag.map((it) => {
            const ticked = !!inBag[it.key];
            return (
              <li key={it.key}>
                <button
                  type="button"
                  onClick={() =>
                    setInBag((prev) => ({ ...prev, [it.key]: !ticked }))
                  }
                  aria-pressed={ticked}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    ticked
                      ? 'border-helfa-lime bg-helfa-lime/10'
                      : 'border-helfa-ink/15 bg-white hover:border-helfa-ink/40'
                  }`}
                >
                  {ticked ? (
                    <CheckIcon size={20} />
                  ) : (
                    <span
                      aria-hidden
                      className="inline-block h-5 w-5 rounded-full border-2 border-helfa-ink/30"
                    />
                  )}
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-helfa-ink">
                      {it.label}
                    </span>
                    <span className="block text-xs italic text-helfa-slate">
                      {it.german}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Phrases */}
      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-helfa-slate">
          German phrases
        </h2>
        <p className="mt-1 text-sm text-helfa-slate">
          Tap a phrase to enlarge it full-screen — hold your phone up to the
          clerk.
        </p>
        <ul className="mt-4 space-y-2">
          {PHRASES.map((p, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setOpenPhrase(i)}
                className="surface-card flex w-full items-start gap-3 px-5 py-4 text-left hover:border-helfa-ink/30"
              >
                <span className="flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-helfa-slate">
                    {p.english}
                  </span>
                  <span className="mt-1 block text-base font-semibold text-helfa-ink">
                    {p.german}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-helfa-lime text-xs font-bold text-helfa-ink"
                  title="Tap to enlarge"
                >
                  ⤢
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* What happens */}
      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-helfa-slate">
          What's about to happen
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-helfa-ink/85">
          {WHAT_HAPPENS.map((w, i) => (
            <li key={i} className="flex gap-3">
              <span aria-hidden className="mt-2 inline-block h-1 w-3 shrink-0 bg-helfa-ink" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Outcome CTAs */}
      <div className="mt-10 mb-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="btn-pill-cta flex-1"
          onClick={() =>
            flow.update({ meldebescheinigungObtainedAt: todayISO() })
          }
        >
          I got my Meldebescheinigung
        </button>
        <button
          type="button"
          className="btn-pill-ghost"
          onClick={() => flow.update({ wasSentHome: true })}
        >
          They sent me home
        </button>
      </div>

      {openPhrase !== null && (
        <PhraseOverlay
          english={PHRASES[openPhrase].english}
          german={PHRASES[openPhrase].german}
          pronunciation={PHRASES[openPhrase].pronunciation}
          onClose={() => setOpenPhrase(null)}
        />
      )}
    </FlowShell>
  );
}
