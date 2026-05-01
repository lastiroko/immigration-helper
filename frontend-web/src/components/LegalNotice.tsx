/**
 * Yellow banner that flags every legal page as not-yet-lawyer-reviewed.
 * Remove the banner once you've replaced the placeholder text with a
 * version reviewed by a German lawyer (recommended: Rechtsanwalt
 * specialising in IT-Recht / DSGVO).
 */
export function LegalNotice() {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
      <p className="text-sm text-yellow-800">
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-900 mb-4 inline-block">← back to Helfa</a>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
        <LegalNotice />
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
