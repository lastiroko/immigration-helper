import { KUNDENZENTREN } from './state';
import type { KundenzentrumName } from './state';

export type Kundenzentrum = {
  name: KundenzentrumName;
  address: string;
  postalCode: string;
  district: string;
  /** Maps query for "Open in Maps" links — the address itself, URL-encoded. */
  mapsQuery: string;
};

const RAW: Omit<Kundenzentrum, 'mapsQuery'>[] = [
  { name: 'Chorweiler',   address: 'Pariser Platz 1',          postalCode: '50765', district: 'Chorweiler' },
  { name: 'Ehrenfeld',    address: 'Venloer Straße 419-421',   postalCode: '50825', district: 'Ehrenfeld' },
  { name: 'Innenstadt',   address: 'Laurenzplatz 1-3',         postalCode: '50667', district: 'Innenstadt' },
  { name: 'Kalk',         address: 'Kalker Hauptstraße 247-273', postalCode: '51103', district: 'Kalk' },
  { name: 'Lindenthal',   address: 'Aachener Straße 220',      postalCode: '50931', district: 'Lindenthal' },
  { name: 'Mülheim',      address: 'Wiener Platz 2a',          postalCode: '51065', district: 'Mülheim' },
  { name: 'Nippes',       address: 'Neusser Straße 450',       postalCode: '50733', district: 'Nippes' },
  { name: 'Porz',         address: 'Friedrich-Ebert-Ufer 64-70', postalCode: '51143', district: 'Porz' },
  { name: 'Rodenkirchen', address: 'Hauptstraße 85',           postalCode: '50996', district: 'Rodenkirchen' },
];

export const KUNDENZENTREN_DETAILS: readonly Kundenzentrum[] = RAW.map((k) => ({
  ...k,
  mapsQuery: encodeURIComponent(
    `Kundenzentrum ${k.name}, ${k.address}, ${k.postalCode} Köln`,
  ),
}));

export function getKundenzentrum(name: string): Kundenzentrum | undefined {
  return KUNDENZENTREN_DETAILS.find((k) => k.name === name);
}

// Re-export for convenience.
export { KUNDENZENTREN };
