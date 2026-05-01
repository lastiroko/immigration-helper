import { LegalLayout } from '../components/LegalNotice';

/**
 * Allgemeine Geschäftsbedingungen (AGB) — terms & conditions.
 * Highly recommend a Rechtsanwalt review, especially around §§ 305-310 BGB
 * (transparency requirement) and the Withdrawal section (§312g BGB).
 */
export default function Terms() {
  return (
    <LegalLayout title="Terms / Allgemeine Geschäftsbedingungen">
      <h2 className="text-xl font-semibold mt-6">§ 1 Scope</h2>
      <p>
        These Terms govern the contractual relationship between YOUR_LEGAL_NAME
        ("Helfa", "we") and you ("user") for the use of the Helfa app and
        website. Conflicting or supplementary user terms are not recognised
        unless we expressly agree to them in writing.
      </p>

      <h2 className="text-xl font-semibold mt-6">§ 2 What Helfa is — and isn't</h2>
      <p>
        Helfa is a workflow and information service. It sequences German
        bureaucratic tasks for international residents and surfaces
        relevant authority offices and partner services. <strong>Helfa is
        not a legal-advice service, a tax-advice service, an immigration
        consultancy, an insurance broker, or a bank.</strong> Regulated
        services (legal advice per RDG, tax advice per StBerG, insurance
        brokerage per §34d GewO, banking per KWG) are provided exclusively
        by licensed third parties via the Marketplace, under their own
        terms and supervisory regimes.
      </p>

      <h2 className="text-xl font-semibold mt-6">§ 3 Account, accuracy, eligibility</h2>
      <p>
        You must be at least 18 years old to register. You agree to provide
        accurate information and to keep your account credentials secret.
        We may suspend accounts on suspicion of fraud, abuse, or breach of
        these Terms.
      </p>

      <h2 className="text-xl font-semibold mt-6">§ 4 Free and paid tiers</h2>
      <p>
        The base Helfa product is free to use. Optional Premium and
        Enterprise subscriptions unlock additional features (e.g., higher
        document-vault quota). Subscriptions auto-renew at the end of each
        billing period until cancelled in your account settings or via the
        Stripe customer portal.
      </p>

      <h2 className="text-xl font-semibold mt-6">§ 5 Withdrawal (§312g BGB)</h2>
      <p>
        As a consumer in the EU, you have a 14-day right of withdrawal
        starting on the day of contract conclusion. To exercise it, send
        an unambiguous statement (e.g., email to YOUR_EMAIL) declaring
        your withdrawal. By starting use of the paid service immediately,
        you expressly consent to begin performance and acknowledge that
        your right of withdrawal lapses on full performance.
      </p>

      <h2 className="text-xl font-semibold mt-6">§ 6 Marketplace partners</h2>
      <p>
        Helfa earns referral fees when you complete certain actions with
        marketplace partners (e.g., opening a Sperrkonto). Each partner
        card displays the disclosure language verbatim. The contract for
        partner services is concluded between you and the partner, not
        with Helfa. Helfa is not responsible for the partner's
        performance, fees, refunds, or disputes.
      </p>

      <h2 className="text-xl font-semibold mt-6">§ 7 Liability</h2>
      <p>
        Helfa is liable without limitation for intent and gross
        negligence, and for harm to life, body, or health. For ordinary
        negligence in breach of material contractual obligations
        (Kardinalpflichten), liability is limited to typical foreseeable
        damages. Other liability for ordinary negligence is excluded.
        Liability under the Product Liability Act (ProdHaftG) and for
        guarantees expressly given remains unaffected.
      </p>

      <h2 className="text-xl font-semibold mt-6">§ 8 Term and termination</h2>
      <p>
        You may terminate your account at any time via the Settings page.
        We may terminate the contract for good cause (wichtiger Grund) per
        §314 BGB, including material breach of these Terms.
      </p>

      <h2 className="text-xl font-semibold mt-6">§ 9 Changes to these Terms</h2>
      <p>
        We may amend these Terms with 30 days' notice via email. If you
        object to a change within the notice period, the old terms continue
        to apply, but we may then terminate for the next ordinary date.
      </p>

      <h2 className="text-xl font-semibold mt-6">§ 10 Governing law and venue</h2>
      <p>
        These Terms are governed by German law, with the exception of
        mandatory consumer-protection provisions of your country of
        residence. The exclusive place of jurisdiction for merchants is
        YOUR_CITY.
      </p>

      <h2 className="text-xl font-semibold mt-6">§ 11 Severability</h2>
      <p>
        If any provision of these Terms is or becomes invalid, the
        remaining provisions remain in force. The invalid provision shall
        be replaced by a valid one that comes closest to the economic
        intent of the original.
      </p>
    </LegalLayout>
  );
}
