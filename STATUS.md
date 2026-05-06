# Helfa — Project Status

> Living snapshot. Update at the end of each work session. Read this file first when onboarding a new Claude (Code or web) session — it tells you where we are *now*. Plan and design docs live in `docs/`; architecture in `ARCHITECTURE.md`.

**Last updated:** 2026-05-01

---

## Live environments

| | URL | Notes |
|---|---|---|
| Production frontend | https://immigration-helper-taupe.vercel.app | Vercel, free tier |
| Backend API | https://immigration-helper-production.up.railway.app/api/v1 | Railway, Spring Boot 3.2 |
| Vercel dashboard | https://vercel.com/lastirokos-projects/immigration-helper | |
| Repo root | this folder | branch: `main` |

---

## What's built

### Backend (Spring Boot 3.2)
- **Phase 5 complete.** 15 Flyway migrations (V1–V15).
- Modules: auth (JWT), users/profile, onboarding (6-step flow), journeys + tasks (status state machine), marketplace (vetted partners), offices (Bürgeramt etc.), vault (encrypted document storage), billing (Stripe), webhooks (partners + Stripe).
- Deployed on Railway (Postgres + app), HSTS enabled.

### Frontend web (Vite + React 19 + Tailwind v4)
- **Helfa branded redesign** — dark forest green + lime accent, Anton display font, Inter body. Theme tokens in `src/index.css` (`--color-helfa-*`).
- Pages: Landing (`/`, public), Login, Register, Dashboard, Onboarding (6 steps), Tasks, TaskDetail, Marketplace, Offices, Imprint/Privacy/Terms.
- Component utilities: `btn-pill-dark`, `btn-pill-lime`, `btn-pill-outline`, `surface-card`, `display-headline`, `badge-pill`.
- Build: 337 kB JS / 36.6 kB CSS gzipped. Deployed on Vercel.

### Mobile
- `frontend-mobile/` (RN/Expo scaffold) and `mobile-android/` (native Android) exist but **have not received the Helfa theme** yet.

### Docs available
- `docs/Helfa_MigrationPlan_v1.docx` — 5-phase pivot plan (we're at the end of phase 5)
- `docs/Helfa_PRD_v1.docx`, `Helfa_Requirements_v1.docx`, `Helfa_DomainAPI_v1.docx`
- `docs/Helfa_UserJourneyFlowcharts_v1.docx`, `Helfa_UseCases_v1.docx`, `Helfa_Wireframes_v1.docx`
- `docs/Helfa_TestPlan_v1.docx`
- `ARCHITECTURE.md` (in repo root)

---

## Today's session (2026-05-01)

1. Replaced the visa-CRM frontend look with a **Helfa-branded redesign** (dark green + lime palette, condensed display font). New `Landing.tsx` at `/`. Re-skinned every page. Routing updated so `/` is public landing and `/dashboard` is protected.
2. **Vercel deploy fixed** — old project link had a doubled root-dir path; re-linked from `frontend-web/` with Root Directory `./`.
3. **Vercel env vars** — set `VITE_API_URL` on production + development. Preview env still pending (CLI couldn't add for "all branches" without explicit flag — set via dashboard if branch deploys are needed).
4. **Backend CORS** — `SecurityConfig.java` now uses `setAllowedOriginPatterns` (required for wildcards with `allowCredentials=true`), added `https://*.vercel.app`, added `PATCH` method (was missing — would have broken task complete/postpone/profile patch).
5. Updated `index.html` title + theme-color meta.

---

## Open / pending

- [ ] **User: `vercel --prod`** from `frontend-web/` — promotes the current preview to the `*.taupe.vercel.app` alias, picks up `VITE_API_URL`.
- [ ] **User: commit + push backend** — `SecurityConfig.java` change is local only; Railway redeploys on push.
- [ ] **Vercel preview env var** — `VITE_API_URL` not yet set for preview branches. Add via Vercel dashboard if branch deploys are needed.
- [ ] **Mobile theme parity** — `frontend-mobile/` needs the same green/lime palette + Anton/Inter fonts.
- [ ] **Real partner content** — marketplace currently has 10 seeded MVP placeholders (Fintiba, Feather, Wunderflats, etc.) without logos.
- [ ] **Real office data** — offices seeded for Munich/Berlin/Stuttgart only.

---

## Roadmap (post-launch hardening)

Pick what's next; ordered by what unblocks the most.

1. **End-to-end auth smoke test** — register → onboard → see tasks. Run after backend redeploy. Script in `scripts/smoke-test.ps1` (added today).
2. **Frontend error states** — current pages show plain "Failed to load" strings. Add error boundaries, retry, offline UX.
3. **Real partner data + logos** — replace seeded MVPs with branded cards.
4. **Mobile parity** — port the Helfa theme to `frontend-mobile/` and `mobile-android/`.
5. **Observability** — structured JSON logs (already?), Railway health alerts, Sentry on the frontend.
6. **CI** — confirm `.github/` workflows exist, add build-on-PR + lint + test if missing.
7. **Security pass** — JWT rotation strategy, rate limits on `/auth/*` endpoints, manual OWASP top-10 review.
8. **Performance** — measure landing TTI, lighthouse score, lazy-load below-the-fold sections.
9. **Real onboarding signup** — currently anyone can register; add email verification.

---

## How to onboard a new Claude session

**Claude Code (this directory):**
1. Read `STATUS.md` (you're here).
2. Skim `ARCHITECTURE.md` for module layout.
3. `git log --oneline -10` for what changed recently.
4. If working on frontend: `cd frontend-web && npm run dev`.
5. If working on backend: check Railway dashboard for live state.

**Claude.ai web:**
- Best: create a "Helfa" project on claude.ai and upload `STATUS.md`, `ARCHITECTURE.md`, and `docs/Helfa_MigrationPlan_v1.docx` once. Re-upload `STATUS.md` after major sessions.
- Lazy: paste `STATUS.md` as the first message of any new chat.
- If GitHub-connector is enabled on your plan: just say "read STATUS.md and the latest commits."

---

## Recent commit history

```
41930bf Legal pages (Imprint/Privacy/Terms) + mobile app scaffold
0cbf63e Frontend: rip out CRM screens, build Helfa onboarding/tasks/marketplace
3818a7f Phase 5 deployment-dependent items: HSTS header + Stripe runbook
1c07634 Seed marketplace with 10 MVP partners (Fintiba, Feather, Wunderflats, …)
3c7a755 Drop BuildKit cache mounts from Dockerfile for Railway compatibility
```
