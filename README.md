# Immigration Helper

A platform helping international students navigate German immigration bureaucracy.

<!-- TODO: add CI badge once GitHub Actions workflow is in place -->

## What it does

Immigration Helper turns the multi-step process of applying for a German residence permit into something a student can actually track. Users register, choose a visa type (Student, Work, EU Blue Card, or Family Reunion), and create an application that progresses through a documented status lifecycle (`DRAFT → SUBMITTED → APPROVED | REJECTED`). Every status change is recorded in an append-only audit log so the user can see exactly when and why their application moved.

The platform also surfaces practical bureaucratic information that's normally scattered across municipal websites: a directory of 24 real `Ausländerbehörde` offices across Germany with addresses, phone numbers, and appointment URLs, plus per-visa-type document checklists drawn from the actual federal requirements (e.g. blocked account proof for student visas, salary thresholds for the Blue Card).

Document upload — letting users attach scanned PDFs and photos to an application — is partially built: the backend entity, controller, and storage abstraction are in place; the frontend UI is not yet wired up. Stripe checkout for premium subscriptions is scaffolded on the backend but not exposed in the web app.

## Tech stack

| Layer | Tech |
|------|------|
| Backend | Spring Boot 3.2.0, Java 17 |
| Backend libraries | Spring Security, Spring Data JPA, Spring Validation, Spring Actuator, jjwt 0.12.3, MapStruct 1.5.5, Lombok, Stripe Java SDK 24.3.0, springdoc-openapi 2.3.0 |
| Database | PostgreSQL 14+ (production), H2 (test profile only) |
| Migrations | Flyway |
| Frontend | React 19.2, TypeScript 6.x, Vite 8 |
| Frontend libraries | react-router-dom 7, axios, @stripe/react-stripe-js, Tailwind CSS 4 (via @tailwindcss/postcss) |
| Build tools | Maven, npm/Vite |
| Testing | JUnit 5, Spring Security Test |

## Architecture overview

Standard layered Spring Boot service: `domain` (JPA entities, enums) → `application` (services, DTOs, mappers) → `infrastructure` (web controllers, JPA repositories, security config). The React frontend talks to it over a `/api/v1/*` REST surface authenticated with JWT bearer tokens. PostgreSQL is the system of record; there is no message broker, cache, or external dependency beyond Stripe.

For domain model, authentication flow, the visa application state machine, and the authorization patterns, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Getting started

### Prerequisites

- Java 17+ (JDK)
- Maven 3.9+ (or use the Maven wrapper if added)
- Node.js 20+ and npm
- PostgreSQL 14+ running locally on port 5432 (or via Docker)

### Clone

```bash
git clone https://github.com/lastiroko/immigration-helper.git
cd immigration-helper
```

### Backend setup

The backend reads configuration from environment variables with sensible localhost defaults in `backend/src/main/resources/application.yml`. For local dev you only need the database to exist; the rest can be left to defaults.

Required when running against a non-default database:

```bash
export DB_URL=jdbc:postgresql://localhost:5432/immigration_helper
export DB_USERNAME=immigration_user
export DB_PASSWORD=immigration_pass
```

Required for production-like runs:

```bash
export JWT_SECRET=<at least 32 characters of random bytes>
```

Optional — only needed to exercise the Stripe code path:

```bash
export STRIPE_API_KEY=sk_test_...
export STRIPE_WEBHOOK_SECRET=whsec_...
export STRIPE_PREMIUM_PRICE_ID=price_...
export STRIPE_ENTERPRISE_PRICE_ID=price_...
```

Optional — overrides the local document-upload directory (defaults to `./uploads`):

```bash
export APP_STORAGE_BASE_PATH=/var/lib/immigration-helper/uploads
```

Run migrations and start the server (Flyway migrates on startup):

```bash
cd backend
mvn spring-boot:run
```

The API is then available at `http://localhost:8080`. OpenAPI docs at `http://localhost:8080/swagger-ui.html`.

### Frontend setup

```bash
cd frontend-web
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies API calls to the backend at `http://localhost:8080` (the URL is hardcoded in `src/services/api.ts`).

### Default ports

| Service | Port |
|--------|------|
| Backend (Spring Boot) | 8080 |
| Frontend (Vite) | 5173 |
| PostgreSQL | 5432 |

## Project structure

```
immigration-helper/
├── backend/                          Spring Boot REST API
│   └── src/main/java/com/immigrationhelper/
│       ├── domain/                   JPA entities and enums (User, VisaApplication, ...)
│       ├── application/              Services, DTOs, mappers
│       └── infrastructure/           Web controllers, repositories, security config
├── frontend-web/                     React + Vite SPA
│   └── src/
│       ├── pages/                    Route-level components (Login, Dashboard, Applications, ...)
│       ├── contexts/                 AuthContext (token + current user)
│       ├── services/                 api.ts — axios client and endpoint wrappers
│       ├── lib/                      Display helpers (visa labels, status badges, date formatting)
│       └── types/                    Shared TypeScript types
├── ARCHITECTURE.md                   Domain model, state machine, auth design
└── README.md                         You are here
```

## Testing

Backend tests run with Maven and use the `test` profile (H2 in-memory in PostgreSQL compatibility mode):

```bash
cd backend
mvn test
```

Nine test classes cover:

- Auth flow — `AuthControllerTest`, `AuthServiceTest`
- Service layer — `VisaApplicationServiceTest`, `OfficeServiceTest`, `UserServiceTest`
- Repository — `UserRepositoryTest`
- Authorization — `ApplicationAuthorizationTest`, `ApplicationDocumentAuthorizationTest`
- App context smoke test — `ImmigrationHelperApplicationTest`

The two `*AuthorizationTest` files specifically exercise the ownership and admin-gating rules added during the Phase 1 security audit.

## Roadmap

**Phase 1 — done**
- JWT authentication with bcrypt password hashing
- Visa application CRUD with documented state machine
- Append-only status history audit log
- Immigration office directory + nearest-office search
- Per-visa-type document checklist
- Authorization audit (ownership + admin-gated terminal transitions)
- Application detail page with status timeline UI

**Phase 2 — in progress**
- Document upload: backend `ApplicationDocument` entity, controller, and `LocalFileStorageService` / `S3FileStorageService` are in place; frontend upload UI is the remaining work

**Phase 3 — planned**
- Office filtering by visa type and language support
- Multilingual UI (DE/EN at minimum)

**Phase 4 — planned**
- Stripe checkout flow wired into the frontend
- Webhook-driven subscription tier updates

**Future**
- Android client (Kotlin + Jetpack Compose)
- Appointment booking integrations where municipal APIs allow

## License

<!-- TODO: choose a license (MIT or Apache-2.0 likely) before going public -->

License not yet selected.
