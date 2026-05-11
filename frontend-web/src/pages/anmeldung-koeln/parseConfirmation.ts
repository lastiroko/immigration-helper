import { KUNDENZENTREN } from './state';

export type ParsedConfirmation = {
  date: string | null; // ISO YYYY-MM-DD
  time: string | null; // HH:MM (24-hour)
  kundenzentrum: string | null;
};

const GERMAN_MONTHS =
  'januar februar märz april mai juni juli august september oktober november dezember'.split(' ');

/**
 * Best-effort parse of a Köln Bürgeramt confirmation email body.
 * Recognises:
 *   - numeric DD.MM.YYYY (and DD.MM.YY → 20YY)
 *   - German textual "20. Mai 2026"
 *   - HH:MM (24-hour, optionally followed by " Uhr")
 *   - HH Uhr (no minutes — assume :00)
 *   - any of the 9 Kundenzentrum names by substring
 */
export function parseConfirmation(text: string): ParsedConfirmation {
  const lower = text.toLowerCase();

  // ── Date ────────────────────────────────────────────────────────────
  let date: string | null = null;

  // DD.MM.YYYY
  const numeric4 = text.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
  if (numeric4) {
    date = `${numeric4[3]}-${numeric4[2].padStart(2, '0')}-${numeric4[1].padStart(2, '0')}`;
  } else {
    // DD.MM.YY (short year — assume 20YY)
    const numeric2 = text.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{2})\b/);
    if (numeric2) {
      const year = 2000 + parseInt(numeric2[3], 10);
      date = `${year}-${numeric2[2].padStart(2, '0')}-${numeric2[1].padStart(2, '0')}`;
    } else {
      // German textual: "20. Mai 2026"
      const monthsAlt = GERMAN_MONTHS.join('|');
      const textual = lower.match(
        new RegExp(`(\\d{1,2})\\.\\s*(${monthsAlt})\\s*(\\d{4})`),
      );
      if (textual) {
        const m = GERMAN_MONTHS.indexOf(textual[2]) + 1;
        date = `${textual[3]}-${String(m).padStart(2, '0')}-${textual[1].padStart(2, '0')}`;
      }
    }
  }

  // ── Time ────────────────────────────────────────────────────────────
  let time: string | null = null;

  // HH:MM (24-hour)
  const colonTime = text.match(/(\d{1,2}):(\d{2})/);
  if (colonTime) {
    time = `${colonTime[1].padStart(2, '0')}:${colonTime[2]}`;
  } else {
    // "HH Uhr" with no minutes — assume :00
    const uhrTime = lower.match(/\b(\d{1,2})\s*uhr\b/);
    if (uhrTime) {
      time = `${uhrTime[1].padStart(2, '0')}:00`;
    }
  }

  // ── Kundenzentrum ──────────────────────────────────────────────────
  const kz =
    KUNDENZENTREN.find((n) => lower.includes(n.toLowerCase())) ?? null;

  return { date, time, kundenzentrum: kz };
}
