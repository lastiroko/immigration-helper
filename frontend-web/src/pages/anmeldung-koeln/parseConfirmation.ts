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
 * Recognises numeric DD.MM.YYYY and German textual "20. Mai 2026" dates,
 * an HH:MM time, and any of the 9 Kundenzentrum names by substring.
 */
export function parseConfirmation(text: string): ParsedConfirmation {
  const lower = text.toLowerCase();

  let date: string | null = null;
  const numeric = text.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
  if (numeric) {
    date = `${numeric[3]}-${numeric[2].padStart(2, '0')}-${numeric[1].padStart(2, '0')}`;
  } else {
    const monthsAlt = GERMAN_MONTHS.join('|');
    const textual = lower.match(
      new RegExp(`(\\d{1,2})\\.\\s*(${monthsAlt})\\s*(\\d{4})`),
    );
    if (textual) {
      const m = GERMAN_MONTHS.indexOf(textual[2]) + 1;
      date = `${textual[3]}-${String(m).padStart(2, '0')}-${textual[1].padStart(2, '0')}`;
    }
  }

  const t = text.match(/(\d{1,2}):(\d{2})/);
  const time = t ? `${t[1].padStart(2, '0')}:${t[2]}` : null;

  const kz =
    KUNDENZENTREN.find((n) => lower.includes(n.toLowerCase())) ?? null;

  return { date, time, kundenzentrum: kz };
}
