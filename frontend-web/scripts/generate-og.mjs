// One-shot: convert scripts/og-image.svg to public/og-image.png at
// 1200×630. Run with `node scripts/generate-og.mjs` whenever the SVG
// is edited. Not part of the build — the PNG is committed.
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const here = dirname(fileURLToPath(import.meta.url));
const svgPath = join(here, 'og-image.svg');
const outPath = join(here, '..', 'public', 'og-image.png');

const svg = readFileSync(svgPath);
await sharp(svg)
  .resize(1200, 630, { fit: 'cover' })
  .png({ quality: 90, compressionLevel: 9 })
  .toFile(outPath);

console.log(`Wrote ${outPath}`);
