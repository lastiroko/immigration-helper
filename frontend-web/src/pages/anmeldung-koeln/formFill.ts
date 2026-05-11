// pdf-lib (~150 KB gzipped) is dynamically imported inside
// fillAnmeldeformular so it doesn't sit in the initial JS bundle. Only
// users who click "Generate my filled form" pay for it. The type import
// below is erased at compile time.
import type { PDFDocument } from 'pdf-lib';
import type {
  PersonalDetails,
  SecondPerson,
  Sex,
  MaritalStatus,
  Religion,
  Relationship,
  ResidenceType,
  DocumentType,
} from './types';

// The HTML "interactive form" at formular-server.de findform?... is a JS
// wrapper around this static template PDF (with AcroForm fields). The same
// server sends Access-Control-Allow-Origin: *, so we can fetch it from the
// browser. If the city ever bumps the version path (006-001 → 006-002, etc.)
// this constant is the only thing to update.
const PDF_URL =
  'https://formular-server.de/Koeln_FS/getform/34-F27_Anmeldung_koeln_html_HTML/006-001/34-F27_Anmeldung_v04_Vorl-1.10.pdf';

const SEX_CODE: Record<Sex, string> = {
  female: 'w',
  male: 'm',
  diverse: 'd',
  '': '',
};

const RELIGION_CODE: Record<Exclude<Religion, 'other' | ''>, string> = {
  none: '--',
  catholic: 'rk',
  protestant: 'ev',
  jewish: 'jd',
};

// Values come straight from the PDF dropdown options — must match exactly or
// pdf-lib throws.
const MARITAL_OPTION: Record<MaritalStatus, string> = {
  single: 'ledig',
  married: 'verheiratet',
  divorced: 'geschieden',
  widowed: 'verwitwet',
  '': '',
};

const RELATIONSHIP_OPTION: Record<Relationship, string> = {
  spouse: 'Ehegatte oder Ehegattin',
  childBoth: 'Kind beider Eltern',
  childMother: 'Kind der Mutter',
  childFather: 'Kind des Vaters',
  '': '',
};

// PDF radio-group option values (verbatim from inspection).
const RESIDENCE_OPTION: Record<ResidenceType, string> = {
  alleinige: 'alleinige Wohnung',
  haupt: 'Hauptwohnung',
  neben: 'Nebenwohnung',
  '': '',
};

function toGermanDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

function religionValue(
  religion: Religion,
  otherText: string,
): string {
  if (religion === 'other') return otherText;
  if (religion === '') return '';
  return RELIGION_CODE[religion];
}

/**
 * Split a single "first name(s)" string into Rufname (the name you go by)
 * and weitere Vornamen (additional given names). Convention: first token
 * is the Rufname, the rest are weitere Vornamen.
 *
 * Examples:
 *   "John"               → { ruf: "John",  weitere: "" }
 *   "John Michael"       → { ruf: "John",  weitere: "Michael" }
 *   "Anna-Maria Theresa" → { ruf: "Anna-Maria", weitere: "Theresa" }
 */
function splitFirstNames(input: string): { ruf: string; weitere: string } {
  const trimmed = input.trim();
  if (!trimmed) return { ruf: '', weitere: '' };
  const idx = trimmed.indexOf(' ');
  if (idx === -1) return { ruf: trimmed, weitere: '' };
  return {
    ruf: trimmed.slice(0, idx),
    weitere: trimmed.slice(idx + 1).trim(),
  };
}

/**
 * Fetches the live official Köln Anmeldeformular PDF, fills in the user's
 * details via AcroForm, and returns a Blob URL the caller can open or
 * download. Throws on network failure or PDF parse failure — caller surfaces.
 */
