# Deploying the Helfa backend to Railway

A click-driven path from `git push` to a running Helfa API in ~15 minutes.
Other platforms (Fly.io, Render, DigitalOcean App Platform) use the same
Dockerfile and the same env-var contract; only the UI differs.

## 0. Prerequisites
- A GitHub repo containing this code (the `backend/` directory must be present).
- A Railway account (https://railway.app — sign in with GitHub).
- Stripe **test-mode** API key + webhook signing secret (from
  https://dashboard.stripe.com/test/apikeys).
- A 32+ character random string for `JWT_SECRET`. Generate one:
  ```sh
  openssl rand -base64 48
  ```

## 1. Create the Railway project
1. **New Project → Deploy from GitHub repo** → pick this repo.
2. Railway will detect a Dockerfile but apply it against the repo root by
   default. Open the service settings and set:
   - **Root Directory:** `backend`
   - **Builder:** Dockerfile (auto-detected)
3. Add a Postgres plugin: **+ New → Database → PostgreSQL**. It attaches to
   the project and exposes `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`,
   `PGPORT` to other services in the project.

## 2. Set environment variables on the backend service
Use the variable-references syntax (`${{Postgres.PGHOST}}`) so the values
auto-update if Postgres rotates credentials.

| Variable | Value |
|---|---|
| `DB_URL` | `jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}` |
| `DB_USERNAME` | `${{Postgres.PGUSER}}` |
| `DB_PASSWORD` | `${{Postgres.PGPASSWORD}}` |
| `JWT_SECRET` | (the 48-byte string from step 0) |
| `STRIPE_API_KEY` | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (set after step 4) |
| `STRIPE_PREMIUM_PRICE_ID` | `price_...` (from your Stripe Products) |
| `STRIPE_ENTERPRISE_PRICE_ID` | `price_...` (or reuse premium for now) |
| `FEATURES_GUIDANCE_ENABLED` | `true` |
| `NOTIFICATIONS_PUSH_DRIVER` | `logging` |

Railway auto-injects `PORT`; the Dockerfile already maps it to
`--server.port=${PORT}`, so don't override it.

## 3. First deploy
Push to `main` (or click **Deploy** in the Railway UI). The build runs the
Dockerfile in `backend/`, packages the Spring Boot JAR, and starts the app.
On startup Flyway runs **all migrations V1 → V15** in order — including the
Phase 4 `DROP TABLE` migrations — against your fresh Postgres.

Watch **Deploy Logs** for:
- `Initialized JPA EntityManagerFactory`
- `Started ImmigrationHelperApplication in N seconds`

If V11/V12 fail because the tables don't exist (legitimate on a virgin DB —
they're `DROP TABLE IF EXISTS`), Flyway treats the script as successful and
moves on.

Then assign a public domain: **Service Settings → Networking → Generate
Domain**. You'll get something like `helfa-backend-production.up.railway.app`.

Smoke-test:
```sh
curl https://your-domain/actuator/health
# → {"status":"UP"}
```

## 4. Wire the Stripe webhook
1. In Stripe Dashboard → Developers → Webhooks → **Add endpoint**.
2. Endpoint URL: `https://your-domain/api/v1/billing/webhook`.
3. Events to send: `checkout.session.completed`,
   `customer.subscription.deleted`, `customer.subscription.updated`.
4. Copy the **Signing secret** (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`
   on Railway. The service auto-redeploys.
5. Click **Send test webhook** in Stripe → service logs should show
   `Stripe webhook replay ignored: ...` on the second send (idempotency works).

## 5. Persistent storage decision
The Dockerfile uses a `LocalFileStorageService` rooted at `/app/uploads`.
**On Railway free containers this is ephemeral** — restarts wipe vault
documents. Two production options:

- **Railway Volume** (cheapest): Service Settings → Volumes → mount one at
  `/app/uploads`. Survives restarts. Single-replica only.
- **S3 / R2 / Spaces**: implement an `S3FileStorageService` that conforms
  to `FileStorageService` and inject it via Spring config. ~30 lines with
  the AWS SDK; durable across replicas. Recommended once you have any users.

## 6. (Optional) Apply the V11–V13 cutover *safely* on an existing DB
If you ever copy this DB schema to a Helfa-style instance from a partial
deploy that already had `visa_applications` rows, take a `pg_dump` first.
Rollbacks live in `backend/src/main/resources/db/rollback/V11..V13.sql`
(shape-only — actual data restoration requires the dump).

```sh
# from a machine with psql + the public DB URL from Railway
pg_dump "$DATABASE_URL" > pre-cutover-$(date +%F).sql
```

## 7. Common gotchas
- **`Flyway baseline` errors** on a non-empty DB: set
  `SPRING_FLYWAY_BASELINE_ON_MIGRATE=true` (already on in `application.yml`).
- **Out of memory at boot** on the smallest Railway tier: set
  `JAVA_OPTS=-XX:MaxRAMPercentage=75 -Xss512k`.
- **Healthcheck fails on first deploy:** Spring takes 15–30s to start. In
  service settings raise the healthcheck start period or just refresh.
- **Stripe `Invalid webhook signature`:** the secret on Railway must match
  the *exact* webhook endpoint you created. Recreating the endpoint
  generates a new secret.

## What's NOT covered yet
- OWASP ZAP baseline scan (TC-037) — point ZAP at your Railway URL.
- Load test (TC-032) — k6 or Artillery against the same URL.
- WCAG accessibility — needs a frontend, not the backend.
- Real FCM/APNS — set `NOTIFICATIONS_PUSH_DRIVER=fcm` once the FCM
  service-account JSON is mounted.
