import { LegalLayout } from '../components/LegalNotice';

/**
 * Datenschutzerklärung. Required under DSGVO Art. 13/14 and TTDSG.
 * The data processing list below mirrors what Helfa actually does today
 * (V1-V15 schema, Stripe, FileStorageService); update if you add new
 * subprocessors (e.g., FCM, S3, analytics).
 */
export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy / Datenschutzerklärung">
      <h2 className="text-xl font-semibold mt-6">1. Controller</h2>
      <p>
        Controller within the meaning of the GDPR is YOUR_LEGAL_NAME,
        YOUR_STREET_ADDRESS, YOUR_POSTAL_CODE YOUR_CITY, Germany.
        See the <a href="/imprint" className="text-blue-600 hover:underline">Imprint</a> for full contact details.
      </p>

      <h2 className="text-xl font-semibold mt-6">2. Personal data we process</h2>
      <p>When you use Helfa, we collect and store:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Account:</strong> email, name, hashed password, account creation timestamp.</li>
        <li><strong>Profile:</strong> nationality, city, visa pathway, family status,
          family-in-Germany flag, arrival/Anmeldung/permit-expiry dates.</li>
        <li><strong>Activity:</strong> tasks generated for your journey, completion
          timestamps, postpone dates, document attachments.</li>
        <li><strong>Documents:</strong> files you upload to your vault. Stored
          encrypted at rest. Bytes never sent to third parties.</li>
        <li><strong>Notifications:</strong> push tokens (if you grant permission)
          and a record of delivered notifications.</li>
        <li><strong>Billing:</strong> Stripe customer ID, subscription tier, period
          dates. Card data is held by Stripe — we never see card numbers.</li>
        <li><strong>Server logs:</strong> IP address, user-agent, request path,
          timestamp. Retained for 30 days for security/operations.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">3. Legal bases (Art. 6 GDPR)</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Art. 6 (1) lit. b — performance of contract: account, profile,
          tasks, documents, billing.</li>
        <li>Art. 6 (1) lit. c — legal obligation: tax-relevant billing
          records (kept 10 years per HGB §257).</li>
        <li>Art. 6 (1) lit. f — legitimate interest: server logs (security),
          fraud prevention.</li>
        <li>Art. 6 (1) lit. a — consent: push notifications, marketing
          emails (opt-in).</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">4. Subprocessors</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Railway, Inc.</strong> — hosting + Postgres database, US/EU
          regions. Standard Contractual Clauses in place.</li>
        <li><strong>Stripe Payments Europe Ltd.</strong> — billing.</li>
        <li><strong>Affiliate-network partners</strong> — only when you
          actively click a Marketplace card; only an opaque click-id is
          shared (no personal data).</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">5. Retention</h2>
      <p>
        Account data is kept while your account is active. After you
        request deletion (DELETE /v1/users/me), data is held for a 30-day
        grace period during which you can restore the account, then
        hard-deleted. Tax-relevant billing records are retained for 10
        years under HGB §257. Server logs are kept 30 days.
      </p>

      <h2 className="text-xl font-semibold mt-6">6. Your rights (Art. 15-21 GDPR)</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Right of access (Art. 15) — request a JSON export at
          <code className="bg-gray-100 px-1 rounded text-xs"> POST /v1/privacy/export</code>.</li>
        <li>Right to rectification (Art. 16) — edit your profile in-app.</li>
        <li>Right to erasure (Art. 17) — DELETE your account in Settings.</li>
        <li>Right to data portability (Art. 20) — same export endpoint.</li>
        <li>Right to lodge a complaint with your supervisory authority
          (Art. 77) — for Bavaria: Bayerisches Landesamt für Datenschutzaufsicht.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">7. Cookies and tracking</h2>
      <p>
        Helfa uses only strictly necessary technical cookies (auth token in
        localStorage). We do not use analytics, advertising, or tracking
        cookies, and therefore do not show a cookie banner per TTDSG §25.
      </p>

      <h2 className="text-xl font-semibold mt-6">8. Contact</h2>
      <p>
        For privacy questions or to exercise your rights, contact
        YOUR_PRIVACY_EMAIL.
      </p>
    </LegalLayout>
  );
}