export async function fillAnmeldeformular(
  details: PersonalDetails,
  moveInDate: string | null,
): Promise<string> {
  // Dynamic import — Vite splits pdf-lib into its own chunk, fetched on
  // first call. Parallel with the PDF download below to overlap latency.
  const [{ PDFDocument }, res] = await Promise.all([
    import('pdf-lib'),
    fetch(PDF_URL),
  ]);
  if (!res.ok) {
    throw new Error(`fetch-failed-${res.status}`);
  }
  const bytes = await res.arrayBuffer();
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const form = pdf.getForm();

  // Single-field setters with try/catch so a missing/renamed field never
  // blows up the whole fill — clerks would rather have most of the form
  // typed than a stack trace.
  const setText = (name: string, value: string | null | undefined) => {
    if (!value) return;
    try {
      form.getTextField(name).setText(value);
    } catch {
      /* missing or wrong type */
    }
  };
  const selectDropdown = (name: string, value: string) => {
    if (!value) return;
    try {
      form.getDropdown(name).select(value);
    } catch {
      /* missing or option mismatch */
    }
  };
  const selectRadio = (name: string, value: string) => {
    if (!value) return;
    try {
      form.getRadioGroup(name).select(value);
    } catch {
      /* missing or option mismatch */
    }
  };

  // ── Person 1 — basics ──────────────────────────────────────────────────
  const p1Names = splitFirstNames(details.firstName);
  setText('antragsteller.familienname_1', details.familyName);
  setText('antragsteller.gebname_1', details.birthName);
  setText('antragsteller.rufname_1', p1Names.ruf);
  setText('antragsteller.vorname_1', p1Names.weitere);
  setText('antragsteller.gebort_1', details.birthCity);
  setText('antragsteller.gebland_1', details.birthCountry);
  setText('antragsteller.gebdatum_1', toGermanDate(details.dateOfBirth));
  setText('antragsteller.geschlecht_1', SEX_CODE[details.sex]);
  setText('antragsteller.staatsang_1', details.nationality);
  setText(
    'antragsteller.religion_1',
    religionValue(details.religion, details.otherReligion),
  );
  selectDropdown(
    'amtragsteller.familienstand_1', // sic — typo in PDF source, must match
    MARITAL_OPTION[details.maritalStatus],
  );

  // ── Person 1 — ID document ────────────────────────────────────────────
  selectDropdown('amtragsteller.dokumentenart_1', details.documentType);
  setText('antragsteller.seriennr_1', details.documentSerial);
  setText('antragsteller.ausstbehoerde_1', details.documentIssuingAuthority);
  setText('antragsteller.dokdatum_1', toGermanDate(details.documentIssueDate));
  setText(
    'antragsteller.dokgueltig_1',
    toGermanDate(details.documentExpiryDate),
  );

  // ── Previous address ──────────────────────────────────────────────────
  setText('wohnung.alt_auszug', toGermanDate(details.moveOutDate));
  setText('wohnung.alt_strasse_hausnr', details.prevStreet);
  setText('wohnung.alt_postleitzahl', details.prevPostalCode);
  setText('wohnung.alt_ort', details.prevCity);
  setText('wohnung.alt_kreis', details.prevKreis);
  setText('wohnung.alt_land', details.prevBundesland);
  setText('wohnung.alt_staat', details.prevCountry);
  selectRadio('wohnung_alt_auswahl', RESIDENCE_OPTION[details.residenceTypeOld]);
  selectRadio(
    'wohnung_alt_behalten',
    details.keepingOldResidence === 'yes'
      ? 'ja, und zwar als'
      : details.keepingOldResidence === 'no'
        ? 'nein'
        : '',
  );
  selectRadio(
    'wohnung_behalten_als',
    details.keepingOldAs === 'haupt'
      ? 'Hauptwohnung'
      : details.keepingOldAs === 'neben'
        ? 'Nebenwohnung'
        : '',
  );

  // ── New address (Köln) ────────────────────────────────────────────────
  setText('wohnung.neu_einzug', toGermanDate(moveInDate ?? ''));
  setText('wohnung.neu_strasse_hausnr', details.koelnStreet);
  setText('wohnung.neu_postleitzahl', details.koelnPostalCode);
  setText('wohnung.neu_ort', 'Köln');
  setText('wohnung.neu_ortsteil', details.koelnOrtsteil);
  selectRadio('wohnung_neu_auswahl', RESIDENCE_OPTION[details.residenceTypeNew]);

  // ── Wohnungsgeber (landlord) ──────────────────────────────────────────
  setText('wohnung.geber_name', details.landlordName);
  setText('wohnung.geber_strasse_hausnr', details.landlordStreet);
  setText('vermieter.postleitzahl', details.landlordPostalCode);
  setText('vermieter.ort', details.landlordCity);

  // ── Other German homes radio ──────────────────────────────────────────
  selectRadio(
    'wohnung.weitere',
    details.hasOtherDEHomes === 'yes'
      ? 'ja'
      : details.hasOtherDEHomes === 'no'
        ? 'nein'
        : '',
  );

  // ── Marriage info (only if married) ───────────────────────────────────
  if (details.maritalStatus === 'married') {
    setText('antragsteller.ehe_datum', toGermanDate(details.marriageDate));
    setText('antragsteller.az_ehe', details.marriageRegistryNumber);
    setText('antragsteller.ehe_ort', details.marriagePlace);
    setText('antragsteller.ehe_land', details.marriageCountry);
  }

  // ── Person 2 (only if registering family) ─────────────────────────────
  if (details.person2) {
    fillSecondPerson(form, details.person2);
  }

  // Signature date deliberately left blank — the user signs and dates on
  // the day they hand it in.

  const filled = await pdf.save();
  // Wrap in a real ArrayBuffer to satisfy Blob's BlobPart type across TS
  // environments (some setups treat Uint8Array<ArrayBufferLike> awkwardly).
  const blob = new Blob([filled.buffer as ArrayBuffer], {
    type: 'application/pdf',
  });
  return URL.createObjectURL(blob);
}

