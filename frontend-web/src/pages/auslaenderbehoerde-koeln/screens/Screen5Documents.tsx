import { useMemo, useState } from 'react';
import type { FlowApi, AuslaenderbehoerdeState } from '../types';
import { Toast } from '../../anmeldung-koeln/components/Toast';
import { CheckIcon } from '../../anmeldung-koeln/components/CheckIcon';
import { StubShell } from './_StubShell';
import { AntragsformularPanel } from '../components/AntragsformularPanel';

type DocKey = keyof AuslaenderbehoerdeState['documentsChecked'];

type Item = {
  key: DocKey;
  num: string;
  english: string;
  german: string;
  detail: string;
  /** Hide unless this returns true. */
  showWhen?: (s: AuslaenderbehoerdeState) => boolean;
  /** Whether ticking this is required to unlock the Continue button. */
  required: (s: AuslaenderbehoerdeState) => boolean;
  /** Expand into a rich panel. */
  expandable?: 'antragsformular';
};

const isStudent = (s: AuslaenderbehoerdeState) => s.purpose === 'student';
const isWorker = (s: AuslaenderbehoerdeState) => s.purpose === 'worker';
const studentOnly = (s: AuslaenderbehoerdeState) => isStudent(s);
const workerOnly = (s: AuslaenderbehoerdeState) => isWorker(s);

const ITEMS: Item[] = [
  {
    key: 'passport',
    num: '01',
    english: 'Valid passport with visa or entry stamp',
    german: 'Reisepass mit Visum / Einreisestempel',
    detail: 'Plus copies of all printed pages.',
    required: () => true,
  },
  {
    key: 'photo',
    num: '02',
    english: 'Biometric photo',
    german: 'Biometrisches Passfoto',
    detail: '35 × 45 mm, max 3 months old. Bring two — one for the form, one spare.',
    required: () => true,
  },
  {
    key: 'meldebescheinigung',
    num: '03',
    english: 'Meldebescheinigung from Anmeldung',
    german: 'Meldebescheinigung',
    detail: "The piece of paper you walked out of the Bürgeramt with. They require it; book Anmeldung first if you don't have it.",
    required: () => true,
  },
  {
    key: 'insurance',
    num: '04',
    english: 'Proof of health insurance',
    german: 'Krankenversicherungsnachweis',
    detail: 'Insurance card or confirmation letter from your Krankenkasse / private insurer.',
    required: () => true,
  },
  {
    key: 'mietvertrag',
    num: '05',
    english: 'Rental contract',
    german: 'Mietvertrag',
    detail: 'Copy is fine.',
    required: () => true,
  },
  {
    key: 'antragsformular',
    num: '06',
    english: 'Filled application form',
    german: 'Antragsformular',
    detail:
      "Köln's form 33-F07. We fill it for you below — fetched live from the city's form server. Print and sign.",
    expandable: 'antragsformular',
    required: () => true,
  },
  {
    key: 'immatrikulation',
    num: '07',
    english: 'Enrollment confirmation',
    german: 'Immatrikulationsbescheinigung',
    detail: 'From your university. Most can email this within a day.',
    showWhen: studentOnly,
    required: studentOnly,
  },
  {
    key: 'finanzierung',
    num: '08',
    english: 'Proof of financial means',
    german: 'Finanzierungsnachweis',
    detail:
      'Sperrkonto ≥ €11,904/year (€992/month) — OR scholarship letter — OR Verpflichtungserklärung from a German resident.',
    showWhen: studentOnly,
    required: studentOnly,
  },
  {
    key: 'arbeitsvertrag',
    num: '07',
    english: 'Signed employment contract',
    german: 'Arbeitsvertrag',
    detail: 'Or a binding job offer with position description.',
    showWhen: workerOnly,
    required: workerOnly,
  },
  {
    key: 'beschaeftigungserklaerung',
    num: '08',
    english: 'Erklärung zum Beschäftigungsverhältnis',
    german: 'Erklärung zum Beschäftigungsverhältnis',
    detail:
      'Your employer fills this. Required when the Bundesagentur für Arbeit needs to approve the role. Ask HR for it.',
    showWhen: workerOnly,
    required: () => false, // strongly recommended but BA may handle internally
  },
  {
    key: 'bildungsabschluss',
    num: '09',
    english: 'Highest education certificate',
    german: 'Bildungsabschluss',
    detail:
      'Bachelor / Master / equivalent. If foreign, ANABIN-recognized status (anabin.kmk.org) — the BA may require this for the work permit approval.',
    showWhen: workerOnly,
    required: () => false,
  },
  {
    key: 'gehaltsnachweis',
    num: '10',
    english: 'Salary proof (Blue Card)',
    german: 'Gehaltsnachweis',
    detail:
      'Only if applying for a Blue Card. 2026 thresholds: €50,700/year general, €45,934.20/year for shortage occupations / new graduates / IT.',
    showWhen: workerOnly,
    required: () => false,
  },
];

