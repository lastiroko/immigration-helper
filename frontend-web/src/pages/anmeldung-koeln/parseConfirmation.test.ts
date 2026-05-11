import { describe, it, expect } from 'vitest';
import { parseConfirmation } from './parseConfirmation';

describe('parseConfirmation', () => {
  it('parses a typical German numeric confirmation', () => {
    const text =
      'Sehr geehrte Frau Schmidt, hiermit bestätigen wir Ihren Termin am Mittwoch, dem 20.05.2026 um 09:30 Uhr im Kundenzentrum Innenstadt.';
    expect(parseConfirmation(text)).toEqual({
      date: '2026-05-20',
      time: '09:30',
      kundenzentrum: 'Innenstadt',
    });
  });

  it('parses German textual month names', () => {
    const text = 'Termin am 20. Mai 2026 um 09:30 Uhr im Kundenzentrum Mülheim.';
    expect(parseConfirmation(text)).toEqual({
      date: '2026-05-20',
      time: '09:30',
      kundenzentrum: 'Mülheim',
    });
  });

  it('handles single-digit dates and times', () => {
    const text = 'Termin am 1.6.2026 um 9:05 Uhr im Kundenzentrum Kalk.';
    expect(parseConfirmation(text)).toEqual({
      date: '2026-06-01',
      time: '09:05',
      kundenzentrum: 'Kalk',
    });
  });

  it('matches Kundenzentrum case-insensitively', () => {
    const text =
      'Termin: 15.07.2026, 14:00, kundenzentrum chorweiler.';
    expect(parseConfirmation(text).kundenzentrum).toBe('Chorweiler');
  });

  it('returns nulls for empty input', () => {
    expect(parseConfirmation('')).toEqual({
      date: null,
      time: null,
      kundenzentrum: null,
    });
  });

  it('returns null for unrecognized Kundenzentrum names', () => {
    const text = 'Termin am 20.05.2026 um 09:30 im Bürgeramt XYZ.';
    expect(parseConfirmation(text).kundenzentrum).toBeNull();
  });

  it('returns null date when no parseable date appears', () => {
    const text = 'Your appointment at 09:30 at Innenstadt.';
    const out = parseConfirmation(text);
    expect(out.date).toBeNull();
    expect(out.time).toBe('09:30');
    expect(out.kundenzentrum).toBe('Innenstadt');
  });

  it('parses "10 Uhr" with no colon (assumes :00)', () => {
    const text = 'Termin am 20.05.2026 um 10 Uhr im Kundenzentrum Innenstadt.';
    expect(parseConfirmation(text)).toEqual({
      date: '2026-05-20',
      time: '10:00',
      kundenzentrum: 'Innenstadt',
    });
  });

  it('parses 2-digit year DD.MM.YY → 20YY', () => {
    const text = 'Termin am 15.06.26 um 09:30 im Kundenzentrum Kalk.';
    expect(parseConfirmation(text)).toEqual({
      date: '2026-06-15',
      time: '09:30',
      kundenzentrum: 'Kalk',
    });
  });

  it('handles "HH:MM Uhr" (colon time + Uhr suffix)', () => {
    const text = 'Termin am 20.05.2026 um 14:30 Uhr im Kundenzentrum Ehrenfeld.';
    expect(parseConfirmation(text).time).toBe('14:30');
  });

  it('preserves all 9 Kundenzentrum names', () => {
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
      const text = `Termin am 20.05.2026 um 09:30 Uhr im Kundenzentrum ${n}.`;
      expect(parseConfirmation(text).kundenzentrum).toBe(n);
    }
  });
});
