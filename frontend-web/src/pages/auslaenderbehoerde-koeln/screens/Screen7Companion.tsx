import { useState } from 'react';
import type { FlowApi, AuslaenderbehoerdeState } from '../types';
import { PhraseOverlay } from '../../anmeldung-koeln/components/PhraseOverlay';
import { CheckIcon } from '../../anmeldung-koeln/components/CheckIcon';
import { StubShell } from './_StubShell';
import { getBezirksamt } from '../bezirksaemter';

type DocKey = keyof AuslaenderbehoerdeState['documentsChecked'];

type BagItem = {
  key: DocKey;
  label: string;
  german: string;
  showWhen?: (s: AuslaenderbehoerdeState) => boolean;
};

const BAG: BagItem[] = [
  { key: 'passport', label: 'Passport with visa/entry stamp', german: 'Reisepass' },
  { key: 'photo', label: 'Biometric photo (×2)', german: 'Biometrisches Passfoto' },
  { key: 'meldebescheinigung', label: 'Meldebescheinigung', german: 'Meldebescheinigung' },
  { key: 'insurance', label: 'Health insurance proof', german: 'Krankenversicherungsnachweis' },
  { key: 'mietvertrag', label: 'Rental contract (copy)', german: 'Mietvertrag' },
  { key: 'antragsformular', label: 'Filled & signed application form', german: 'Antragsformular' },
  { key: 'immatrikulation', label: 'Enrollment confirmation', german: 'Immatrikulationsbescheinigung', showWhen: (s) => s.purpose === 'student' },
  { key: 'finanzierung', label: 'Financial proof (Sperrkonto etc.)', german: 'Finanzierungsnachweis', showWhen: (s) => s.purpose === 'student' },
  { key: 'arbeitsvertrag', label: 'Employment contract', german: 'Arbeitsvertrag', showWhen: (s) => s.purpose === 'worker' },
];

const PHRASES = [
  {
    english: "I'm applying for a residence permit.",
    german: 'Ich beantrage einen Aufenthaltstitel.',
    pronunciation: 'ish beh-AHN-trah-guh ein-en OWF-ent-halts-tee-tel',
  },
  {
    english: "I don't speak German, do you speak English?",
    german: 'Ich spreche kein Deutsch. Sprechen Sie Englisch?',
    pronunciation: 'ish SHPREH-khuh kine doytch · SHPREH-khen zee ENG-lish',
  },
  {
    english: 'When will I get my permit?',
    german: 'Wann bekomme ich meinen Titel?',
    pronunciation: 'vahn beh-KOM-uh ish MINE-en TEE-tel',
  },
  {
    english: 'Can I work while my application is pending?',
    german: 'Kann ich mit dem Antrag schon arbeiten?',
    pronunciation: 'kahn ish mit dem AHN-trahg shone AR-by-ten',
  },
  {
    english: 'Could you write that down for me?',
    german: 'Könnten Sie das bitte aufschreiben?',
    pronunciation: 'KURN-ten zee dass BIT-uh OWF-shry-ben',
  },
  {
    english: 'Thank you, goodbye.',
    german: 'Vielen Dank, auf Wiedersehen.',
    pronunciation: 'FEE-len dahnk · owf VEE-der-zay-en',
  },
];

const WHAT_HAPPENS = [
  'They check your documents in roughly the order above.',
  'They ask about employment, income, and German language proficiency.',
  'They take your biometric data (fingerprints) for the eAT card.',
  'You pay the fee — €100 for students, €0 for the non-self-employed work permit. Card or cash.',
  'They give you a Fiktionsbescheinigung today and order your eAT card.',
  'The eAT card and the PIN letter arrive separately by post in 4–8 weeks.',
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
  const bezirksamt = appt ? getBezirksamt(appt.bezirksamt) : undefined;

  const [inBag, setInBag] = useState<Partial<Record<DocKey, boolean>>>({});
  const [openPhrase, setOpenPhrase] = useState<number | null>(null);

  const visibleBag = BAG.filter((b) => !b.showWhen || b.showWhen(state));

  return (
    <StubShell
      onBack={() => flow.update({ appointment: null })}
      onReset={flow.reset}
    >
      <div className="pt-6 sm:pt-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          Appointment companion
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          You're at{' '}
          <span className="headline-accent">
            Bezirksausländeramt {appt?.bezirksamt ?? 'Köln'}.
          </span>
        </h1>
        {appt && (
          <p className="mt-3 text-helfa-ink/80 leading-relaxed">
            {formatAppointment(appt.date)} at <strong>{appt.time}</strong>
            {bezirksamt && (
              <>
                {' '}· {bezirksamt.street}, {bezirksamt.postalCode} Köln
              </>
            )}
            .
          </p>
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-helfa-slate">
          In your bag right now
        </h2>
        <p className="mt-1 text-sm text-helfa-slate">
          Tap each one to confirm. Final check.
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

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-helfa-slate">
          German phrases
        </h2>
        <p className="mt-1 text-sm text-helfa-slate">
          Tap a phrase to enlarge — hold the phone up to the clerk.
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

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-helfa-slate">
          What's about to happen
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-helfa-ink/85">
          {WHAT_HAPPENS.map((w, i) => (
            <li key={i} className="flex gap-3">
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-helfa-ink text-xs font-semibold text-white"
              >
                {i + 1}
              </span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 mb-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="btn-pill-cta flex-1"
          onClick={() =>
            flow.update({ fiktionsbescheinigungObtainedAt: todayISO() })
          }
        >
          I got my Fiktionsbescheinigung
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
    </StubShell>
  );
}
