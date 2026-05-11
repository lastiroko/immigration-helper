import { describe, it, expect } from 'vitest';
import { deriveScreen } from './state';
import { initialState } from './types';
import type { AuslaenderbehoerdeState } from './types';

const make = (patch: Partial<AuslaenderbehoerdeState>): AuslaenderbehoerdeState => ({
  ...initialState,
  ...patch,
});

describe('Auslaenderbehoerde deriveScreen', () => {
  it('returns landing for an untouched state', () => {
    expect(deriveScreen(initialState)).toBe('landing');
  });

  it('routes to eu once Start is clicked', () => {
    expect(deriveScreen(make({ started: true }))).toBe('eu');
  });

  it('keeps user on eu when they are EU (clean-exit content)', () => {
    expect(deriveScreen(make({ started: true, isNonEU: false }))).toBe('eu');
  });

  it('routes to purpose after picking non-EU', () => {
    expect(deriveScreen(make({ started: true, isNonEU: true }))).toBe('purpose');
  });

  it('keeps user on purpose when "other" is picked (soft exit)', () => {
    expect(
      deriveScreen(make({ started: true, isNonEU: true, purpose: 'other' })),
    ).toBe('purpose');
  });

  it('routes to anmeldung after picking student', () => {
    expect(
      deriveScreen(make({ started: true, isNonEU: true, purpose: 'student' })),
    ).toBe('anmeldung');
  });

  it('routes to anmeldung after picking worker', () => {
    expect(
      deriveScreen(make({ started: true, isNonEU: true, purpose: 'worker' })),
    ).toBe('anmeldung');
  });

  it('stays on anmeldung when user says No (off-ramp)', () => {
    expect(
      deriveScreen(
        make({
          started: true,
          isNonEU: true,
          purpose: 'student',
          anmeldungDone: false,
        }),
      ),
    ).toBe('anmeldung');
  });

  it('routes to visaCountdown after Anmeldung is confirmed', () => {
    expect(
      deriveScreen(
        make({
          started: true,
          isNonEU: true,
          purpose: 'student',
          anmeldungDone: true,
        }),
      ),
    ).toBe('visaCountdown');
  });

  it('routes to documents after visa expiry is set', () => {
    expect(
      deriveScreen(
        make({
          started: true,
          isNonEU: true,
          purpose: 'student',
          anmeldungDone: true,
          visaExpires: '2026-08-15',
        }),
      ),
    ).toBe('documents');
  });

  it('routes to booking after documents are confirmed', () => {
    expect(
      deriveScreen(
        make({
          started: true,
          isNonEU: true,
          purpose: 'student',
          anmeldungDone: true,
          visaExpires: '2026-08-15',
          documentsConfirmed: true,
        }),
      ),
    ).toBe('booking');
  });

  it('routes to companion once an appointment is set', () => {
    expect(
      deriveScreen(
        make({
          started: true,
          isNonEU: true,
          purpose: 'student',
          anmeldungDone: true,
          visaExpires: '2026-08-15',
          documentsConfirmed: true,
          appointment: {
            date: '2026-06-15',
            time: '09:30',
            bezirksamt: 'Innenstadt',
          },
        }),
      ),
    ).toBe('companion');
  });

  it('routes to whatsNext after Fiktionsbescheinigung is obtained', () => {
    expect(
      deriveScreen(
        make({
          started: true,
          fiktionsbescheinigungObtainedAt: '2026-06-15',
        }),
      ),
    ).toBe('whatsNext');
  });

  it('whatsNext beats every earlier state (terminal)', () => {
    expect(
      deriveScreen(
        make({
          started: true,
          isNonEU: true,
          purpose: 'student',
          anmeldungDone: false, // would otherwise stay on anmeldung
          fiktionsbescheinigungObtainedAt: '2026-06-15',
        }),
      ),
    ).toBe('whatsNext');
  });
});
