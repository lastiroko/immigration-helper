import { useState } from 'react';
import type { FlowApi } from '../types';
import { FlowShell } from '../components/FlowShell';
import { WOHNUNGSGEBER_TEMPLATE } from '../messages';

export function Screen7bRejection({ flow }: { flow: FlowApi }) {
  const [copied, setCopied] = useState(false);

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(WOHNUNGSGEBER_TEMPLATE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const rebook = () => {
    flow.update({
      wasSentHome: false,
      appointmentPath: null,
      appointment: null,
      wentToAppointment: false,
    });
  };

  return (
    <FlowShell
      onBack={() => flow.update({ wasSentHome: false })}
      onReset={flow.reset}
    >
      <div className="pt-6 sm:pt-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
          Sent home
        </p>
        <h1 className="display-headline text-[clamp(2rem,8vw,3.5rem)]">
          That happens.{' '}
          <span className="headline-accent">Three reasons, three fixes.</span>
        </h1>
        <p className="mt-3 text-helfa-ink/75 leading-relaxed">
          Most rejections come down to one of these. Read the matching fix,
          sort it out, then rebook.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {/* Reason 1 — Wohnungsgeberbescheinigung */}
        <article className="surface-card overflow-hidden border-l-4 border-l-helfa-lime">
          <div className="px-5 py-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-helfa-slate">
              REASON 01
            </p>
            <h2 className="mt-1 font-semibold text-helfa-ink">
              Wohnungsgeberbescheinigung not signed, or in the wrong format
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-helfa-ink/80">
              The form must be the official Köln template, signed and dated
              within 14 days of your move-in. A custom letter from your
              landlord doesn't count. A scan of the lease doesn't count.
            </p>

            <div className="mt-4 rounded-xl bg-helfa-stone/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-helfa-slate">
                Message to send your landlord
              </p>
              <pre className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-helfa-ink">
                {WOHNUNGSGEBER_TEMPLATE}
              </pre>
              <button
                type="button"
                onClick={copyTemplate}
                className="btn-pill-ghost mt-3"
              >
                {copied ? 'Copied ✓' : 'Copy German message'}
              </button>
            </div>
          </div>
        </article>

        {/* Reason 2 — Visa / eAT */}
        <article className="surface-card overflow-hidden border-l-4 border-l-helfa-lime">
          <div className="px-5 py-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-helfa-slate">
              REASON 02
            </p>
            <h2 className="mt-1 font-semibold text-helfa-ink">
              Missing visa pages or eAT card (non-EU only)
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-helfa-ink/80">
              Bring your passport with <strong>every</strong> stamp and sticker
              page, plus the physical eAT card if you have one.{' '}
              <em className="not-italic font-medium text-helfa-ink">
                A photo of the card does not count
              </em>{' '}
              — they need to see the chip.
            </p>
          </div>
        </article>

        {/* Reason 3 — Address mismatch */}
        <article className="surface-card overflow-hidden border-l-4 border-l-helfa-lime">
          <div className="px-5 py-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-helfa-slate">
              REASON 03
            </p>
            <h2 className="mt-1 font-semibold text-helfa-ink">
              Address mismatch — form says X, Wohnungsgeber says Y
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-helfa-ink/80">
              Ask your landlord to re-issue the Wohnungsgeberbescheinigung
              with the exact address as it appears on your lease. Even a
              missing apartment number is enough to get sent home.
            </p>
          </div>
        </article>
      </div>

      <p className="mt-6 text-sm text-helfa-slate leading-relaxed">
        Hit a fourth reason? Don't read more — call the Kundenzentrum on
        0221/221-0 and ask exactly what's needed before you go back.
      </p>

      <div className="mt-8 mb-4">
        <button type="button" className="btn-pill-cta w-full" onClick={rebook}>
          Rebook → pick a path
        </button>
      </div>
    </FlowShell>
  );
}
