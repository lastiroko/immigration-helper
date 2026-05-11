import { useMemo, useState } from 'react';
import type { FlowApi, AnmeldungState } from '../types';
import { FlowShell } from '../components/FlowShell';
import { Toast } from '../components/Toast';
import { CheckIcon } from '../components/CheckIcon';
import { WOHNUNGSGEBER_TEMPLATE } from '../messages';
import { AnmeldeformularPanel } from '../components/AnmeldeformularPanel';

// Köln's form server uses a findform query, NOT direct PDF paths under /data/.
// Direct .pdf URLs return "Wrong or incomplete URL." Form ID comes from the
// spec's Verified facts section.
const WOHNUNGSGEBER_URL =
  'https://formular-server.de/Koeln_FS/findform?shortname=02-F17_WohnGeberBest&formtecid=3&areashortname=koeln_html';

type DocKey = keyof AnmeldungState['documentsChecked'];

type ChecklistItem = {
  key: DocKey;
  num: string;
  english: string;
  german: string;
  detail: string;
  expandable?: 'wohnungsgeber' | 'anmeldeformular';
  /** Hide the row entirely unless this predicate returns true. */
  showWhen?: (s: AnmeldungState) => boolean;
};

const ITEMS: ChecklistItem[] = [
  {
    key: 'passport',
    num: '01',
    english: 'Your passport or national ID',
    german: 'Reisepass / Personalausweis',
    detail: 'Original, not a photo. Non-EU: bring your visa pages too.',
  },
  {
    key: 'wohnungsgeber',
    num: '02',
    english: "Landlord's confirmation",
    german: 'Wohnungsgeberbescheinigung',
    detail:
      'Signed by your landlord within 14 days of move-in. The lease alone does NOT count.',
    expandable: 'wohnungsgeber',
  },
  {
    key: 'anmeldeformular',
    num: '03',
    english: 'Filled-in registration form',
    german: 'Anmeldeformular',
    detail:
      "Köln's official form. We give you a printable cheat-sheet so you copy each field correctly.",
    expandable: 'anmeldeformular',
  },
  {
    key: 'visa',
    num: '04',
    english: 'Visa sticker or eAT residence permit',
    german: 'Visum / Aufenthaltstitel (eAT)',
    detail:
      'Non-EU only. Bring your passport with all stamp pages and the physical eAT card.',
    showWhen: (s) => s.isNonEU === true,
  },
  {
    key: 'marriage',
    num: '05',
    english: 'Marriage / birth certificates',
    german: 'Heirats- / Geburtsurkunde',
    detail:
      'Originals plus certified German translation if not in German/English.',
    showWhen: (s) => s.isRegisteringFamily === true,
  },
];

// Items that block the Continue button.
function requiredKeys(s: AnmeldungState): DocKey[] {
  const req: DocKey[] = ['passport', 'wohnungsgeber', 'anmeldeformular'];
  if (s.isNonEU === true) req.push('visa');
  return req;
}

function firstMissing(s: AnmeldungState): ChecklistItem | null {
  const required = requiredKeys(s);
  for (const item of ITEMS) {
    if (!required.includes(item.key)) continue;
    if (!s.documentsChecked[item.key]) return item;
  }
  return null;
}