function firstMissing(s: AuslaenderbehoerdeState): Item | null {
  for (const item of ITEMS) {
    if (item.showWhen && !item.showWhen(s)) continue;
    if (!item.required(s)) continue;
    if (!s.documentsChecked[item.key]) return item;
  }
  return null;
}

export function Screen5Documents({ flow }: { flow: FlowApi }) {
  const { state, update, updateDocuments } = flow;
  const [toast, setToast] = useState<string | null>(null);

  const missing = useMemo(() => firstMissing(state), [state]);
  const allReady = missing === null;
  const visibleItems = useMemo(
    () => ITEMS.filter((it) => !it.showWhen || it.showWhen(state)),
    [state],
  );

  const handleContinue = () => {
    if (!allReady) {
      setToast(`You're missing: ${missing!.english} (${missing!.german})`);
      return;
    }
    update({ documentsConfirmed: true });
  };

  return (
    <StubShell
      onBack={() => update({ visaExpires: null })}
      onReset={flow.reset}
    >
      <div className="pt-6 sm:pt-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          Documents
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          Bring all of these.{' '}
          <span className="headline-accent">Wrong office = sent home.</span>
        </h1>
        <p className="mt-3 text-helfa-ink/75 leading-relaxed">
          The list adapts to your purpose ({state.purpose}). Required items
          unlock the Continue button.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        {visibleItems.map((item) => {
          const checked = state.documentsChecked[item.key];
          return (
            <DocCard
              key={item.key}
              item={item}
              checked={checked}
              onToggle={() => updateDocuments({ [item.key]: !checked })}
              required={item.required(state)}
              flow={flow}
            />
          );
        })}
      </div>

      <p className="mt-6 text-sm text-helfa-slate leading-relaxed">
        Going to the wrong Bezirksamt is the #1 reason people get sent away.
        On the next screen we route you to the right one by postal code.
      </p>

      <div className="mt-8 mb-4">
        <button
          type="button"
          className="btn-pill-cta w-full"
          aria-disabled={!allReady}
          onClick={handleContinue}
        >
          {allReady ? 'I have everything → Pick my Bezirksamt' : 'Continue → Pick my Bezirksamt'}
        </button>
        {!allReady && (
          <p className="mt-2 text-center text-xs text-helfa-slate">
            Tick all required items above to unlock.
          </p>
        )}
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </StubShell>
  );
}

function DocCard({
  item,
  checked,
  onToggle,
  required,
  flow,
}: {
  item: Item;
  checked: boolean;
  onToggle: () => void;
  required: boolean;
  flow: FlowApi;
}) {
  const [expanded, setExpanded] = useState(false);
  const isExpandable = !!item.expandable;
  return (
    <article
      className={`relative surface-card overflow-hidden ${
        checked ? 'border-l-4 border-l-helfa-lime' : ''
      }`}
    >
      {checked && (
        <span className="absolute top-3 right-3" aria-label="Checked">
          <CheckIcon size={20} />
        </span>
      )}

      <div className="px-5 py-4 pr-12">
        <p className="text-xs font-semibold tracking-[0.18em] text-helfa-slate">
          {item.num}
          {!required && (
            <span className="ml-2 rounded-full bg-helfa-stone/60 px-2 py-0.5 text-[10px] text-helfa-slate">
              optional
            </span>
          )}
        </p>
        <h3 className="mt-1 font-semibold text-helfa-ink">{item.english}</h3>
        <p className="mt-0.5 text-xs italic text-helfa-slate">{item.german}</p>
        <p className="mt-2 text-sm leading-relaxed text-helfa-ink/80">
          {item.detail}
        </p>

        {isExpandable && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-helfa-slate hover:text-helfa-ink"
            aria-expanded={expanded}
          >
            {expanded ? '− Hide form' : '+ Fill the form'}
          </button>
        )}

        {expanded && item.expandable === 'antragsformular' && (
          <AntragsformularPanel flow={flow} />
        )}
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center justify-between border-t px-5 py-3 text-sm font-semibold transition ${
          checked
            ? 'border-helfa-lime/40 bg-helfa-lime/10 text-helfa-ink'
            : 'border-helfa-ink/10 bg-helfa-stone/40 text-helfa-ink hover:bg-helfa-stone/70'
        }`}
        aria-pressed={checked}
      >
        <span>{checked ? "I've got it" : 'Mark as ready'}</span>
        {!checked && (
          <span
            aria-hidden
            className="inline-block h-5 w-5 rounded-full border-2 border-helfa-ink/30"
          />
        )}
      </button>
    </article>
  );
}
