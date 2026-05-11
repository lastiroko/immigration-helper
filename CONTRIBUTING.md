# Contributing

Short guide to working on Helfa's Köln sub-products. If you're touching the pre-pivot CRM (Spring Boot side), see the deeper docs in `docs/` — those modules are in maintenance, not active development.

---

## Quick start

```bash
# from repo root
cd frontend-web
npm install
npm run dev
```

Open `http://localhost:5173`. The public landing is at `/`; the two sub-products at `/anmeldung-koeln` and `/auslaenderbehoerde-koeln`.

### Useful commands (all from `frontend-web/`)

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | tsc + Vite production build |
| `npm test` | One-shot vitest run (CI uses this) |
| `npm run test:watch` | Interactive vitest watcher |
| `npm run lint` | ESLint over the whole repo |
| `npm run preview` | Serve the production build locally |

### Environment variables

Frontend reads `VITE_API_URL` for legacy CRM API calls. Not needed for `/anmeldung-koeln` or `/auslaenderbehoerde-koeln` (they're backend-free). See `.env.example`.

---

## The mental model

The two Köln sub-products are **state-machine-driven flows**:

- One React entry per flow (`AnmeldungKoeln.tsx`, `AuslaenderbehoerdeKoeln.tsx`).
- One `<ScreenRouter>` per flow that derives the current screen from state on every render.
- One screen per file, each taking a single `flow` prop containing `state`, `update`, `reset`.
- All flow state in `localStorage` — no backend, no auth, no migrations.

**Never store `state.screen`.** The current screen is a pure function of the data + intent fields. Adding a stored screen would create two sources of truth that drift.

Full architecture writeup: `ARCHITECTURE.md`.

---

## Adding a new screen

For an existing sub-product:

1. Add a `ScreenId` to `<flow>/types.ts` (e.g., `'newScreen'`).
2. Add the corresponding state field(s) it depends on — a data field for an answer, or an intent flag (`somethingHappened: boolean`) if the transition isn't represented by a data field.
3. Add a clause to `<flow>/state.ts:deriveScreen()` — order matters, most-advanced state wins.
4. Create `<flow>/screens/ScreenN<Name>.tsx`. Take `{ flow: FlowApi }`. Use `<FlowShell>` (Anmeldung) or `<StubShell>` (Ausländerbehörde) for the chrome.
5. Wire it into `<flow>/ScreenRouter.tsx`.
6. Write a test for the new `deriveScreen` clause in `<flow>/state.test.ts`.

For a new sub-product (e.g., other cities), mirror the existing folder shape under `frontend-web/src/pages/<flow-name>/` and add a route in `src/App.tsx`.

---

## Spec → implementation pattern

Both shipped sub-products went through this loop:

1. Draft a `docs/specs/<flow-name>-v1-spec.md` with screens, state machine, verified facts (URLs + dates), and explicit "what we don't build" cuts.
2. Verify every fact against an official source — stadt-koeln.de, BAMF, AufenthG. List source URLs.
3. Lock the spec at v1.0 (or bump v1.x when patching).
4. Build screens against the locked spec.
5. Tests for new pure functions.

**Don't build ahead of the spec.** Spec lock means the implementer (you, future-you, or someone else) can rely on the facts without re-verifying. If a fact is uncertain, mark it TODO in the spec and don't ship the dependent UI.

---

## Conventions

### TypeScript

- `strict: true` in `tsconfig`. No `any`, no `as unknown as T`.
- Prefer `import type { … }` for types-only imports.
- Pure utility functions live next to the module that uses them; export only what's needed by tests or other modules.

### React

- Functional components only. No class components except `ErrorBoundary` (React requires a class for `componentDidCatch`).
- Co-locate UI state (`useState`) with the component that owns it. Don't lift state higher than needed.
- Avoid `useEffect` for state derivation — derive at render time. The only effects in the codebase are: localStorage persistence, event listeners, and timeouts.
- Components that read `flow.state` should take `{ flow: FlowApi }`, not destructure at the boundary — keeps the prop API stable.

### Tailwind

- The design tokens (`helfa-cream`, `helfa-ink`, `helfa-lime`, etc.) and utility classes (`display-headline`, `surface-card`, `btn-pill-cta`, `btn-pill-ghost`, `choice-card`, etc.) are defined in `src/index.css`. Use them; don't invent new colors.
- Lime is an **accent only** — never a primary surface color. Primary CTAs are dark green (`helfa-ink`).

### Tests

- Use vitest. Tests live next to the source file as `<name>.test.ts`.
- Test only pure functions for now — no DOM tests, no E2E. Hand off UI verification to the friend-test (`docs/usability-test-checklist.md`).

### Commit style

- Conventional commits: `feat(scope):`, `fix(scope):`, `docs(scope):`, `test(scope):`, `chore(scope):`, `perf(scope):`, `ci:`.
- Short imperative subject line + body explaining *why*.
- Spec / infra changes go in dedicated commits, separate from feature impl commits.
- Don't add a Claude / AI co-author trailer to commits in this repo.

### Adding new fields to existing state

The two sub-products use a backwards-compatible localStorage load. If you add a field to `<Flow>State`:

1. Default it in `initialState` and `emptyPersonalDetails` (for nested fields).
2. The `loadState()` function already merges parsed state over `initialState`, so missing fields get defaults — no migration needed.
3. **Only bump `schemaVersion`** if you're making a backward-incompatible change (e.g., renaming a field, changing its type). Bumping resets the entire flow state for existing users, so think twice.

---

## What NOT to do

- **Don't add a database for the Köln sub-products.** They're deliberately stateless on the server.
- **Don't add user accounts.** No login, no email capture (except the optional reminder export, which uses `.ics` files locally).
- **Don't auto-fill the official PDF with a server-side process.** It runs in the browser, fetching the live PDF from Köln's form server. Server-side fills create drift risk and centralize PII.
- **Don't add tracking pixels, Google Analytics, or any third-party SDK that sets cookies.** Vercel Analytics is the only analytics; it's cookieless.
- **Don't post to Reddit / external channels from automation.** The launch post (`docs/launch/reddit-draft.md`) is for the founder to publish manually.

---

## Where to ask

- Architecture / state-machine pattern: `ARCHITECTURE.md`.
- Current focus + recent commits: `STATUS.md`.
- The locked specs: `docs/specs/anmeldung-koeln-v1-spec.md`, `docs/specs/auslaenderbehoerde-koeln-v1-spec.md`.
- The graph of the codebase (auto-generated): `graphify-out/GRAPH_REPORT.md` — run `graphify update .` after code changes.
