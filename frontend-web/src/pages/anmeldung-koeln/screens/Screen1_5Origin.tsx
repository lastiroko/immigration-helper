import { useState } from 'react';
import type { FlowApi } from '../types';
import { FlowShell } from '../components/FlowShell';

export function Screen1_5Origin({ flow }: { flow: FlowApi }) {
  // The "moving within DE" button shows an explainer before advancing.
  // We hold that intermediate state locally — it's not flow state.
  const [showWithinDE, setShowWithinDE] = useState(false);

  if (showWithinDE) {
    return (
      <FlowShell
        onBack={() => setShowWithinDE(false)}
        onReset={flow.reset}
      >
        <div className="pt-6 sm:pt-10 space-y-6">
          <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
            Step 2 of 4 · Vocabulary note
          </p>
          <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
            What you're doing is technically called{' '}
            <span className="headline-accent italic">Ummeldung,</span> not
            Anmeldung.
          </h1>
          <div className="surface-card px-5 py-4 text-helfa-ink/85 leading-relaxed">
            <p>
              Good news: the documents, the Kundenzentrum, the form, and the
              14-day deadline are all the same. We'll keep calling it
              Anmeldung for short — the staff will know what you mean, and so
              will every guide you read.
            </p>
          </div>

          <button
            type="button"
            className="btn-pill-cta"
            onClick={() => flow.update({ originIsAbroad: false })}
          >
            Got it — continue
          </button>
        </div>
      </FlowShell>
    );
  }

  return (
    <FlowShell
      onBack={() => flow.update({ hasEID: null })}
      onReset={flow.reset}
    >
      <div className="pt-6 sm:pt-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          Step 2 of 4
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          Are you new to{' '}
          <span className="headline-accent">Germany?</span>
        </h1>
        <p className="mt-3 text-helfa-ink/75 leading-relaxed">
          Same documents, same Kundenzentrum, same form either way — but the
          paperwork has a different official name depending on your answer.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <button
          type="button"
          className="choice-card"
          onClick={() => flow.update({ originIsAbroad: true })}
        >
          <span aria-hidden className="text-2xl">🌍</span>
          <span className="flex-1">
            <span className="block">Arriving in Germany for the first time</span>
            <span className="mt-1 block text-sm font-normal text-helfa-slate">
              From abroad — first German address
            </span>
          </span>
          <span aria-hidden className="text-helfa-slate">→</span>
        </button>

        <button
          type="button"
          className="choice-card"
          onClick={() => setShowWithinDE(true)}
        >
          <span aria-hidden className="text-2xl">🏙️</span>
          <span className="flex-1">
            <span className="block">Moving within Germany</span>
            <span className="mt-1 block text-sm font-normal text-helfa-slate">
              From another German city — technically an Ummeldung
            </span>
          </span>
          <span aria-hidden className="text-helfa-slate">→</span>
        </button>
      </div>
    </FlowShell>
  );
}
