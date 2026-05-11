// Client-side calendar helpers — no library, no backend.
// Generates Google Calendar deep links and a single .ics file with multiple
// all-day events for Screen 8's reminder timeline.

export type CalendarEvent = {
  uid: string;
  date: string; // ISO YYYY-MM-DD (all-day)
  title: string;
  description: string;
};

/** Build a Google Calendar "Add event" deep link for a single all-day event. */
export function googleCalendarUrl(event: CalendarEvent): string {
  const stripped = event.date.replace(/-/g, '');
  const next = nextDayStripped(event.date);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${stripped}/${next}`,
    details: event.description,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Build a multi-event .ics file body. CRLF line endings per RFC 5545. */
export function buildIcs(events: CalendarEvent[], calendarName: string): string {
  const dtstamp = icsTimestamp(new Date());
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//Helfa//${calendarName}//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcs(calendarName)}`,
  ];
  for (const e of events) {
    const stripped = e.date.replace(/-/g, '');
    const next = nextDayStripped(e.date);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${stripped}`,
      `DTEND;VALUE=DATE:${next}`,
      `SUMMARY:${escapeIcs(e.title)}`,
      `DESCRIPTION:${escapeIcs(e.description)}`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/** Trigger a browser download of an .ics file. */
export function downloadIcs(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ──────────────────────────────────────────────────────────────────────────

function nextDayStripped(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
}

function icsTimestamp(d: Date): string {
  // YYYYMMDDTHHMMSSZ
  return (
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  ).replace(/Z+$/, 'Z');
}

function escapeIcs(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}
