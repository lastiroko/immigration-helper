import { describe, it, expect } from 'vitest';
import { parseConfirmation } from './parseConfirmation';

describe('Auslaenderbehoerde parseConfirmation', () => {
  it('parses a typical German numeric confirmation', () => {
    const text =
      'Sehr geehrte/r ..., hiermit bestätigen wir Ihren Termin am 20.05.2026 um 09:30 Uhr im Bezirksausländeramt Innenstadt.';
    expect(parseConfirmation(text)).toEqual({
      date: '2026-05-20',
      time: '09:30',
      bezirksamt: 'Innenstadt',
    });
  });

  it('parses German textual month names', () => {
    const text =
      'Termin am 20. Mai 2026 um 14:00 Uhr im Bezirksausländeramt Ehrenfeld.';
    expect(parseConfirmation(text)).toEqual({
      date: '2026-05-20',
      time: '14:00',
      bezirksamt: 'Ehrenfeld',
    });
  });

  it('handles single-digit dates and times', () => {
    const text = 'Termin am 1.6.2026 um 9:05 Uhr im Bezirksausländeramt Kalk.';
    expect(parseConfirmation(text)).toEqual({
      date: '2026-06-01',
      time: '09:05',
      bezirksamt: 'Kalk',
    });
  });

  it('matches Bezirksamt names case-insensitively', () => {
    const text =
      'Termin: 15.07.2026, 14:00, bezirksausländeramt nippes.';
    expect(parseConfirmation(text).bezirksamt).toBe('Nippes');
  });

  it('matches umlauts correctly (Mülheim)', () => {
    const text = 'Termin am 01.06.2026 um 10:00 im Bezirksausländeramt Mülheim.';
    expect(parseConfirmation(text).bezirksamt).toBe('Mülheim');
  });

  it('returns null bezirksamt when no name appears', () => {
    const text = 'Termin am 20.05.2026 um 09:30 im Rathaus XYZ.';
    expect(parseConfirmation(text).bezirksamt).toBeNull();
  });

  it('returns null date when no date appears', () => {
    expect(parseConfirmation('appointment at 09:30, Innenstadt')).toEqual({
      date: null,
      time: '09:30',
      bezirksamt: 'Innenstadt',
    });
  });

  it('returns all nulls for empty input', () => {
    expect(parseConfirmation('')).toEqual({
      date: null,
      time: null,
      bezirksamt: null,
    });
  });

  it('parses "10 Uhr" with no colon (assumes :00)', () => {
    const text = 'Termin am 20.05.2026 um 10 Uhr im Bezirksausländeramt Innenstadt.';
    expect(parseConfirmation(text)).toEqual({
      date: '2026-05-20',
      time: '10:00',
      bezirksamt: 'Innenstadt',
    });
  });

  it('parses 2-digit year DD.MM.YY → 20YY', () => {
    const text = 'Termin am 15.06.26 um 09:30 im Bezirksausländeramt Kalk.';
    expect(parseConfirmation(text).date).toBe('2026-06-15');
  });

  it('preserves all 9 Bezirksamt names', () => {
    const names = [
      'Chorweiler',
      'Ehrenfeld',
      'Innenstadt',
      'Kalk',
      'Lindenthal',
      'Mülheim',
      'Nippes',
      'Porz',
      'Rodenkirchen',
    ];
    for (const n of names) {
      const text = `Termin am 20.05.2026 um 09:30 Uhr im Bezirksausländeramt ${n}.`;
      expect(parseConfirmation(text).bezirksamt).toBe(n);
    }
  });
});
