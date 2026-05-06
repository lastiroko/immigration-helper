# Helfa — Project Status

> Living snapshot. Update at the end of each work session. Read this file first when onboarding a new Claude session — it tells you where we are *now*. Spec and design docs live in `docs/`; architecture in `ARCHITECTURE.md`.

**Last updated:** 2026-05-07

---

## Current focus (read this first)

**v1 is one flow: Anmeldung in Köln, in English. Everything else is parked.**

- Authoritative spec: [`docs/specs/anmeldung-koeln-v1-spec.md`](docs/specs/anmeldung-koeln-v1-spec.md)
- Pivot date: 2026-05-06
- Surface: standalone page at `/anmeldung-koeln`, no login required for the first half
- Booking model: assisted (slot-watcher + deep-link), not on-behalf-of
- Ship gate: a stranger on Reddit recommends it without being asked

The previously-built Helfa modules (auth, journeys, tasks, marketplace, offices, vault, billing) **stay deployed** but are not the focus. Do not refactor them. The Köln page shares the deployment but not the data model — one new endpoint (slot watcher cron + email) and one new table (`slot_watchers`).

**Pre-pivot work was archived** to branch `archive/pre-koeln-pivot` (commit `5553b03`) — the Helfa-branded redesign across all pages plus the prior STATUS.md. Cherry-pick from there if the broader scope resumes.

### Immediate next step

Verify the six factual claims the spec depends on (walk-in days, Wohnungsgeberbestätigung PDF URL, booking system URL, anti-bot behavior, Anmeldeformular version, non-EU quirks). If any fact is wrong, amend the spec before writing screens.

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

```
41930bf Legal pages (Imprint/Privacy/Terms) + mobile app scaffold
0cbf63e Frontend: rip out CRM screens, build Helfa onboarding/tasks/marketplace
3818a7f Phase 5 deployment-dependent items: HSTS header + Stripe runbook
1c07634 Seed marketplace with 10 MVP partners (Fintiba, Feather, Wunderflats, …)
3c7a755 Drop BuildKit cache mounts from Dockerfile for Railway compatibility
```

`archive/pre-koeln-pivot` adds one snapshot commit (`5553b03`) on top of `41930bf`.
