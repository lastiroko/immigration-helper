import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { FlowApi } from '../types';
import { isAnmeldungComplete } from '../state';
import { StubShell } from './_StubShell';

export function Screen3Anmeldung({ flow }: { flow: FlowApi }) {
  const { anmeldungDone } = flow.state;

  // Cross-flow read: if the Anmeldung sub-product recorded a
  // Meldebescheinigung, auto-skip this screen on first render.
  useEffect(() => {
    if (anmeldungDone === null && isAnmeldungComplete()) {
      flow.update({ anmeldungDone: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (anmeldungDone === false) {
    return (
      <StubShell
        onBack={() => flow.update({ anmeldungDone: null })}
        onReset={flow.reset}
      >
        <div className="pt-6 sm:pt-10 space-y-4">
          <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
            Step 3 of 4 · Off-ramp
          </p>
          <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
            Do Anmeldung first.{' '}
            <span className="headline-accent">It's the cornerstone.</span>
          </h1>
          <p className="text-helfa-ink/80 leading-relaxed">
            The Ausländerbehörde requires your Meldebescheinigung. Without
            it, your residence-permit appointment will be turned away.
          </p>
          <Link to="/anmeldung-koeln" className="btn-pill-cta inline-flex">
            Start Anmeldung →
          </Link>
          <p className="text-sm text-helfa-slate leading-relaxed">
            Come back here once your Meldebescheinigung is in your hand. If
            you do Anmeldung in this same browser, we'll skip this screen
            automatically next time.
          </p>
        </div>
      </StubShell>
    );
  }

  return (
    <StubShell
      onBack={() => flow.update({ purpose: '' })}
      onReset={flow.reset}
    >
      <div className="pt-6 sm:pt-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          Step 3 of 4
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          Have you done your{' '}
          <span className="headline-accent">Anmeldung yet?</span>
        </h1>
        <p className="mt-3 text-helfa-ink/75 leading-relaxed">
          You need a Meldebescheinigung from your local Bürgeramt before
          the Ausländerbehörde will see you.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <button
          type="button"
          className="choice-card"
          onClick={() => flow.update({ anmeldungDone: true })}
        >
          <span aria-hidden className="text-2xl">✅</span>
          <span className="flex-1">
            <span className="block">Yes — Meldebescheinigung in hand</span>
            <span className="mt-1 block text-sm font-normal text-helfa-slate">
              Continue to your visa countdown
            </span>
          </span>
          <span aria-hidden className="text-helfa-slate">→</span>
        </button>
        <button
          type="button"
          className="choice-card"
          onClick={() => flow.update({ anmeldungDone: false })}
        >
          <span aria-hidden className="text-2xl">❌</span>
          <span className="flex-1">
            <span className="block">Not yet</span>
            <span className="mt-1 block text-sm font-normal text-helfa-slate">
              We'll point you at /anmeldung-koeln to handle that first
            </span>
          </span>
          <span aria-hidden className="text-helfa-slate">→</span>
        </button>
      </div>
    </StubShell>
  );
}
