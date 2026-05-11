import { describe, it, expect } from 'vitest';
import {
  BEZIRKSAEMTER,
  bezirksamtForPostalCode,
  getBezirksamt,
  isMuelheim,
} from './bezirksaemter';

describe('bezirksamtForPostalCode', () => {
  it('returns null for empty or malformed input', () => {
    expect(bezirksamtForPostalCode('')).toBeNull();
    expect(bezirksamtForPostalCode('abc')).toBeNull();
    expect(bezirksamtForPostalCode('1234')).toBeNull(); // 4 digits
    expect(bezirksamtForPostalCode('123456')).toBeNull(); // 6 digits
    expect(bezirksamtForPostalCode('  ')).toBeNull();
  });

  it('returns null for a non-Köln postal code', () => {
    expect(bezirksamtForPostalCode('10115')).toBeNull(); // Berlin
    expect(bezirksamtForPostalCode('80331')).toBeNull(); // München
  });

  it('routes Innenstadt PLZs to Innenstadt', () => {
    for (const plz of ['50667', '50668', '50670', '50672', '50674', '50676', '50677', '50678', '50679']) {
      expect(bezirksamtForPostalCode(plz)?.name).toBe('Innenstadt');
    }
  });

  it('routes Ehrenfeld PLZs to Ehrenfeld', () => {
    for (const plz of ['50823', '50825', '50827', '50829']) {
      expect(bezirksamtForPostalCode(plz)?.name).toBe('Ehrenfeld');
    }
  });

  it('routes Kalk PLZs to Kalk', () => {
    for (const plz of ['51103', '51105', '51107', '51109']) {
      expect(bezirksamtForPostalCode(plz)?.name).toBe('Kalk');
    }
  });

  it('routes a Mülheim PLZ to Mülheim', () => {
    expect(bezirksamtForPostalCode('51065')?.name).toBe('Mülheim');
  });

  it('trims whitespace before matching', () => {
    expect(bezirksamtForPostalCode('  50678  ')?.name).toBe('Innenstadt');
  });

  it('returns the bezirksamt with all data fields populated', () => {
    const b = bezirksamtForPostalCode('50678');
    expect(b).not.toBeNull();
    expect(b!.name).toBe('Innenstadt');
    expect(b!.street).toContain('Ludwigstraße');
    expect(b!.postalCode).toBe('50667');
    expect(b!.formValue).toBe('Bezirksausländeramt Innenstadt');
    expect(b!.mapsQuery).toContain('Innenstadt');
    expect(b!.postalCodesServed).toContain('50678');
  });
});

describe('BEZIRKSAEMTER constant', () => {
  it('lists exactly 9 offices', () => {
    expect(BEZIRKSAEMTER).toHaveLength(9);
  });

  it('every office has a non-empty form dropdown value', () => {
    for (const b of BEZIRKSAEMTER) {
      expect(b.formValue.length).toBeGreaterThan(0);
      expect(b.formValue.startsWith('Bezirksausländeramt')).toBe(true);
    }
  });

  it('no postal code is served by two offices (PLZ partitioning)', () => {
    const seen = new Map<string, string>();
    for (const b of BEZIRKSAEMTER) {
      for (const plz of b.postalCodesServed) {
        const prior = seen.get(plz);
        expect(
          prior,
          `PLZ ${plz} is in both ${prior} and ${b.name}`,
        ).toBeUndefined();
        seen.set(plz, b.name);
      }
    }
  });
});

describe('getBezirksamt', () => {
  it('finds an office by display name', () => {
    expect(getBezirksamt('Innenstadt')?.formValue).toBe(
      'Bezirksausländeramt Innenstadt',
    );
    expect(getBezirksamt('Mülheim')?.postalCode).toBe('51065');
  });

  it('returns undefined for unknown names', () => {
    expect(getBezirksamt('Berlin')).toBeUndefined();
    expect(getBezirksamt('')).toBeUndefined();
  });
});

describe('isMuelheim', () => {
  it('returns true only for the Mülheim office', () => {
    const muel = getBezirksamt('Mülheim')!;
    const inn = getBezirksamt('Innenstadt')!;
    expect(isMuelheim(muel)).toBe(true);
    expect(isMuelheim(inn)).toBe(false);
    expect(isMuelheim(null)).toBe(false);
  });
});
