# Helfa — Project Status

> Living snapshot. Update at the end of each work session. Read this file first when onboarding a new Claude session — it tells you where we are *now*. Spec and design docs live in `docs/`; architecture in `ARCHITECTURE.md`.

**Last updated:** 2026-05-11
**Status:** Anmeldung Köln v1 **shipped** — spec at v1.3, all 12 screens live at `/anmeldung-koeln` with form-fill of the official Köln Anmeldeformular.

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

Real-user testing per spec criterion #1 ("a friend who has never been to Germany can do Anmeldung using only the page"). Beyond that, the most natural follow-on flow is the **residence permit at the Ausländerbehörde** for non-EU users — already a parking-lot link on Screen 8. (One outstanding manual check from v1.0 — confirming walk-in is currently active by calling 0221/221-0 — is still on the founder, not blocking.)

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
85f239f feat(form-fill): split firstName into Rufname + weitere Vornamen
1307faf fix(anmeldung-koeln): always show all previous-address fields
2b7f1b9 feat(anmeldung-koeln): build /anmeldung-koeln flow per spec v1.3
3250ba6 chore: add Bangladesh Freelancer ID design references
ac85d2c docs(spec): bump Anmeldung Köln spec to v1.3
68ac838 docs(status): surface Anmeldung Köln spec v1.2 readiness
b8dee44 docs(spec): bump Anmeldung Köln spec to v1.2
db497bf fix(frontend): production-aware API URL fallback so preview deploys work
ef0da6d fix(backend): allow Vercel + PATCH in CORS so production login/register works
05966f7 fix: repo-root vercel.json with explicit cd into frontend-web
```

`archive/pre-koeln-pivot` adds one snapshot commit (`5553b03`) on top of `41930bf`.
