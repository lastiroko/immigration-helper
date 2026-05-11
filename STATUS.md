# Helfa — Project Status

> Living snapshot. Update at the end of each work session. Read this file first when onboarding a new Claude session — it tells you where we are *now*. Spec and design docs live in `docs/`; architecture in `ARCHITECTURE.md`.

**Last updated:** 2026-05-11 (evening session 2)
**Status:** **Both sub-products shipped.** `/anmeldung-koeln` v1.3 + `/auslaenderbehoerde-koeln` v1.0. Public landing at `/`. Cross-flow continuity wired. 82 unit tests. Vercel Analytics + ErrorBoundary in place. Ready for friend-test + Reddit launch.

---

## Current focus (read this first)

> *Built so well a stranger on Reddit recommends it without being asked.*

**v1 is one flow: Anmeldung in Köln, in English. Everything else is parked.**

- Authoritative spec: [`docs/specs/anmeldung-koeln-v1-spec.md`](docs/specs/anmeldung-koeln-v1-spec.md)
- Pivot date: 2026-05-06
- Surface: standalone page at `/anmeldung-koeln`, no login required for the first half
- Booking model: assisted (we walk users through Köln's own system), not on-behalf-of

The previously-built Helfa modules (auth, journeys, tasks, marketplace, offices, vault, billing) **stay deployed** but are not the focus. Do not refactor them. The Köln page shares the deployment but not the data model — zero new backend endpoints, no new tables, no new migrations. It's a frontend-only build with `localStorage` for in-flight state.

**Pre-pivot work was archived** to branch `archive/pre-koeln-pivot` (commit `5553b03`) — the Helfa-branded redesign across all pages plus the prior STATUS.md. Cherry-pick from there if the broader scope resumes.

### What shipped (2026-05-11, v1.3)

All 12 screens implemented at `/anmeldung-koeln` (public route, no auth, all state in `localStorage` under `helfa.anmeldung-koeln.state`):

| Screen | Function |
|---|---|
| 0 | Landing — Anton hero + chip facts + dark-green CTA |
| 1 | eID fork (with gov.de exit branch) |
| 1.5 | Origin fork (Anmeldung vs Ummeldung vocabulary) |
| 2 | Residence question (with housing off-ramp branch) |
| 3 | Move-in date (3 conditional copies for on-time / future / overdue) |
| 4 | Document checklist with gated CTA + family toggle + **Anmeldeformular form-fill** |
| 5 | Pick path (walk-in vs booked) |
| 6A | Walk-in plan (Kundenzentrum picker, day-aware copy) |
| 6B | Booked plan (paste-to-parse confirmation + manual fallback) |
| 7 | Companion (full-screen phrase overlay via portal) |
| 7b | Rejection branch (3 reasons, 3 fixes, rebook loop) |
| 8 | Timeline + .ics download |

The Anmeldeformular form-fill on Screen 4 fetches the live PDF from `formular-server.de` and overlays text/dropdowns/radios via `pdf-lib`. Covers all 73 AcroForm fields we have user data for, including a Person 2 section for spouse/family registration.

State machine is data-derived (no `state.screen`) — single source of truth. ScreenRouter `useMemo`s `deriveScreen(state)` on each render.

### Immediate next step

**Founder tasks:**

1. **Friend-test of `/anmeldung-koeln`** — operating manual at `docs/usability-test-checklist.md`. Spec criterion #1.
2. **Reddit launch post** — draft at `docs/launch/reddit-draft.md`. Read, edit, post to r/cologne first.
3. **Smoke-check the residence-permit form-fill** — `C:/Users/phili/Downloads/smoke-residence-permit.pdf` was dropped in your Downloads. Open and verify a sample Maria Smith / TechCorp worker permit landed in the right boxes on Köln's 33-F07.

### Evening session 2 summary (2026-05-11, commits `a6e9f44..2527467`)

**Track 1 — Ausländerbehörde Köln to v1.0:**
- Verified all v0.2 spec TODOs via web-search + WebFetch. Locked the spec at v1.0.
- Built `bezirksaemter.ts` with full PLZ → office mapping for all 9 districts.
- Built `formFill.ts` for form 33-F07_ErstAntBefAuf (130 AcroForm fields) — pre-selects the right Bezirksamt dropdown, pre-fills basics from Anmeldung's cross-flow `localStorage`, collects worker/student-specific extras via `AntragsformularPanel`.
- Real UI for Screens 5, 6, 7, 8 (the prior scaffolds). Cross-flow continuity now meaningful: PLZ auto-routes to the right Bezirksamt on Screen 6; Screen 5's form-fill reuses Anmeldung's personal details.
- 37 new unit tests (PLZ mapping with partition invariant, parser, deriveScreen) — total 82.

**Track 2 — Launch polish:**
- Public landing at `/` — replaces the auth-wall redirect. Links to both sub-products + the existing legal pages.
- Vercel Analytics — cookieless, mounted next to the router.
- ErrorBoundary at the app root — friendly Restart instead of white-page crashes.
- LoadingFallback component available for future Suspense use.

**Track 3 — Docs:**
- ARCHITECTURE.md gained a new top section for the two Köln sub-products (state-machine pattern, single-source-of-truth derivation, form-fill, cross-flow continuity, testing). Pre-pivot CRM section preserved.
- CONTRIBUTING.md is new — quick start, mental model, how-to-add-a-screen, spec → impl pattern, conventions, what NOT to do.
- .env.example expanded with a header explaining what each var is for and which routes use it.

**Verified manually:**
- 82/82 tests pass
- `tsc -b` clean
- `npm run build` clean
- Smoke PDF generated at 310 KB (Köln's 33-F07 form template + ~25 filled fields)

---

## Live environments

| | URL | Notes |
|---|---|---|
| Production frontend | https://immigration-helper-taupe.vercel.app | Vercel, free tier |
| Backend API | https://immigration-helper-production.up.railway.app/api/v1 | Railway, Spring Boot 3.2 |
| Vercel dashboard | https://vercel.com/lastirokos-projects/immigration-helper | |
| Repo root | this folder | branch: `main` |

---

## What's built (historical — not the current focus)

These shipped before the 2026-05-06 narrowing and remain deployed. They are not being extended or refactored as part of v1. Treat them as the chassis the Köln page sits on top of.

### Backend (Spring Boot 3.2)
- 15 Flyway migrations (V1–V15).
- Modules: auth (JWT), users/profile, onboarding (6-step flow), journeys + tasks (status state machine), marketplace (vetted partners), offices (Bürgeramt etc.), vault (encrypted document storage), billing (Stripe), webhooks (partners + Stripe).
- Deployed on Railway (Postgres + app), HSTS enabled.

### Frontend web (Vite + React 19 + Tailwind v4)
- Helfa-branded redesign (dark forest green + lime, Anton/Inter, theme tokens in `src/index.css`) — **archived on `archive/pre-koeln-pivot`, not currently on main**.
- Pages on main today are the pre-redesign versions. The Köln page will be built fresh as `/anmeldung-koeln`.

### Mobile
- `frontend-mobile/` (RN/Expo scaffold) and `mobile-android/` (native Android) exist but are dormant for v1.

### Docs
- `docs/specs/anmeldung-koeln-v1-spec.md` — **current v1 spec**
- `docs/Helfa_MigrationPlan_v1.docx` — historical 5-phase pivot plan (phases 1–5 shipped)
- `docs/Helfa_PRD_v1.docx`, `Requirements`, `DomainAPI`, `UseCases`, `Wireframes`, `UserJourneyFlowcharts`, `TestPlan` — multi-city/multi-topic vision, now superseded by the Köln-only spec for v1
- `ARCHITECTURE.md` (in repo root)

---

## Parked roadmap

These were the post-launch hardening items as of 2026-05-01. **All parked for v1** — revisit only after Köln ships and we see whether it earns its audience. Items in *italics* are explicitly out of scope per the new spec.

- [parked] End-to-end auth smoke test
- [parked] Frontend error states / retry / offline UX (Helfa pages)
- [parked] *Real partner content + logos for marketplace*
- [parked] *Mobile theme parity* (`frontend-mobile/` and `mobile-android/`)
- [parked] Observability: structured logs, Railway alerts, Sentry on frontend
- [parked] CI: build-on-PR + lint + test workflows
- [parked] Security pass: JWT rotation, rate limits on `/auth/*`, OWASP top-10 review
- [parked] Performance: landing TTI, Lighthouse, lazy-load
- [parked] Email verification on signup
- [parked] Vercel preview env var (`VITE_API_URL` for branch deploys)

---

## How to onboard a new Claude session

**Claude Code (this directory):**
1. Read `STATUS.md` (you're here).
2. Read `docs/specs/anmeldung-koeln-v1-spec.md` — that is what we're building.
3. `git log --oneline -10` for recent commits.
4. `git branch -a` — note the `archive/pre-koeln-pivot` branch holds pre-pivot work.
5. Start dev server only when actually building Köln screens: `cd frontend-web && npm run dev`.

**Claude.ai web:**
- Best: upload `STATUS.md` + `docs/specs/anmeldung-koeln-v1-spec.md` to a project. Re-upload `STATUS.md` after major sessions.
- Lazy: paste `STATUS.md` as the first message of any new chat.

---

## Recent commit history

*Auto-pasted from `git log --oneline -10`; not hand-maintained. Refresh when updating STATUS.md. (The commit that updates this section will not appear in it — that's the bootstrap.)*

```
2527467 docs: ARCHITECTURE.md update + CONTRIBUTING.md + .env.example expansion
871c562 feat(launch): public root landing + Vercel Analytics + ErrorBoundary
5b4b596 test(auslaenderbehoerde-koeln): 37 unit tests for new pure functions
7d99181 feat(auslaenderbehoerde-koeln): fill scaffold with real UI per v1.0 spec
a6e9f44 docs(spec): lock Ausländerbehörde Köln spec at v1.0
74a86ae docs(status): overnight session summary + next-step retarget
40cc60c feat(auslaenderbehoerde-koeln): scaffold residence permit flow
bf71533 docs: Reddit launch post draft
18ba6b0 docs: add 'Sub-products' section to README
dd930a7 ci: add GitHub Actions workflow for frontend gate
a91ba49 feat(seo): add robots.txt + sitemap.xml
60bb93a feat(seo): OG + Twitter meta + brand favicon
78c8edc test: add Vitest + 45 unit tests for pure functions
d55f2bc perf(form-fill): lazy-load pdf-lib on first Generate click
bec80e2 docs(spec): bump residence permit spec to v0.2 (verified facts pass)
```

`archive/pre-koeln-pivot` adds one snapshot commit (`5553b03`) on top of `41930bf`.
