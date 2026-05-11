import type { FlowApi } from '../types';
import { StubShell } from './_StubShell';

export function Screen1EU({ flow }: { flow: FlowApi }) {
  if (flow.state.isNonEU === false) {
    return (
      <StubShell onBack={() => flow.update({ isNonEU: null })} onReset={flow.reset}>
        <div className="pt-6 sm:pt-10 space-y-4">
          <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
            Step 1 of 4 · You're done here
          </p>
          <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
            You don't need a residence permit.{' '}
            <span className="headline-accent">Anmeldung is enough.</span>
          </h1>
          <p className="text-helfa-ink/80 leading-relaxed">
            EU, EEA, and Swiss citizens have free movement and residence
            rights in Germany. Your Anmeldung covers your registration; no
            Aufenthaltstitel needed.
          </p>
        </div>
      </StubShell>
    );
  }

  return (
    <StubShell onBack={() => flow.update({ started: false })} onReset={flow.reset}>
      <div className="pt-6 sm:pt-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          Step 1 of 4
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          Are you a{' '}
          <span className="headline-accent">non-EU citizen?</span>
        </h1>
        <p className="mt-3 text-helfa-ink/75 leading-relaxed">
          EU / EEA / Swiss citizens don't need a residence permit. Everyone
          else does, within the validity of their entry visa or stamp.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <button
          type="button"
          className="choice-card"
          onClick={() => flow.update({ isNonEU: true })}
        >
          <span aria-hidden className="text-2xl">🌍</span>
          <span className="flex-1">
            <span className="block">Yes — non-EU citizen</span>
            <span className="mt-1 block text-sm font-normal text-helfa-slate">
              You need an Aufenthaltstitel from the Ausländerbehörde
            </span>
          </span>
          <span aria-hidden className="text-helfa-slate">→</span>
        </button>
        <button
          type="button"
          className="choice-card"
          onClick={() => flow.update({ isNonEU: false })}
        >
          <span aria-hidden className="text-2xl">🇪🇺</span>
          <span className="flex-1">
            <span className="block">No — EU, EEA, or Swiss</span>
            <span className="mt-1 block text-sm font-normal text-helfa-slate">
              You're done here. Anmeldung covers you.
            </span>
          </span>
          <span aria-hidden className="text-helfa-slate">→</span>
        </button>
      </div>
    </StubShell>
  );
}
