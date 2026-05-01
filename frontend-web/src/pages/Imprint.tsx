import { LegalLayout } from '../components/LegalNotice';

/**
 * Impressum (legally required under §5 TMG and §18 MStV).
 * Replace YOUR_* placeholders with the operator's actual details.
 */
export default function Imprint() {
  return (
    <LegalLayout title="Imprint / Impressum">
      <h2 className="text-xl font-semibold mt-6">Information per §5 TMG</h2>
      <p>
        YOUR_LEGAL_NAME<br />
        YOUR_STREET_ADDRESS<br />
        YOUR_POSTAL_CODE YOUR_CITY<br />
        Germany
      </p>

      <h2 className="text-xl font-semibold mt-6">Contact</h2>
      <p>
        Phone: YOUR_PHONE<br />
        Email: YOUR_EMAIL
      </p>

      <h2 className="text-xl font-semibold mt-6">Commercial register / VAT</h2>
      <p>
        Register court: YOUR_REGISTER_COURT (e.g., Amtsgericht München)<br />
        Register number: YOUR_HRB_NUMBER<br />
        VAT ID per §27a UStG: YOUR_VAT_ID
      </p>

      <h2 className="text-xl font-semibold mt-6">Editorially responsible per §18 (2) MStV</h2>
      <p>
        YOUR_NAME<br />
        Same address as above.
      </p>

      <h2 className="text-xl font-semibold mt-6">EU dispute resolution</h2>
      <p>
        The EU Commission provides an online dispute-resolution platform
        at <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:underline">ec.europa.eu/consumers/odr/</a>.
        We are not obliged or willing to participate in dispute-resolution
        proceedings before a consumer arbitration board.
      </p>

      <h2 className="text-xl font-semibold mt-6">Liability for content</h2>
      <p>
        As a service provider we are responsible for our own content on
        these pages per §7 (1) TMG and applicable general laws. Per §§ 8 to
        10 TMG we are however not obliged to monitor transmitted or stored
        third-party information, or to investigate circumstances that
        indicate illegal activity. Removal or blocking obligations under
        general law remain unaffected.
      </p>

      <h2 className="text-xl font-semibold mt-6">Liability for links</h2>
      <p>
        Our offer contains links to external third-party websites whose
        content we cannot influence. We therefore cannot accept any
        liability for this third-party content. The respective provider or
        operator of the linked pages is always responsible for their content.
      </p>

      <h2 className="text-xl font-semibold mt-6">Copyright</h2>
      <p>
        The content and works on these pages created by the operator are
        subject to German copyright law. Reproduction, processing,
        distribution and any kind of use outside the limits of copyright
        require the written consent of the respective author or creator.
      </p>
    </LegalLayout>
  );
}
