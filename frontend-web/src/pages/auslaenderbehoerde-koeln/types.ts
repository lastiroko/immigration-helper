export type ScreenId =
  | 'landing'        // Screen 0
  | 'eu'             // Screen 1 (non-EU gate)
  | 'purpose'        // Screen 2 (student / worker / other)
  | 'anmeldung'      // Screen 3 (Anmeldung-done? — auto-skip via cross-flow read)
  | 'visaCountdown'  // Screen 4
  | 'documents'      // Screen 5
  | 'booking'        // Screen 6 (PLZ-routed to one of 9 Bezirksausländerämter)
  | 'companion'      // Screen 7
  | 'whatsNext';     // Screen 8

export type Purpose = 'student' | 'worker' | 'other' | '';

export type AuslaenderbehoerdeState = {
  schemaVersion: 1;
  // Intent flags
  started: boolean;
  documentsConfirmed: boolean;
  // Data fields
  isNonEU: boolean | null;
  purpose: Purpose;
  anmeldungDone: boolean | null;
  visaExpires: string | null; // ISO date
  documentsChecked: {
    passport: boolean;
    photo: boolean;
    meldebescheinigung: boolean;
    insurance: boolean;
    mietvertrag: boolean;
    antragsformular: boolean;
    // student-only
    immatrikulation: boolean;
    finanzierung: boolean;
    // worker-only — TODO: verify exact set before v1.0 lock
    arbeitsvertrag: boolean;
    beschaeftigungserklaerung: boolean;
    bildungsabschluss: boolean;
    gehaltsnachweis: boolean;
  };
  appointment: { date: string; time: string; bezirksamt: string } | null;
  fiktionsbescheinigungObtainedAt: string | null;
  permitExpires: string | null;
};

export const initialState: AuslaenderbehoerdeState = {
  schemaVersion: 1,
  started: false,
  documentsConfirmed: false,
  isNonEU: null,
  purpose: '',
  anmeldungDone: null,
  visaExpires: null,
  documentsChecked: {
    passport: false,
    photo: false,
    meldebescheinigung: false,
    insurance: false,
    mietvertrag: false,
    antragsformular: false,
    immatrikulation: false,
    finanzierung: false,
    arbeitsvertrag: false,
    beschaeftigungserklaerung: false,
    bildungsabschluss: false,
    gehaltsnachweis: false,
  },
  appointment: null,
  fiktionsbescheinigungObtainedAt: null,
  permitExpires: null,
};

export type FlowApi = {
  state: AuslaenderbehoerdeState;
  update: (patch: Partial<AuslaenderbehoerdeState>) => void;
  updateDocuments: (
    patch: Partial<AuslaenderbehoerdeState['documentsChecked']>,
  ) => void;
  reset: () => void;
};
