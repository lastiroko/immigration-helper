import { describe, it, expect } from 'vitest';
import {
  splitFirstNames,
  religionValue,
  toGermanDate,
} from './formFill';

describe('splitFirstNames', () => {
  it('returns empty for empty input', () => {
    expect(splitFirstNames('')).toEqual({ ruf: '', weitere: '' });
    expect(splitFirstNames('   ')).toEqual({ ruf: '', weitere: '' });
  });

  it('returns whole input as ruf when single name', () => {
    expect(splitFirstNames('John')).toEqual({ ruf: 'John', weitere: '' });
  });

  it('splits two names on the first space', () => {
    expect(splitFirstNames('John Michael')).toEqual({
      ruf: 'John',
      weitere: 'Michael',
    });
  });

  it('handles three+ names — all extras into weitere', () => {
    expect(splitFirstNames('Maria Anna Katharina')).toEqual({
      ruf: 'Maria',
      weitere: 'Anna Katharina',
    });
  });

  it('preserves hyphenated names as a single Rufname', () => {
    expect(splitFirstNames('Anna-Maria Theresa')).toEqual({
      ruf: 'Anna-Maria',
      weitere: 'Theresa',
    });
  });

  it('trims surrounding whitespace', () => {
    expect(splitFirstNames('  John  Michael  ')).toEqual({
      ruf: 'John',
      weitere: 'Michael',
    });
  });
});

describe('religionValue', () => {
  it('maps known religions to single-letter codes', () => {
    expect(religionValue('none', '')).toBe('--');
    expect(religionValue('catholic', '')).toBe('rk');
    expect(religionValue('protestant', '')).toBe('ev');
    expect(religionValue('jewish', '')).toBe('jd');
  });

  it('returns the user-provided text for "other"', () => {
    expect(religionValue('other', 'Buddhist')).toBe('Buddhist');
    expect(religionValue('other', '')).toBe('');
  });

  it('returns empty string when no religion picked', () => {
    expect(religionValue('', 'ignored')).toBe('');
  });
});

describe('toGermanDate', () => {
  it('formats ISO YYYY-MM-DD as DD.MM.YYYY', () => {
    expect(toGermanDate('2026-05-11')).toBe('11.05.2026');
    expect(toGermanDate('1990-03-15')).toBe('15.03.1990');
  });

  it('preserves leading zeros from ISO format', () => {
    expect(toGermanDate('2026-01-09')).toBe('09.01.2026');
  });

  it('returns empty string for empty input', () => {
    expect(toGermanDate('')).toBe('');
  });

  it('returns input as-is when fewer than 3 dash-separated parts', () => {
    // The function only validates that all 3 parts exist (y, m, d). It
    // doesn't check they are numeric — in practice the input always comes
    // from <input type="date"> which guarantees ISO format.
    expect(toGermanDate('2026')).toBe('2026');
    expect(toGermanDate('2026-05')).toBe('2026-05');
  });
});
