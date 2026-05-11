export type ScreenId =
  | 'landing'      // Screen 0
  | 'eid'          // Screen 1
  | 'origin'       // Screen 1.5
  | 'residence'    // Screen 2
  | 'moveInDate'   // Screen 3
  | 'documents'    // Screen 4
  | 'pickPath'     // Screen 5
  | 'walkIn'       // Screen 6A
  | 'booked'       // Screen 6B
  | 'companion'    // Screen 7
  | 'rejection'    // Screen 7b
  | 'whatsNext';   // Screen 8

export type AnmeldungState = {
  schemaVersion: 1;
  // Intent flags — capture user actions that aren't otherwise represented in
  // a data field (Start clicked, document gate cleared, walked in, sent home).
  // The current screen is derived from these + the data fields, never stored.
  started: boolean;
  documentsConfirmed: boolean;
  wentToAppointment: boolean;
  wasSentHome: boolean;
  // Data fields — answers to specific screen questions.
  hasEID: boolean | null;
  originIsAbroad: boolean | null;
  hasAddress: 'yes' | 'no' | 'hotel' | null;
  moveInDate: string | null;
  isNonEU: boolean | null;
  isRegisteringFamily: boolean;
  documentsChecked: {
    passport: boolean;
    wohnungsgeber: boolean;
    anmeldeformular: boolean;
    visa: boolean;
    marriage: boolean;
    birth: boolean;
  };
  appointmentPath: 'walkin' | 'booked' | null;
  appointment: { date: string; time: string; kundenzentrum: string } | null;
  /** Day-0 anchor for Screen 8's timeline. ISO date or null. */
  meldebescheinigungObtainedAt: string | null;
  /** Personal details for the Anmeldeformular fill. */
  personalDetails: PersonalDetails | null;
};

export type DocumentType =
  | 'Reisepass'
  | 'Personalausweis'
  | 'Kinderreisepass'
  | '';

export type ResidenceType = 'alleinige' | 'haupt' | 'neben' | '';

export type Sex = 'female' | 'male' | 'diverse' | '';
export type MaritalStatus =
  | 'single'
  | 'married'
  | 'divorced'
  | 'widowed'
  | '';
export type Religion =
  | 'none'
  | 'catholic'
  | 'protestant'
  | 'jewish'
  | 'other'
  | '';
export type Relationship =
  | 'spouse'
  | 'childBoth'
  | 'childMother'
  | 'childFather'
  | '';

export type SecondPerson = {
  relationship: Relationship;
  firstName: string;
  familyName: string;
  birthName: string;
  dateOfBirth: string; // ISO YYYY-MM-DD
  birthCity: string;
  birthCountry: string;
  sex: Sex;
  nationality: string;
  maritalStatus: MaritalStatus;
  religion: Religion;
  otherReligion: string;
  documentType: DocumentType;
  documentSerial: string;
  documentIssuingAuthority: string;
  documentIssueDate: string; // ISO
  documentExpiryDate: string; // ISO
};

export type PersonalDetails = {
  // Person 1 — basics
  firstName: string;
  familyName: string;
  birthName: string;
  dateOfBirth: string; // ISO YYYY-MM-DD
  birthCity: string;
  birthCountry: string;
  sex: Sex;
  nationality: string;
  maritalStatus: MaritalStatus;
  religion: Religion;
  otherReligion: string;
  // Person 1 — ID document
  documentType: DocumentType;
  documentSerial: string;
  documentIssuingAuthority: string;
  documentIssueDate: string; // ISO
  documentExpiryDate: string; // ISO
  // Previous address (Bisherige Wohnung)
  prevStreet: string;
  prevCity: string;
  prevPostalCode: string; // for in-Germany moves
  prevBundesland: string; // for in-Germany moves
  prevKreis: string; // district/county for in-Germany moves
  prevCountry: string; // empty if previous address was in Germany
  moveOutDate: string; // ISO; when you left the previous address — typically required for in-Germany moves
  // New Köln address (Neue Wohnung)
  koelnStreet: string;
  koelnPostalCode: string;
  koelnOrtsteil: string; // optional district name
  // Wohnungsgeber (landlord)
  landlordName: string;
  landlordStreet: string;
  landlordPostalCode: string;
  landlordCity: string;
  // Residence type radios — new home and (optionally) old home
  residenceTypeNew: ResidenceType; // default 'haupt'
  residenceTypeOld: ResidenceType; // skipped if no German previous home
  keepingOldResidence: 'yes' | 'no' | ''; // default 'no'
  keepingOldAs: 'haupt' | 'neben' | ''; // only if keepingOldResidence === 'yes'
  hasOtherDEHomes: 'yes' | 'no' | ''; // default 'no'
  // Marriage info — relevant only if maritalStatus === 'married'
  marriageDate: string; // ISO
  marriagePlace: string;
  marriageCountry: string;
  marriageRegistryNumber: string;
  // Second person — only filled if isRegisteringFamily is on
  person2: SecondPerson | null;
};

export const emptySecondPerson: SecondPerson = {
  relationship: '',
  firstName: '',
  familyName: '',
  birthName: '',
  dateOfBirth: '',
  birthCity: '',
  birthCountry: '',
  sex: '',
  nationality: '',
  maritalStatus: '',
  religion: '',
  otherReligion: '',
  documentType: '',
  documentSerial: '',
  documentIssuingAuthority: '',
  documentIssueDate: '',
  documentExpiryDate: '',
};

export const emptyPersonalDetails: PersonalDetails = {
  firstName: '',
  familyName: '',
  birthName: '',
  dateOfBirth: '',
  birthCity: '',
  birthCountry: '',
  sex: '',
  nationality: '',
  maritalStatus: '',
  religion: '',
  otherReligion: '',
  documentType: '',
  documentSerial: '',
  documentIssuingAuthority: '',
  documentIssueDate: '',
  documentExpiryDate: '',
  prevStreet: '',
  prevCity: '',
  prevPostalCode: '',
  prevBundesland: '',
  prevKreis: '',
  prevCountry: '',
  moveOutDate: '',
  koelnStreet: '',
  koelnPostalCode: '',
  koelnOrtsteil: '',
  landlordName: '',
  landlordStreet: '',
  landlordPostalCode: '',
  landlordCity: '',
  residenceTypeNew: 'haupt', // sensible default — most newcomers' main home
  residenceTypeOld: '',
  keepingOldResidence: 'no', // sensible default
  keepingOldAs: '',
  hasOtherDEHomes: 'no', // sensible default
  marriageDate: '',
  marriagePlace: '',
  marriageCountry: '',
  marriageRegistryNumber: '',
  person2: null,
};

export const initialState: AnmeldungState = {
  schemaVersion: 1,
  started: false,
  documentsConfirmed: false,
  wentToAppointment: false,
  wasSentHome: false,
  hasEID: null,
  originIsAbroad: null,
  hasAddress: null,
  moveInDate: null,
  isNonEU: null,
  isRegisteringFamily: false,
  documentsChecked: {
    passport: false,
    wohnungsgeber: false,
    anmeldeformular: false,
    visa: false,
    marriage: false,
    birth: false,
  },
  appointmentPath: null,
  appointment: null,
  meldebescheinigungObtainedAt: null,
  personalDetails: null,
};

export type FlowApi = {
  state: AnmeldungState;
  update: (patch: Partial<AnmeldungState>) => void;
  updateDocuments: (
    patch: Partial<AnmeldungState['documentsChecked']>,
  ) => void;
  reset: () => void;
};
