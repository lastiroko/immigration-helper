import type { AnmeldungState, ScreenId } from './types';
import { initialState, emptyPersonalDetails } from './types';

export const STORAGE_KEY = 'helfa.anmeldung-koeln.state';

export function loadState(): AnmeldungState {
  if (typeof window === 'undefined') return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<AnmeldungState>;
    if (parsed.schemaVersion !== 1) return initialState;
    // Detect pre-v1.3 PersonalDetails shape (had placeOfBirth /
    // previousAddress / koelnAddress as flat fields). Drop it so the user
    // re-enters into the new structured form, but keep journey progress.
    let personalDetails = parsed.personalDetails ?? null;
    if (
      personalDetails &&
      ('placeOfBirth' in personalDetails ||
        'previousAddress' in personalDetails ||
        'koelnAddress' in personalDetails)
    ) {
      personalDetails = null;
    } else if (personalDetails) {
      // Merge with the current shape so any fields added in later patches
      // get sensible defaults instead of being undefined at use sites.
      personalDetails = { ...emptyPersonalDetails, ...personalDetails };
    }
    return {
      ...initialState,
      ...parsed,
      schemaVersion: 1,
      documentsChecked: {
        ...initialState.documentsChecked,
        ...(parsed.documentsChecked ?? {}),
      },
      personalDetails,
    };
  } catch {
    return initialState;
  }
}

export function saveState(state: AnmeldungState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / disabled storage
  }
}

export function clearState(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

// Single source of truth: the current screen is a pure function of the data +
// intent fields. We never store screen — we derive it on every render. Order
// matters: most-advanced state wins.
export function deriveScreen(s: AnmeldungState): ScreenId {
  if (s.meldebescheinigungObtainedAt !== null) return 'whatsNext';
  if (s.wasSentHome) return 'rejection';
  if (s.appointmentPath === 'walkin' && s.wentToAppointment) return 'companion';
  if (s.appointmentPath === 'booked' && s.appointment !== null) return 'companion';
  if (s.appointmentPath === 'walkin') return 'walkIn';
  if (s.appointmentPath === 'booked') return 'booked';
  if (s.documentsConfirmed) return 'pickPath';
  if (s.moveInDate !== null) return 'documents';
  if (s.hasAddress === 'yes' || s.hasAddress === 'hotel') return 'moveInDate';
  if (s.hasAddress === 'no') return 'residence'; // off-ramp content
  if (s.originIsAbroad !== null) return 'residence';
  if (s.hasEID === false) return 'origin';
  if (s.hasEID === true) return 'eid'; // eID branch content (clean exit)
  if (s.started) return 'eid';
  return 'landing';
}

export const KUNDENZENTREN = [
  'Chorweiler',
  'Ehrenfeld',
  'Innenstadt',
  'Kalk',
  'Lindenthal',
  'Mülheim',
  'Nippes',
  'Porz',
  'Rodenkirchen',
] as const;

export type KundenzentrumName = (typeof KUNDENZENTREN)[number];
