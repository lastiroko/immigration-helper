/**
 * Yellow banner that flags every legal page as not-yet-lawyer-reviewed.
 * Remove the banner once you've replaced the placeholder text with a
 * version reviewed by a German lawyer (recommended: Rechtsanwalt
 * specialising in IT-Recht / DSGVO).
 */
import { Footer } from './Footer';
import { Link } from 'react-router-dom';

export function LegalNotice() {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-xl">
      <p className="text-sm text-yellow-900">
        <strong>Placeholder text.</strong> This page contains template
        language only. <em>Do not launch in Germany without a Rechtsanwalt
        review</em> — §5 TMG (Imprint), DSGVO/TTDSG (Privacy), and BGB §305
        (AGB) all carry abmahnung risk if filed incorrectly.
      </p>
    </div>
  );
}

export function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-helfa-cream">
      <header className="bg-helfa-cream border-b border-helfa-ink/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-helfa-lime grid place-items-center text-helfa-ink font-display text-base">H</span>
            <span className="font-display text-lg uppercase tracking-tightest text-helfa-ink">Helfa</span>
          </Link>
          <Link to="/" className="text-sm text-helfa-slate hover:text-helfa-ink">← back to Helfa</Link>
        </div>
      </header>

      <main className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto surface-card p-8 sm:p-10">
          <p className="text-xs uppercase tracking-[0.2em] text-helfa-slate">Legal</p>
          <h1 className="display-headline text-3xl sm:text-4xl mt-1 mb-6">{title}</h1>
          <LegalNotice />
          <div className="prose prose-sm max-w-none text-helfa-ink/80 leading-relaxed space-y-4">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
