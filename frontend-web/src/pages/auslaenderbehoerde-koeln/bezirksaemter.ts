// Köln's 9 Bezirksausländerämter — postal-code-routed (verified
// 2026-05-11 via stadt-koeln.de/service/adressen/00097..00105).

export type Bezirksamt = {
  name: string;
  /** Value used in the form's `zustaendiges.auslaenderamt` dropdown. */
  formValue: string;
  street: string;
  postalCode: string;
  postalCodesServed: string[];
  /** Built lazily into a Google Maps query. */
  mapsQuery: string;
};

const RAW: Omit<Bezirksamt, 'mapsQuery'>[] = [
  {
    name: 'Innenstadt',
    formValue: 'Bezirksausländeramt Innenstadt',
    street: 'Ludwigstraße 8',
    postalCode: '50667',
    postalCodesServed: ['50667', '50668', '50670', '50672', '50674', '50676', '50677', '50678', '50679'],
  },
  {
    name: 'Rodenkirchen',
    formValue: 'Bezirksausländeramt Rodenkirchen',
    street: 'Mannesmannstr. 10',
    postalCode: '50996',
    postalCodesServed: ['50968', '50696', '50996', '50997', '50998', '50999'],
  },
  {
    name: 'Ehrenfeld',
    formValue: 'Bezirksausländeramt Ehrenfeld',
    street: 'Venloer Straße 419-421',
    postalCode: '50825',
    postalCodesServed: ['50823', '50825', '50827', '50829'],
  },
  {
    name: 'Mülheim',
    formValue: 'Bezirksausländeramt Mülheim',
    street: 'Wiener Platz 2a',
    postalCode: '51065',
    postalCodesServed: ['51061', '51063', '51065', '51067', '51069'],
  },
  {
    name: 'Chorweiler',
    formValue: 'Bezirksausländeramt Chorweiler',
    street: 'Pariser Platz 1',
    postalCode: '50765',
    postalCodesServed: ['50765', '50767', '50769'],
  },
  {
    name: 'Porz',
    formValue: 'Bezirksausländeramt Porz',
    street: 'Alfred-Moritz-Platz 1',
    postalCode: '51143',
    postalCodesServed: ['51143', '51145', '51147', '51149'],
  },
  {
    name: 'Lindenthal',
    formValue: 'Bezirksausländeramt Lindenthal',
    street: 'Aachener Straße 220',
    postalCode: '50931',
    postalCodesServed: ['50858', '50859', '50931', '50933', '50935', '50937', '50939'],
  },
  {
    name: 'Nippes',
    formValue: 'Bezirksausländeramt Nippes',
    street: 'Neusser Straße 450',
    postalCode: '50733',
    postalCodesServed: ['50733', '50735', '50737', '50739'],
  },
  {
    name: 'Kalk',
    formValue: 'Bezirksausländeramt Kalk',
    street: 'Dillenburger Str. 56-66',
    postalCode: '51105',
    postalCodesServed: ['51103', '51105', '51107', '51109'],
  },
];

export const BEZIRKSAEMTER: readonly Bezirksamt[] = RAW.map((b) => ({
  ...b,
  mapsQuery: encodeURIComponent(
    `Bezirksausländeramt ${b.name}, ${b.street}, ${b.postalCode} Köln`,
  ),
}));

/**
 * Look up the responsible Bezirksamt for a Köln postal code.
 * Returns null if no match (out-of-area address, invalid PLZ, etc.).
 */
export function bezirksamtForPostalCode(plz: string): Bezirksamt | null {
  const trimmed = plz.trim();
  if (!/^\d{5}$/.test(trimmed)) return null;
  return BEZIRKSAEMTER.find((b) => b.postalCodesServed.includes(trimmed)) ?? null;
}

export function getBezirksamt(name: string): Bezirksamt | undefined {
  return BEZIRKSAEMTER.find((b) => b.name === name);
}

/**
 * Mülheim re-routing note (verified 2026-05-11): "Due to staffing
 * shortages, applications from Mülheim residents are no longer being
 * processed at the Mülheim location since January 1, 2026." Where
 * they're routed instead is not yet documented on stadt-koeln.de;
 * Screen 6 surfaces a yellow banner for affected users.
 */
export function isMuelheim(b: Bezirksamt | null): boolean {
  return b?.name === 'Mülheim';
}

// Booking calendar for district offices — issuance + extension.
// (Ukraine-specific calendars exist separately; not used for v1.)
export const BOOKING_URL =
  'https://termine.stadt-koeln.de/m/Auslaenderamt/extern/calendar/?uid=a8035e3c-9559-4ac6-b328-59c3d5cc7113';

// Köln Bürgertelefon — fallback contact when per-district phone numbers
// aren't yet known.
export const BUERGERTELEFON = '0221/221-0';
