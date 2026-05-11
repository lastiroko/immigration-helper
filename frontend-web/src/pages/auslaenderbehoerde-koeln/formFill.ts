import type { ResidencePermitDetails, Purpose } from './types';

// CORS-open PDF template — verified via HEAD request 2026-05-11.
const PDF_URL =
  'https://formular-server.de/Koeln_FS/getform/33-F07_ErstAntBefAuf_send_html_HTML/011-001/33-F07_ErstantragErteilung_befristetenAufenthaltstitels-V10_Vorl-1.12.pdf';

// Anmeldung's personalDetails shape, narrowed to what we read across
// flows. We don't import the type directly to keep the two sub-products
// loosely coupled — if Anmeldung's shape changes, this just degrades
// gracefully (missing fields stay blank on the PDF).
export type AnmeldungSnapshot = {
  firstName?: string;
  familyName?: string;
  birthName?: string;
  dateOfBirth?: string; // ISO
  birthCity?: string;
  birthCountry?: string;
  sex?: 'female' | 'male' | 'diverse' | '';
  nationality?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | '';
  koelnStreet?: string;
  koelnPostalCode?: string;
  // Document section
  documentType?: 'Reisepass' | 'Personalausweis' | 'Kinderreisepass' | '';
  documentSerial?: string;
  documentIssueDate?: string; // ISO
  documentExpiryDate?: string; // ISO
};

export function readAnmeldungSnapshot(): AnmeldungSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('helfa.anmeldung-koeln.state');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { personalDetails?: AnmeldungSnapshot };
    return parsed.personalDetails ?? null;
  } catch {
    return null;
  }
}

const SEX_CODE: Record<Required<AnmeldungSnapshot>['sex'], string> = {
  female: 'w',
  male: 'm',
  diverse: 'd',
  '': '',
};

// Form's familienstand radio uses different codes than Anmeldung's text
// dropdown — map here.
const MARITAL_RADIO: Record<Required<AnmeldungSnapshot>['maritalStatus'], string> = {
  single: 'ledig',
  married: 'ehe',
  divorced: 'geschieden',
  widowed: 'witwet',
  '': '',
};

const PURPOSE_RADIO: Record<Exclude<Purpose, '' | 'other'>, string> = {
  student: 'studium',
  worker: 'job',
};

const PAPIERE_RADIO: Record<Required<AnmeldungSnapshot>['documentType'], string> = {
  Reisepass: 'pass',
  Personalausweis: 'idc',
  Kinderreisepass: 'sonstiges',
  '': '',
};

