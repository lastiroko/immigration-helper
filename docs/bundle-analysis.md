# Bundle analysis — Helfa frontend

**Tooling:** `rollup-plugin-visualizer` writes `frontend-web/dist/stats.html` on every `npm run build`. Open that file locally in a browser for the interactive treemap (gzip + brotli sizes). Set `ANALYZE_BUNDLE=true npm run build` to auto-open.

**Last measured:** 2026-05-11 (after both flows shipped + lazy-load + Vercel Analytics)

## Initial load (what every visitor pays)

| Asset | Raw | Gzip | Brotli |
|---|---:|---:|---:|
| `index.html` | 2.35 KB | 0.81 KB | – |
| `assets/index-*.css` | 42.06 KB | 8.29 KB | – |
| `assets/index-*.js` | 476.38 KB | 139.27 KB | ~120 KB |

**Initial JS = ~139 KB gzipped.** Down 53% from pre-lazy-load (~297 KB gz).

## Lazy chunks (loaded on demand)

| Trigger | Chunk | Raw | Gzip |
|---|---|---:|---:|
| Click "Generate my filled form" on Screen 4 / Screen 5 | `assets/es-*.js` (pdf-lib) | 428.30 KB | 178.33 KB |

Total app weight if a user reaches form-fill: ~317 KB gzipped. Most never click Generate; they ship at 139 KB.

## Top contributors to the initial bundle

Roughly (from the treemap):

- React 19 + react-dom — ~45 KB gz
- react-router-dom 7 — ~12 KB gz
- @vercel/analytics — ~2 KB gz
- @stripe/* (only used on legacy pages) — ~15 KB gz
- axios — ~6 KB gz
- Helfa app code (both flows) — ~50 KB gz
- Tailwind utility CSS — ~8 KB gz

## Low-hanging fruit

1. **`@stripe/react-stripe-js` + `@stripe/stripe-js`** ship in the initial bundle even though Stripe is only used by the pre-pivot billing flow at `/dashboard-legacy`, `/marketplace`, etc. — none of which are reachable from `/`, `/anmeldung-koeln`, or `/auslaenderbehoerde-koeln`. Lazy-loading the pre-pivot routes could shave ~15 KB gz off the initial load. Trade-off: pre-pivot pages get a small load delay. Net win for the Köln traffic.

2. **`axios`** is used by the pre-pivot CRM services (auth, etc.) but pulled in by routes that never run for Köln users. Same lazy-load opportunity as #1.

3. **The pre-pivot pages themselves** (Dashboard, Tasks, Marketplace, etc.) sit in the main chunk. Code-splitting them with `React.lazy()` + `<Suspense>` would push them out of the initial bundle. Estimated savings: ~10 KB gz.

## What we deliberately keep in the initial chunk

- **pdf-lib is already lazy** (the 428 KB / 178 KB gz `es-*.js` chunk above). No further action.
- **React + react-dom** can't realistically be split out — they're needed before anything else paints.
- **Tailwind utility CSS** is small after purge (8 KB gz).

## Future moves

If a Köln user lands on `/` and reads it for 30 seconds before clicking through, even a 300 KB gz initial budget is fine. The 53% reduction was the meaningful win. The pre-pivot lazy-load is opportunistic — recommend doing it only if Lighthouse scores reveal a real LCP problem.
