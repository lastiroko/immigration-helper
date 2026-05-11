import type { FlowApi } from '../types';
import { FlowShell } from '../components/FlowShell';

export function Screen2Residence({ flow }: { flow: FlowApi }) {
  const { hasAddress } = flow.state;

  // Off-ramp: user has no address yet — show the housing branch.
  if (hasAddress === 'no') {
    return (
      <FlowShell
        onBack={() => flow.update({ hasAddress: null })}
        onReset={flow.reset}
      >
        <div className="pt-6 sm:pt-10 space-y-6">
          <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
            Step 3 of 4 · Off-ramp
          </p>
          <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
            You can't do Anmeldung without an address.{' '}
            <span className="headline-accent">Let's fix that first.</span>
          </h1>
          <p className="text-helfa-ink/80 leading-relaxed">
            Three options, ranked by how fast they get you registerable:
          </p>

          <ol className="space-y-4">
            <li className="surface-card px-5 py-4">
              <p className="font-semibold">1. Temporary furnished rental</p>
              <p className="mt-1 text-sm text-helfa-ink/75 leading-relaxed">
                Wunderflats, Homelike — you can register at most of these.{' '}
                <em className="text-helfa-ink/85 not-italic font-medium">
                  Always confirm the landlord will sign a
                  Wohnungsgeberbescheinigung before booking
                </em>{' '}
                — some refuse and the place becomes useless to you.
              </p>
            </li>
            <li className="surface-card px-5 py-4">
              <p className="font-semibold">2. Sublease (Untermiete)</p>
              <p className="mt-1 text-sm text-helfa-ink/75 leading-relaxed">
                Legal only if the main tenant has written permission from
                their landlord to sublet and registers you. Risky, common,
                ask explicitly.
              </p>
            </li>
            <li className="surface-card px-5 py-4">
              <p className="font-semibold">3. Long-term rental</p>
              <p className="mt-1 text-sm text-helfa-ink/75 leading-relaxed">
                Competitive in Köln. ImmoScout24, WG-Gesucht, Kleinanzeigen.
              </p>
            </li>
          </ol>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="button"
              className="btn-pill-cta"
              onClick={() => flow.update({ hasAddress: 'yes' })}
            >
              I have an address now
            </button>
            <button
              type="button"
              className="btn-pill-ghost"
              onClick={flow.reset}
            >
              No thanks, I'll find it myself
            </button>
          </div>

          <p className="text-sm text-helfa-slate">
            Come back here once you've moved in — your 14-day clock starts
            on move-in day.
          </p>
        </div>
      </FlowShell>
    );
  }

  return (
    <FlowShell
      onBack={() => flow.update({ originIsAbroad: null })}
      onReset={flow.reset}
    >
      <div className="pt-6 sm:pt-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          Step 3 of 4
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          Do you have a place to live in{' '}
          <span className="headline-accent">Köln yet?</span>
        </h1>
        <p className="mt-3 text-helfa-ink/75 leading-relaxed">
          Anmeldung needs a real address — your landlord has to sign a form
          confirming you live there. No address, no Anmeldung.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <button
          type="button"
          className="choice-card"
          onClick={() => flow.update({ hasAddress: 'yes' })}
        >
          <span aria-hidden className="text-2xl">✅</span>
          <span className="flex-1">
            <span className="block">Yes, I have an address in Köln</span>
            <span className="mt-1 block text-sm font-normal text-helfa-slate">
              Lease signed, keys in hand (or about to be)
            </span>
          </span>
          <span aria-hidden className="text-helfa-slate">→</span>
        </button>

        <button
          type="button"
          className="choice-card"
          onClick={() => flow.update({ hasAddress: 'no' })}
        >
          <span aria-hidden className="text-2xl">❌</span>
          <span className="flex-1">
            <span className="block">Not yet — I'm still looking</span>
            <span className="mt-1 block text-sm font-normal text-helfa-slate">
              We'll point you at the fastest paths to a registerable address
            </span>
          </span>
          <span aria-hidden className="text-helfa-slate">→</span>
        </button>
      </div>
    </FlowShell>
  );
}
