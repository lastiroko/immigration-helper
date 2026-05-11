import { Link } from 'react-router-dom';
import type { FlowApi } from '../types';
import { StubShell } from './_StubShell';

export function Screen8WhatsNext({ flow }: { flow: FlowApi }) {
  return (
    <StubShell onReset={flow.reset}>
      <div className="pt-6 sm:pt-10 space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-lime">
          Done (scaffold)
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          Fiktionsbescheinigung in hand.{' '}
          <span className="headline-accent">Here's what comes next.</span>
        </h1>
        <p className="text-helfa-ink/80 leading-relaxed">
          Real timeline + .ics export ships once eAT delivery times,
          fees, and renewal lead-times are verified.
        </p>
      </div>

      <div className="mt-8 surface-card px-5 py-4 text-sm leading-relaxed text-helfa-ink/85 space-y-3">
        <p className="font-semibold text-helfa-ink">Roadmap items in v1.0:</p>
        <ul className="space-y-1 list-disc pl-5">
          <li>Day 0: Fiktionsbescheinigung in hand. Don't lose it.</li>
          <li>Day 14–28: PIN letter from Bundesdruckerei (separately, by post)</li>
          <li>Day 28–42: eAT card arrives or is ready for pickup</li>
          <li>6 weeks before expiry: Verlängerung appointment booking</li>
          <li>Within 5 years: eligibility for Niederlassungserlaubnis</li>
        </ul>
      </div>

      <div className="mt-8">
        <Link to="/anmeldung-koeln" className="btn-pill-ghost inline-flex">
          ← Back to Anmeldung Köln
        </Link>
      </div>
    </StubShell>
  );
}
