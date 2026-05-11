import type { FlowApi, Purpose } from '../types';
import { StubShell } from './_StubShell';

export function Screen2Purpose({ flow }: { flow: FlowApi }) {
  if (flow.state.purpose === 'other') {
    return (
      <StubShell
        onBack={() => flow.update({ purpose: '' })}
        onReset={flow.reset}
      >
        <div className="pt-6 sm:pt-10 space-y-4">
          <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
            Step 2 of 4 · Soft exit
          </p>
          <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
            v1 doesn't cover your case yet.{' '}
            <span className="headline-accent">Here's the official link.</span>
          </h1>
          <p className="text-helfa-ink/80 leading-relaxed">
            Family reunification, self-employment, asylum, and other purposes
            have meaningfully different documents and processes. Building
            shallow guidance for them would mislead you. v1 covers only
            student and skilled-worker first-issue permits properly.
          </p>
          <a
            href="https://www.stadt-koeln.de/leben-in-koeln/soziales/auslaenderamt/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pill-cta inline-flex"
          >
            Open Köln's Ausländeramt page ↗
          </a>
        </div>
      </StubShell>
    );
  }

  const pick = (p: Purpose) => flow.update({ purpose: p });

  return (
    <StubShell
      onBack={() => flow.update({ isNonEU: null })}
      onReset={flow.reset}
    >
      <div className="pt-6 sm:pt-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          Step 2 of 4
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          Why are you in{' '}
          <span className="headline-accent">Köln?</span>
        </h1>
        <p className="mt-3 text-helfa-ink/75 leading-relaxed">
          The permit type, the documents, and the law section all depend on
          this. Pick the closest match.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <button type="button" className="choice-card" onClick={() => pick('student')}>
          <span aria-hidden className="text-2xl">🎓</span>
          <span className="flex-1">
            <span className="block">Studying</span>
            <span className="mt-1 block text-sm font-normal text-helfa-slate">
              Enrolled at a German Hochschule, Fachhochschule, or Universität
            </span>
          </span>
          <span aria-hidden className="text-helfa-slate">→</span>
        </button>
        <button type="button" className="choice-card" onClick={() => pick('worker')}>
          <span aria-hidden className="text-2xl">💼</span>
          <span className="flex-1">
            <span className="block">Working</span>
            <span className="mt-1 block text-sm font-normal text-helfa-slate">
              Job offer, employment contract, or Blue Card eligibility
            </span>
          </span>
          <span aria-hidden className="text-helfa-slate">→</span>
        </button>
        <button type="button" className="choice-card" onClick={() => pick('other')}>
          <span aria-hidden className="text-2xl">…</span>
          <span className="flex-1">
            <span className="block">Other</span>
            <span className="mt-1 block text-sm font-normal text-helfa-slate">
              Family reunification, self-employment, asylum — v1 doesn't cover these
            </span>
          </span>
          <span aria-hidden className="text-helfa-slate">→</span>
        </button>
      </div>
    </StubShell>
  );
}
