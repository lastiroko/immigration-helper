import type { FlowApi } from '../types';
import { StubShell } from './_StubShell';

export function Screen5Documents({ flow }: { flow: FlowApi }) {
  const isStudent = flow.state.purpose === 'student';
  return (
    <StubShell
      onBack={() => flow.update({ visaExpires: null })}
      onReset={flow.reset}
    >
      <div className="pt-6 sm:pt-10 space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          Documents · scaffold (v0.2 spec)
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          Bring all of these.{' '}
          <span className="headline-accent">Wrong office = sent home.</span>
        </h1>
        <p className="text-helfa-ink/80 leading-relaxed">
          Verified document list for your purpose:{' '}
          <strong>{isStudent ? 'student' : 'worker'}</strong>. Real
          interactive checklist (with form-fill via pdf-lib for form
          33-F07_ErstAntBefAuf) ships once worker docs + fees + 2026 Blue
          Card thresholds are verified.
        </p>
      </div>

      <div className="mt-8 surface-card px-5 py-4 space-y-3 text-sm leading-relaxed text-helfa-ink/85">
        <p className="font-semibold text-helfa-ink">Both purposes need:</p>
        <ul className="space-y-1 list-disc pl-5">
          <li>Passport with valid visa or entry stamp + copies of all printed pages</li>
          <li>Biometric photo, 35×45 mm, max 3 months old</li>
          <li>Meldebescheinigung from Anmeldung</li>
          <li>Proof of health insurance</li>
          <li>Rental contract (Mietvertrag) — proof of address</li>
          <li>Filled application form (33-F07_ErstAntBefAuf)</li>
        </ul>
        {isStudent ? (
          <>
            <p className="font-semibold text-helfa-ink mt-3">Students also need:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li>Immatrikulationsbescheinigung (enrollment confirmation)</li>
              <li>Sperrkonto ≥ €11,904/year (€992/month, 08/2025 rate) OR scholarship OR Verpflichtungserklärung</li>
            </ul>
          </>
        ) : (
          <>
            <p className="font-semibold text-helfa-ink mt-3">
              Workers also need <em>(TODO — needs verification before v1.0)</em>:
            </p>
            <ul className="space-y-1 list-disc pl-5">
              <li>Signed employment contract or job offer</li>
              <li>"Erklärung zum Beschäftigungsverhältnis" (employer fills)</li>
              <li>Highest education certificate (ANABIN-recognized if foreign)</li>
              <li>Salary proof — Blue Card 2026 thresholds TBC</li>
            </ul>
          </>
        )}
      </div>

      <div className="mt-6">
        <a
          href="https://formular-server.de/Koeln_FS/findform?shortname=33-F07_ErstAntBefAuf&formtecid=3&areashortname=send_html"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pill-ghost inline-flex"
        >
          Open the blank application form ↗
        </a>
      </div>

      <div className="mt-8">
        <button
          type="button"
          className="btn-pill-cta"
          onClick={() => flow.update({ documentsConfirmed: true })}
        >
          Continue → Booking
        </button>
        <p className="mt-2 text-xs text-helfa-slate">
          Real checkbox-gated CTA + pdf-lib form-fill ship after spec lock.
        </p>
      </div>
    </StubShell>
  );
}