function fillSecondPerson(
  form: ReturnType<PDFDocument['getForm']>,
  p: SecondPerson,
): void {
  const setText = (name: string, value: string | null | undefined) => {
    if (!value) return;
    try {
      form.getTextField(name).setText(value);
    } catch {
      /* skip */
    }
  };
  const selectDropdown = (name: string, value: string) => {
    if (!value) return;
    try {
      form.getDropdown(name).select(value);
    } catch {
      /* skip */
    }
  };

  const p2Names = splitFirstNames(p.firstName);
  selectDropdown(
    'antragsteller.familienmitglied_2',
    RELATIONSHIP_OPTION[p.relationship],
  );
  setText('antragsteller.familienname_2', p.familyName);
  setText('antragsteller.gebname_2', p.birthName);
  setText('antragsteller.rufname_2', p2Names.ruf);
  setText('antragsteller.vorname_2', p2Names.weitere);
  setText('antragsteller.gebort_2', p.birthCity);
  setText('antragsteller.gebland_2', p.birthCountry);
  setText('antragsteller.gebdatum_2', toGermanDate(p.dateOfBirth));
  setText('antragsteller.geschlecht_2', SEX_CODE[p.sex]);
  setText('antragsteller.staatsang_2', p.nationality);
  setText(
    'antragsteller.religion_2',
    religionValue(p.religion, p.otherReligion),
  );
  selectDropdown(
    'antragsteller.familienstand_2',
    MARITAL_OPTION[p.maritalStatus],
  );
  selectDropdown('amtragsteller.dokumentenart_2', p.documentType);
  setText('antragsteller.seriennr_2', p.documentSerial);
  setText('antragsteller.ausstbehoerde_2', p.documentIssuingAuthority);
  setText('antragsteller.dokdatum_2', toGermanDate(p.documentIssueDate));
  setText('antragsteller.dokgueltig_2', toGermanDate(p.documentExpiryDate));
}

// Re-export for the form to use defaults / dropdown values.
export const DOCUMENT_TYPES: DocumentType[] = [
  'Reisepass',
  'Personalausweis',
  'Kinderreisepass',
];
