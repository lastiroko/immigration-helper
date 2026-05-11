import type { FlowApi } from '../types';
import { StubShell } from './_StubShell';

export function Screen7Companion({ flow }: { flow: FlowApi }) {
  const appt = flow.state.appointment;
  return (
    <StubShell
      onBack={() => flow.update({ appointment: null })}
      onReset={flow.reset}
    >
      <div className="pt-6 sm:pt-10 space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          Companion · scaffold (v0.2 spec)
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          You're at{' '}
          <span className="headline-accent">
            Bezirksausländeramt {appt?.bezirksamt ?? 'Köln'}.
          </span>
        </h1>
        <p className="text-helfa-ink/80 leading-relaxed">
          Real companion mode — final document tick-through, big tappable
          German phrases (Aufenthaltstitel-specific), what-happens-at-the-desk
          rundown, fee notice — ships once spec is locked. Mirrors Anmeldung
          Screen 7's PhraseOverlay component.
        </p>
      </div>

      <div className="mt-8 surface-card px-5 py-4 text-sm leading-relaxed text-helfa-ink/85">
        <p className="font-semibold text-helfa-ink">Phrases that will be in v1.0:</p>
        <ul className="mt-2 space-y-1">
          <li>"Ich beantrage einen Aufenthaltstitel" — I'm applying for a residence permit</li>
          <li>"Wann bekomme ich meinen Titel?" — When will I get my permit?</li>
          <li>"Kann ich mit dem Antrag schon arbeiten?" — Can I work while the application is pending?</li>
        </ul>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="btn-pill-cta"
          onClick={() =>
            flow.update({
              fiktionsbescheinigungObtainedAt: new Date().toISOString().slice(0, 10),
            })
          }
        >
          I got my Fiktionsbescheinigung
        </button>
      </div>
    </StubShell>
  );
}
