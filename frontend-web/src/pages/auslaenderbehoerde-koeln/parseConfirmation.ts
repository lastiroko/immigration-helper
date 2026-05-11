import { BEZIRKSAEMTER } from './bezirksaemter';

export type ParsedConfirmation = {
  date: string | null;
  time: string | null;
  bezirksamt: string | null;
};

const GERMAN_MONTHS =
  'januar februar märz april mai juni juli august september oktober november dezember'.split(
    ' ',
  );

/**
 * Best-effort parse of a Köln Ausländeramt confirmation email body.
 * Matches against the 9 Bezirksamt names by substring; recognises
 * German numeric (DD.MM.YYYY) and textual ("20. Mai 2026") dates plus
 * HH:MM time. Same pattern as Anmeldung's parser, different vocabulary.
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

  const matched = BEZIRKSAEMTER.find((b) =>
    lower.includes(b.name.toLowerCase()),
  );
  const bezirksamt = matched?.name ?? null;

  return { date, time, bezirksamt };
}
