import { describe, it, expect } from 'vitest';
import { buildIcs, googleCalendarUrl, type CalendarEvent } from './calendar';

const sampleEvent: CalendarEvent = {
  uid: 'helfa-steuerid-2026-05-25@anmeldung.helfa.app',
  date: '2026-05-25',
  title: 'Steuer-ID arrives by post',
  description: 'Brown envelope from Bundeszentralamt für Steuern.',
};

describe('googleCalendarUrl', () => {
  it('builds an all-day Google Calendar deep link', () => {
    const url = googleCalendarUrl(sampleEvent);
    expect(url).toContain('https://calendar.google.com/calendar/render');
    expect(url).toContain('action=TEMPLATE');
    expect(url).toContain('dates=20260525%2F20260526');
    expect(url).toContain('text=Steuer-ID');
  });

  it('URL-encodes title and description', () => {
    const url = googleCalendarUrl({
      ...sampleEvent,
      title: 'Pay GEZ — €18.36',
      description: 'Set up SEPA at rundfunkbeitrag.de',
    });
    // — and € should be URL-encoded in the title param
    expect(url).toContain('text=Pay+GEZ+%E2%80%94+%E2%82%AC18.36');
    expect(url).toContain('details=Set+up+SEPA+at+rundfunkbeitrag.de');
  });
});

describe('buildIcs', () => {
  it('produces a syntactically valid VCALENDAR with one event', () => {
    const ics = buildIcs([sampleEvent], 'Test Cal');
    expect(ics).toMatch(/^BEGIN:VCALENDAR/);
    expect(ics).toMatch(/END:VCALENDAR$/);
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain(`UID:${sampleEvent.uid}`);
  });

  it('uses CRLF line endings (RFC 5545)', () => {
    const ics = buildIcs([sampleEvent], 'Test Cal');
    expect(ics.split('\r\n').length).toBeGreaterThan(5);
    // No bare \n outside the CRLF pairs
    expect(ics.replace(/\r\n/g, '')).not.toContain('\n');
  });

  it('formats DTSTART/DTEND as VALUE=DATE for all-day events', () => {
    const ics = buildIcs([sampleEvent], 'Test Cal');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260525');
    expect(ics).toContain('DTEND;VALUE=DATE:20260526');
  });

  it('escapes commas, semicolons, and newlines per RFC 5545', () => {
    const ics = buildIcs(
      [
        {
          ...sampleEvent,
          title: 'A, B; C',
          description: 'line1\nline2',
        },
      ],
      'Test',
    );
    expect(ics).toContain('SUMMARY:A\\, B\\; C');
    expect(ics).toContain('DESCRIPTION:line1\\nline2');
  });

  it('handles month/year rollover when computing DTEND', () => {
    const newYearsEve: CalendarEvent = {
      uid: 'rollover@test',
      date: '2026-12-31',
      title: 'Rollover',
      description: '',
    };
    const ics = buildIcs([newYearsEve], 'Test');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261231');
    expect(ics).toContain('DTEND;VALUE=DATE:20270101');
  });

  it('emits multiple events in order', () => {
    const events: CalendarEvent[] = [
      { uid: 'a@test', date: '2026-01-01', title: 'First', description: '' },
      { uid: 'b@test', date: '2026-02-01', title: 'Second', description: '' },
    ];
    const ics = buildIcs(events, 'Multi');
    const firstIdx = ics.indexOf('UID:a@test');
    const secondIdx = ics.indexOf('UID:b@test');
    expect(firstIdx).toBeGreaterThan(-1);
    expect(secondIdx).toBeGreaterThan(firstIdx);
  });
});