export function Screen4Documents({ flow }: { flow: FlowApi }) {
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
    <FlowShell
      onBack={() => update({ moveInDate: null })}
      onReset={flow.reset}
    >
      <div className="pt-6 sm:pt-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          Documents
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          Bring all of these.{' '}
          <span className="headline-accent">Miss one and they'll send you home.</span>
        </h1>
      </div>

      {/* Non-EU question */}
      <div className="mt-8 surface-card px-5 py-4">
        <p className="font-semibold text-sm">Are you a non-EU citizen?</p>
        <p className="mt-1 text-xs text-helfa-slate">
          Affects whether you need to bring your visa or eAT card.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              state.isNonEU === true
                ? 'border-helfa-ink bg-helfa-ink text-white'
                : 'border-helfa-ink/20 bg-white text-helfa-ink hover:border-helfa-ink/50'
            }`}
            onClick={() => update({ isNonEU: true })}
          >
            Yes
          </button>
          <button
            type="button"
            className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              state.isNonEU === false
                ? 'border-helfa-ink bg-helfa-ink text-white'
                : 'border-helfa-ink/20 bg-white text-helfa-ink hover:border-helfa-ink/50'
            }`}
            onClick={() => update({ isNonEU: false })}
          >
            No, I'm EU/EEA/Swiss
          </button>
        </div>
      </div>

      {/* Family-registration toggle */}
      <div className="mt-3 surface-card flex items-center justify-between px-5 py-4">
        <div className="pr-4">
          <p className="font-semibold text-sm">
            I'm registering family members
          </p>
          <p className="mt-1 text-xs text-helfa-slate leading-relaxed">
            Spouse and/or children moving in with you. Adds the
            marriage/birth-certificate row.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={state.isRegisteringFamily}
          onClick={() =>
            update({ isRegisteringFamily: !state.isRegisteringFamily })
          }
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
            state.isRegisteringFamily
              ? 'bg-helfa-ink'
              : 'bg-helfa-ink/15'
          }`}
        >
          <span
            aria-hidden
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
              state.isRegisteringFamily ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Checklist */}
      <div className="mt-6 space-y-3">
        {visibleItems.map((item) => {
          const checked = state.documentsChecked[item.key];
          return (
            <DocCard
              key={item.key}
              item={item}
              checked={checked}
              onToggle={() => updateDocuments({ [item.key]: !checked })}
              flow={flow}
            />
          );
        })}
      </div>

      {/* Helper line */}
      <p className="mt-6 text-sm text-helfa-slate leading-relaxed">
        Missing the Wohnungsgeberbescheinigung is the #1 reason people get sent
        home. Don't skip it.
      </p>

      {/* Gated CTA */}
      <div className="mt-8 mb-4">
        <button
          type="button"
          className="btn-pill-cta w-full"
          aria-disabled={!allReady}
          onClick={handleContinue}
        >
          {allReady
            ? 'I have everything → Pick my appointment'
            : 'Continue → Pick your appointment'}
        </button>
        {!allReady && (
          <p className="mt-2 text-center text-xs text-helfa-slate">
            Tick all required items above to unlock.
          </p>
        )}
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </FlowShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────

function DocCard({
  item,
  checked,
  onToggle,
  flow,
}: {
  item: ChecklistItem;
  checked: boolean;
  onToggle: () => void;
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
            {expanded ? '− Hide details' : '+ Show details'}
          </button>
        )}

        {expanded && item.expandable === 'wohnungsgeber' && (
          <WohnungsgeberPanel />
        )}
        {expanded && item.expandable === 'anmeldeformular' && (
          <AnmeldeformularPanel flow={flow} />
        )}
      </div>

      {/* Toggle row at the bottom — separate from the card body so tapping
          the body to read details doesn't accidentally toggle the check. */}
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

function WohnungsgeberPanel() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(WOHNUNGSGEBER_TEMPLATE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm font-semibold text-helfa-ink">
        The single document that turns most people away.
      </p>
      <p className="text-sm leading-relaxed text-helfa-ink/80">
        Your landlord (or main tenant, if subletting) must fill and sign this
        within 14 days of you moving in. By law they're required to provide it.
      </p>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-helfa-slate">
          Message to send your landlord
        </p>
        <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-helfa-stone/60 p-4 text-sm leading-relaxed text-helfa-ink">
          {WOHNUNGSGEBER_TEMPLATE}
        </pre>
        <button
          type="button"
          onClick={copy}
          className="btn-pill-ghost mt-3"
        >
          {copied ? 'Copied ✓' : 'Copy German message'}
        </button>
      </div>

      <a
        href={WOHNUNGSGEBER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-sm font-semibold text-helfa-ink underline decoration-helfa-slate/40 underline-offset-2 hover:decoration-helfa-ink"
      >
        Open the official Köln form (formular-server.de) ↗
      </a>

      <p className="text-xs text-helfa-slate">
        If your landlord refuses or stalls, this is illegal — they face a fine
        up to €1,000. Mention it politely.
      </p>
    </div>
  );
}

