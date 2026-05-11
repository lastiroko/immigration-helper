import { describe, it, expect } from 'vitest';
import { deriveScreen } from './state';
import { initialState } from './types';
import type { AnmeldungState } from './types';

const make = (patch: Partial<AnmeldungState>): AnmeldungState => ({
  ...initialState,
  ...patch,
});

describe('deriveScreen', () => {
  it('returns landing for an untouched state', () => {
    expect(deriveScreen(initialState)).toBe('landing');
  });

  it('returns eid once Start is clicked', () => {
    expect(deriveScreen(make({ started: true }))).toBe('eid');
  });

  it('keeps user on eid when they pick "yes" (eID branch)', () => {
    // hasEID === true → stay on eid showing the gov.de exit content
    expect(deriveScreen(make({ started: true, hasEID: true }))).toBe('eid');
  });

  it('routes to origin when eID === false', () => {
    expect(deriveScreen(make({ started: true, hasEID: false }))).toBe(
      'origin',
    );
  });

  it('routes to residence after origin is set', () => {
    expect(
      deriveScreen(
        make({ started: true, hasEID: false, originIsAbroad: true }),
      ),
    ).toBe('residence');
    expect(
      deriveScreen(
        make({ started: true, hasEID: false, originIsAbroad: false }),
      ),
    ).toBe('residence');
  });

  it('keeps user on residence when hasAddress === "no" (off-ramp)', () => {
    expect(
      deriveScreen(
        make({
          started: true,
          hasEID: false,
          originIsAbroad: true,
          hasAddress: 'no',
        }),
      ),
    ).toBe('residence');
  });

  it('routes to moveInDate after hasAddress === "yes"', () => {
    expect(
      deriveScreen(
        make({
          started: true,
          hasEID: false,
          originIsAbroad: true,
          hasAddress: 'yes',
        }),
      ),
    ).toBe('moveInDate');
  });

  it('routes to documents after moveInDate is set', () => {
    expect(
      deriveScreen(
        make({
          started: true,
          hasEID: false,
          originIsAbroad: true,
          hasAddress: 'yes',
          moveInDate: '2026-05-11',
        }),
      ),
    ).toBe('documents');
  });

  it('routes to pickPath after documents are confirmed', () => {
    expect(
      deriveScreen(
        make({
          started: true,
          hasEID: false,
          originIsAbroad: true,
          hasAddress: 'yes',
          moveInDate: '2026-05-11',
          documentsConfirmed: true,
        }),
      ),
    ).toBe('pickPath');
  });

  it('routes to walkIn when path = walkin and not yet went', () => {
    expect(
      deriveScreen(
        make({
          started: true,
          documentsConfirmed: true,
          appointmentPath: 'walkin',
        }),
      ),
    ).toBe('walkIn');
  });

  it('routes to booked when path = booked and no appointment yet', () => {
    expect(
      deriveScreen(
        make({
          started: true,
          documentsConfirmed: true,
          appointmentPath: 'booked',
        }),
      ),
    ).toBe('booked');
  });

  it('routes to companion when walk-in went happens', () => {
    expect(
      deriveScreen(
        make({
          started: true,
          documentsConfirmed: true,
          appointmentPath: 'walkin',
          wentToAppointment: true,
        }),
      ),
    ).toBe('companion');
  });

  it('routes to companion when booked appointment is set', () => {
    expect(
      deriveScreen(
        make({
          started: true,
          documentsConfirmed: true,
          appointmentPath: 'booked',
          appointment: {
            date: '2026-05-20',
            time: '09:30',
            kundenzentrum: 'Innenstadt',
          },
        }),
      ),
    ).toBe('companion');
  });

  it('routes to rejection when sent home — overrides companion', () => {
    expect(
      deriveScreen(
        make({
          started: true,
          documentsConfirmed: true,
          appointmentPath: 'walkin',
          wentToAppointment: true,
          wasSentHome: true,
        }),
      ),
    ).toBe('rejection');
  });

  it('routes to whatsNext when Meldebescheinigung obtained — final state', () => {
    expect(
      deriveScreen(
        make({
          started: true,
          documentsConfirmed: true,
          meldebescheinigungObtainedAt: '2026-05-20',
        }),
      ),
    ).toBe('whatsNext');
  });

  it('whatsNext beats rejection (the happy outcome wins last)', () => {
    expect(
      deriveScreen(
        make({
          started: true,
          documentsConfirmed: true,
          wasSentHome: true,
          meldebescheinigungObtainedAt: '2026-05-20',
        }),
      ),
    ).toBe('whatsNext');
  });
});
