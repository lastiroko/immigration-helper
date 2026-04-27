# Immigration Helper — Backend

Spring Boot 3.2 backend for the Immigration Helper platform. Helps international students in Germany navigate immigration bureaucracy.

## Tech Stack

- **Java 17** + **Spring Boot 3.2**
- **Spring Data JPA** + **PostgreSQL 15**
- **Spring Security** + **JWT** (jjwt 0.12)
- **Stripe Java SDK** for payments
- **MapStruct** for DTO mapping
- **Flyway** for schema migrations
- **springdoc-openapi** for Swagger UI

## Quick Start

### 1. Start PostgreSQL and Redis

```bash
docker compose up -d
```

### 2. Configure environment (optional — defaults work for local dev)

```bash
export DB_URL=jdbc:postgresql://localhost:5432/immigration_helper
export DB_USERNAME=immigration_user
export DB_PASSWORD=immigration_pass
export JWT_SECRET=your-256-bit-secret-key-change-in-production-min-32-chars
export STRIPE_API_KEY=sk_test_your_key_here
export STRIPE_WEBHOOK_SECRET=whsec_your_secret
export STRIPE_PREMIUM_PRICE_ID=price_your_premium_id
export STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_id
```

### 3. Run the application

```bash
./mvnw spring-boot:run
```

The API is available at `http://localhost:8080`.

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Health check**: http://localhost:8080/actuator/health
- **OpenAPI JSON**: http://localhost:8080/api-docs

## API Endpoints

### Authentication
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register new user |
| POST | `/api/v1/auth/login` | No | Login, get JWT tokens |
| POST | `/api/v1/auth/refresh` | No | Refresh access token |

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/users/me` | JWT | Get current user |
| GET | `/api/v1/users/{id}` | JWT | Get user by ID |
| PUT | `/api/v1/users/{id}` | JWT | Update user profile |

### Immigration Offices
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/offices` | No | List all offices |
| GET | `/api/v1/offices/{id}` | No | Get office by ID |
| GET | `/api/v1/offices/nearest?lat=52.5&lon=13.4&limit=5` | No | Find nearest offices (Haversine) |
| GET | `/api/v1/offices/nearest?city=Berlin` | No | Find offices by city |

### Documents
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/documents?visaType=STUDENT` | No | All documents for visa type |
| GET | `/api/v1/documents/checklist?visaType=STUDENT` | No | Required documents only |

### Visa Applications
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/applications` | JWT | Create application |
| GET | `/api/v1/applications/{id}` | JWT | Get application |
| GET | `/api/v1/applications/user/{userId}` | JWT | User's applications |
| PUT | `/api/v1/applications/{id}/status` | JWT | Update status |

### Payments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/payments/create-checkout-session` | JWT | Create Stripe checkout |
| POST | `/api/v1/payments/webhook` | No | Stripe webhook handler |
| GET | `/api/v1/payments/subscription-status?userId=...` | JWT | Subscription status |

## Project Structure

```
src/main/java/com/immigrationhelper/
├── domain/                  # Entities, enums — no dependencies on outer layers
│   ├── entity/              # User, ImmigrationOffice, VisaApplication, Document
│   └── enums/               # SubscriptionTier, VisaType, ApplicationStatus
├── application/             # Use cases, pure business logic
│   ├── dto/                 # Request/response records
│   ├── mapper/              # MapStruct interfaces
│   └── service/             # AuthService, UserService, OfficeService, ...
└── infrastructure/          # Spring wiring
    ├── persistence/         # JPA repositories
    ├── web/                 # REST controllers
    └── config/              # Security, JWT, OpenAPI, exception handler
```

## Visa Types

| Enum | Description |
|------|-------------|
| `STUDENT` | Student visa / Aufenthaltserlaubnis zum Studium |
| `WORK` | Work visa / Aufenthaltserlaubnis zur Beschäftigung |
| `BLUE_CARD` | EU Blue Card / Blaue Karte EU |
| `FAMILY` | Family reunification / Familienzusammenführung |

## Seeded Test Users

| Email | Password | Tier |
|-------|----------|------|
| free.user@example.com | password123 | FREE |
| premium.user@example.com | password123 | PREMIUM |

## Running Tests

```bash
./mvnw test
```

Tests use an in-memory H2 database (PostgreSQL compatibility mode). Flyway is disabled in the test profile — the JPA creates the schema directly from entities.

## Stripe Webhook (local development)

Use the Stripe CLI to forward webhooks locally:

```bash
stripe listen --forward-to localhost:8080/api/v1/payments/webhook
```

Copy the webhook signing secret printed by the CLI and set it as `STRIPE_WEBHOOK_SECRET`.
