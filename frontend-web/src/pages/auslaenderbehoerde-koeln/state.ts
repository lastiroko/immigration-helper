import type { AuslaenderbehoerdeState, ScreenId } from './types';
import { initialState } from './types';

export const STORAGE_KEY = 'helfa.auslaenderbehoerde-koeln.state';

// Cross-flow read: the Anmeldung sub-product writes to this key. We peek
// at it on Screen 3 to auto-skip the "Anmeldung done?" question for
// users who finished Anmeldung in the same browser.
const ANMELDUNG_STORAGE_KEY = 'helfa.anmeldung-koeln.state';

export function loadState(): AuslaenderbehoerdeState {
  if (typeof window === 'undefined') return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<AuslaenderbehoerdeState>;
    if (parsed.schemaVersion !== 1) return initialState;
    return {
      ...initialState,
      ...parsed,
      schemaVersion: 1,
      documentsChecked: {
        ...initialState.documentsChecked,
        ...(parsed.documentsChecked ?? {}),
      },
    };
  } catch {
    return initialState;
  }
}

export function saveState(state: AuslaenderbehoerdeState): void {
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

/**
 * Cross-flow continuity helper. Returns true if the Anmeldung sub-product
 * has recorded a Meldebescheinigung obtained-date. Used by Screen 3 to
 * pre-skip the "have you done Anmeldung?" question.
 */
export function isAnmeldungComplete(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(ANMELDUNG_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { meldebescheinigungObtainedAt?: string | null };
    return !!parsed.meldebescheinigungObtainedAt;
  } catch {
    return false;
  }
}

/**
 * Single source of truth: the current screen is a pure function of the
 * data + intent fields. Same pattern as Anmeldung's deriveScreen.
 */
export function deriveScreen(s: AuslaenderbehoerdeState): ScreenId {
  if (s.fiktionsbescheinigungObtainedAt !== null) return 'whatsNext';
  if (s.appointment !== null) return 'companion';
  if (s.documentsConfirmed) return 'booking';
  if (s.visaExpires !== null) return 'documents';
  if (s.anmeldungDone === true) return 'visaCountdown';
  if (s.anmeldungDone === false) return 'anmeldung'; // off-ramp content
  if (s.purpose === 'other') return 'purpose'; // soft-exit content
  if (s.purpose === 'student' || s.purpose === 'worker') return 'anmeldung';
  if (s.isNonEU === false) return 'eu'; // clean-exit content for EU
  if (s.isNonEU === true) return 'purpose';
  if (s.started) return 'eu';
  return 'landing';
}

// The 9 Bezirksausländerämter — same district names as Anmeldung's
// Kundenzentren, almost certainly the same buildings + separate
// departments. Postal-code routing per Köln district. Addresses
// remain TODO until v1.0 spec verification.
export const BEZIRKSAUSLAENDERAEMTER = [
  'Innenstadt',
  'Rodenkirchen',
  'Lindenthal',
  'Ehrenfeld',
  'Nippes',
  'Chorweiler',
  'Porz',
  'Kalk',
  'Mülheim',
] as const;

export type BezirksamtName = (typeof BEZIRKSAUSLAENDERAEMTER)[number];
