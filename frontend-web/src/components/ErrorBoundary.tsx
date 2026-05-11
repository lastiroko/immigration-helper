import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

/**
 * Top-level error boundary. Catches runtime React errors so a bug in
 * one screen doesn't crash the whole tab to a white page. Surfaces a
 * Restart affordance (clears localStorage state for both sub-products,
 * full page reload). Logged to console — no external error reporting
 * configured (would need Sentry, deferred).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error('Helfa runtime error:', error);
    if (info.componentStack) console.error(info.componentStack);
  }

  handleRestart = () => {
    try {
      window.localStorage.removeItem('helfa.anmeldung-koeln.state');
      window.localStorage.removeItem('helfa.auslaenderbehoerde-koeln.state');
    } catch {
      /* localStorage might be disabled — ignore */
    }
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-helfa-cream px-5 py-16 text-helfa-ink">
        <div className="max-w-[520px] text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-helfa-slate">
            Something broke
          </p>
          <h1 className="display-headline text-3xl sm:text-4xl">
            Sorry — the page hit an error.
          </h1>
          <p className="text-helfa-ink/80 leading-relaxed">
            Your saved progress in this browser is still safe. Try
            reloading first; if that doesn't help, the Restart button
            clears it and brings you back to the start.
          </p>
          {this.state.error?.message && (
            <details className="text-xs text-helfa-slate text-left">
              <summary className="cursor-pointer">Technical details</summary>
              <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-helfa-stone/60 p-3">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-2">
            <button
              type="button"
              className="btn-pill-cta"
              onClick={this.handleReload}
            >
              Reload page
            </button>
            <button
              type="button"
              className="btn-pill-ghost"
              onClick={this.handleRestart}
            >
              Restart (clears saved progress)
            </button>
          </div>
        </div>
      </div>
    );
  }
}
