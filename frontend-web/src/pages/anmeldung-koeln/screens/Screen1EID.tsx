import type { FlowApi } from '../types';
import { FlowShell } from '../components/FlowShell';

export function Screen1EID({ flow }: { flow: FlowApi }) {
  const { hasEID } = flow.state;

  // Branch view: user said yes — show the gov.de exit content.
  if (hasEID === true) {
    return (
      <FlowShell
        onBack={() => flow.update({ hasEID: null })}
        onReset={flow.reset}
      >
        <div className="pt-6 sm:pt-10 space-y-6">
          <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
            Step 1 of 4 · eID detected
          </p>
          <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
            You can do this entirely online.{' '}
            <span className="headline-accent">No queue. No paperwork.</span>
          </h1>
          <p className="text-[1.0625rem] leading-relaxed text-helfa-ink/80">
            Germany's federal portal lets anyone with an active eID register
            their new address from a phone in about 10 minutes. You'll need:
          </p>
          <ul className="space-y-2 text-helfa-ink/85">
            <li className="flex gap-3">
              <span aria-hidden className="mt-2 inline-block h-1 w-3 shrink-0 bg-helfa-ink" />
              <span>Your German ID card or eAT card with the online function turned on</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="mt-2 inline-block h-1 w-3 shrink-0 bg-helfa-ink" />
              <span>Your six-digit eID PIN</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="mt-2 inline-block h-1 w-3 shrink-0 bg-helfa-ink" />
              <span>The official AusweisApp (free)</span>
            </li>
          </ul>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <a
              className="btn-pill-cta"
              href="https://wohnsitzanmeldung.gov.de"
              target="_blank"
              rel="noopener noreferrer"
            >
              Continue at wohnsitzanmeldung.gov.de
            </a>
            <button
              type="button"
              className="btn-pill-ghost"
              onClick={() => flow.update({ hasEID: false })}
            >
              I changed my mind, walk me through the in-person flow
            </button>
          </div>

          <p className="text-sm text-helfa-slate">
            Most newcomers don't have an active eID yet — if that's you, pick
            the second option.
          </p>
        </div>
      </FlowShell>
    );
  }

  // Question view (default): hasEID === null
  return (
    <FlowShell
      onBack={() => flow.update({ started: false })}
      onReset={flow.reset}
    >
      <div className="pt-6 sm:pt-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          Step 1 of 4
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          Do you have a{' '}
          <span className="headline-accent">German eID?</span>
        </h1>
        <p className="mt-3 text-helfa-ink/75 leading-relaxed">
          A German ID card (Personalausweis) or residence-permit card (eAT)
          with the online function turned on. If you've never used the eID
          PIN, pick "No."
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <button
          type="button"
          className="choice-card"
          onClick={() => flow.update({ hasEID: true })}
        >
          <span aria-hidden className="text-2xl">✅</span>
          <span className="flex-1">
            <span className="block">Yes — I have an active eID</span>
            <span className="mt-1 block text-sm font-normal text-helfa-slate">
              German ID or eAT with the online function activated
            </span>
          </span>
          <span aria-hidden className="text-helfa-slate">→</span>
        </button>

        <button
          type="button"
          className="choice-card"
          onClick={() => flow.update({ hasEID: false })}
        >
          <span aria-hidden className="text-2xl">❌</span>
          <span className="flex-1">
            <span className="block">No, or I'm not sure</span>
            <span className="mt-1 block text-sm font-normal text-helfa-slate">
              We'll walk you through the in-person flow at a Kundenzentrum
            </span>
          </span>
          <span aria-hidden className="text-helfa-slate">→</span>
        </button>
      </div>
    </FlowShell>
  );
}