function toGermanDate(iso: string | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

function todayGerman(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

export type FillContext = {
  details: ResidencePermitDetails;
  anmeldung: AnmeldungSnapshot | null;
  purpose: Exclude<Purpose, '' | 'other'>;
  visaExpires: string | null; // ISO
  bezirksamtFormValue: string; // matches the form dropdown option
};

export async function fillResidencePermitForm(ctx: FillContext): Promise<string> {
  const { details, anmeldung, purpose, visaExpires, bezirksamtFormValue } = ctx;

  // Same lazy import as Anmeldung's form-fill.
  const [{ PDFDocument }, res] = await Promise.all([
    import('pdf-lib'),
    fetch(PDF_URL),
  ]);
  if (!res.ok) throw new Error(`fetch-failed-${res.status}`);
  const bytes = await res.arrayBuffer();
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const form = pdf.getForm();

  const setText = (name: string, value: string | null | undefined) => {
    if (!value) return;
    try {
      form.getTextField(name).setText(value);
    } catch {
      /* missing or wrong type — skip silently */
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
  const selectRadio = (name: string, value: string) => {
    if (!value) return;
    try {
      form.getRadioGroup(name).select(value);
    } catch {
      /* skip */
    }
  };

  // ── Office routing (pre-fill the dropdown so the user doesn't have to
  //    pick the right office on paper).
  selectDropdown('zustaendiges.auslaenderamt', bezirksamtFormValue);

  // ── Applicant basics (from Anmeldung cross-flow if available).
  if (anmeldung) {
    setText('antragsteller.familienname', anmeldung.familyName);
    setText('antragsteller.geburtsname', anmeldung.birthName);
    setText('antragsteller.vorname', anmeldung.firstName);
    setText('antragsteller.staatsangehoerigkeit', anmeldung.nationality);
    setText('antragsteller.geburtsdatum', toGermanDate(anmeldung.dateOfBirth));
    setText('antragsteller.geburtsort',
      [anmeldung.birthCity, anmeldung.birthCountry].filter(Boolean).join(', '));
    setText('antragsteller.strasse_hausnr', anmeldung.koelnStreet);
    setText('antragsteller.postleitzahl', anmeldung.koelnPostalCode);
    setText('antragsteller.ort', anmeldung.koelnPostalCode ? 'Köln' : '');
    selectRadio('geschlecht', SEX_CODE[anmeldung.sex ?? '']);
    selectRadio('familienstand', MARITAL_RADIO[anmeldung.maritalStatus ?? '']);
    selectRadio('papiere', PAPIERE_RADIO[anmeldung.documentType ?? '']);
    setText('papier.seriennummer', anmeldung.documentSerial);
    setText('papier.gueltig_von', toGermanDate(anmeldung.documentIssueDate));
    setText('papier.gueltig_bis', toGermanDate(anmeldung.documentExpiryDate));
    setText('papier.staat', anmeldung.nationality);
  }

  // ── New residence-permit-only fields.
  setText('antragsteller.koerpergroesse', details.height);
  setText('antragsteller.augenfarbe', details.eyeColor);
  setText('antragsteller.telefon', details.phone);
  setText('antragsteller.emailadresse', details.email);
  setText('antragsteller.mobil', details.phone); // form has both; fine to mirror

  // ── Purpose of stay.
  selectRadio('aufenthaltszweck', PURPOSE_RADIO[purpose]);

  // ── Visa info.
  if (visaExpires) {
    setText('papier.gueltig_bis', toGermanDate(visaExpires));
  }

  // ── Worker-specific.
  if (purpose === 'worker') {
    selectRadio('job', 'Beschaeftigung');
    setText('beruf.ausgeuebt', details.employer.jobTitle);
    setText('firma.name', details.employer.name);
    // Form has separate Chef-name + Chef-vorname; we collect a single
    // bossName from the user, split on first space.
    const bossParts = details.employer.bossName.trim().split(' ');
    setText('firma.chefvorname', bossParts[0] ?? '');
    setText('firma.chefname', bossParts.slice(1).join(' '));
    setText('firma.strasse', details.employer.street);
    setText('firma.postleitzahl', details.employer.postalCode);
    setText('firma.ort', details.employer.city);
    setText('firma.telefon', details.employer.phone);
    setText('firma.emailadresse', details.employer.email);
    if (details.monthlyIncomeGross) {
      selectRadio('einkunft', 'job');
      setText('einkuenfte.hoehe', details.monthlyIncomeGross);
      setText('einkuenfte.art', 'monatlich brutto');
    }
  }

  // ── Student-specific.
  if (purpose === 'student') {
    selectRadio('job', 'Ausbildung'); // closest match for studies
    setText('hochschule.fach', details.studyField);
    setText('hochschule.internet', details.studyWebsite);
    setText('firma.name', details.university);
  }

  // ── Insurance.
  if (details.insuranceProvider) {
    selectRadio('krankenversicherung', 'ja');
    setText('kv.traeger', details.insuranceProvider);
  }

  // ── Disclosures (yes/no questions).
  if (details.speaksGerman !== null) {
    selectRadio('sprache', details.speaksGerman ? 'ja' : 'nein');
  }
  if (details.hasCriminalRecord !== null) {
    selectRadio('vorstrafen', details.hasCriminalRecord ? 'Deutschland' : 'nein');
  }
  if (details.hasOpenInvestigation !== null) {
    selectRadio(
      'ermittlungsverfahren',
      details.hasOpenInvestigation ? 'ja' : 'nein',
    );
  }
  if (details.hasBeenDeported !== null) {
    selectRadio('abschiebung', details.hasBeenDeported ? 'ja' : 'nein');
  }

  // ── Signature date (form dates itself; user signs on the day).
  setText('antragsteller.ort_datum', `Köln, ${todayGerman()}`);

  const filled = await pdf.save();
  const blob = new Blob([filled.buffer as ArrayBuffer], {
    type: 'application/pdf',
  });
  return URL.createObjectURL(blob);
}

// Exported helpers for unit tests.
export const _internals = {
  SEX_CODE,
  MARITAL_RADIO,
  PURPOSE_RADIO,
  PAPIERE_RADIO,
  toGermanDate,
};
