import type { AnmeldungState, FlowApi } from '../types';

type StubScreenProps = {
  flow: FlowApi;
  label: string;
  next?: { label?: string; patch: Partial<AnmeldungState> };
  altNext?: { label: string; patch: Partial<AnmeldungState> };
};

export function StubScreen({ flow, label, next, altNext }: StubScreenProps) {
  return (
    <div className="min-h-screen flex flex-col bg-helfa-cream text-helfa-ink">
      <header className="px-5 pt-6 pb-2 sm:px-8 sm:pt-8">
        <span className="display-headline text-sm tracking-[0.18em] text-helfa-slate">
          Helfa
        </span>
      </header>

      <main className="flex-1 px-5 sm:px-8">
        <div className="mx-auto max-w-[640px] pt-12 space-y-6">
          <p className="text-xs uppercase tracking-[0.22em] text-helfa-slate">
            Scaffold stub
          </p>
          <h1 className="display-headline text-3xl sm:text-4xl">{label}</h1>
          <p className="text-helfa-ink/70">
            Real UI lands in a later step. This stub exists so the state machine
            and router can be exercised end-to-end.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {next && (
              <button
                type="button"
                className="btn-pill-cta"
                onClick={() => flow.update(next.patch)}
              >
                {next.label ?? 'Next'} →
              </button>
            )}
            {altNext && (
              <button
                type="button"
                className="btn-pill-ghost"
                onClick={() => flow.update(altNext.patch)}
              >
                {altNext.label}
              </button>
            )}
            <button
              type="button"
              className="btn-pill-ghost"
              onClick={flow.reset}
            >
              Reset
            </button>
          </div>

          <details className="surface-card px-5 py-4 mt-6">
            <summary className="cursor-pointer text-sm font-semibold">
              State (debug)
            </summary>
            <pre className="mt-3 overflow-x-auto text-xs leading-relaxed text-helfa-slate">
              {JSON.stringify(flow.state, null, 2)}
            </pre>
          </details>
        </div>
      </main>
    </div>
  );
}
