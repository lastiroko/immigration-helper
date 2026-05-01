# Stripe test-mode end-to-end runbook

How to verify the Helfa billing flow works against Stripe in test mode,
including the webhook idempotency we built in Phase 5. ~15 minutes; the
agent can't do steps 1–3 because they require Stripe-dashboard interaction.

## 1. Provision Stripe test-mode credentials

1. Sign in at https://dashboard.stripe.com/. Make sure the **Test mode**
   toggle (top-right) is on. Live-mode keys must never touch this app.
2. **Developers → API keys** → copy **Secret key** (`sk_test_...`).
3. **Products → + Add product** → create one called "Helfa Premium" with a
   recurring monthly price (e.g., €5.00/month). Copy the resulting
   **Price ID** (`price_...`). Repeat for "Helfa Enterprise" if you want a
   second tier; reuse the premium ID otherwise.

## 2. Wire the webhook

1. **Developers → Webhooks → + Add endpoint**.
2. **Endpoint URL:**
   `https://immigration-helper-production.up.railway.app/api/v1/billing/webhook`
3. **Events to send:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. After saving, click the new endpoint and reveal **Signing secret**
   (`whsec_...`). This is what `BillingService` verifies on every call.

## 3. Update Railway env vars
Replace the four placeholders:
- `STRIPE_API_KEY` = `sk_test_...` from step 1.2
- `STRIPE_WEBHOOK_SECRET` = `whsec_...` from step 2.4
- `STRIPE_PREMIUM_PRICE_ID` = `price_...` premium from step 1.3
- `STRIPE_ENTERPRISE_PRICE_ID` = `price_...` enterprise (or premium again)

Railway redeploys automatically.

## 4. Drive a real test checkout
You'll need a JWT to hit the protected endpoint. Quickest path:

```sh
BASE=https://immigration-helper-production.up.railway.app
TOKEN=$(curl -s -X POST "$BASE/api/v1/auth/register" \
  -H 'Content-Type: application/json' \
  -d '{"email":"stripe-test@helfa.app","password":"hunter2hunter2","name":"Stripe Tester"}' \
  | python -c "import sys,json;print(json.load(sys.stdin)['accessToken'])")

USER_ID=$(curl -s -X POST "$BASE/api/v1/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"stripe-test@helfa.app","password":"hunter2hunter2"}' \
  | python -c "import sys,json;print(json.load(sys.stdin)['userId'])")

# Create the checkout session
curl -s -X POST "$BASE/api/v1/billing/checkout-session" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"userId\":\"$USER_ID\",\"tier\":\"PREMIUM\",\"successUrl\":\"https://example.com/ok\",\"cancelUrl\":\"https://example.com/no\"}"
```

Expected: `{"checkoutUrl":"https://checkout.stripe.com/c/pay/cs_test_..."}`.

Open the URL in a browser. Use Stripe's universal test card:
- **Card:** `4242 4242 4242 4242`
- **Exp:** any future date (e.g., `12/30`)
- **CVC:** any 3 digits (e.g., `123`)
- **Postal code:** any (e.g., `10115`)

Submit. You should land on `example.com/ok`.

## 5. Verify the database wrote a Subscription row
Use Railway's Postgres "Query" tab (or `psql $DATABASE_URL`):

```sql
SELECT user_id, tier, status, stripe_customer_id, stripe_subscription_id
FROM subscriptions
WHERE user_id = (SELECT id FROM users WHERE email = 'stripe-test@helfa.app');
```

Expected: one row with `status = 'ACTIVE'`, `tier = 'PREMIUM'`, both Stripe
IDs populated. The user's `subscription_tier` should also flip to `PREMIUM`:

```sql
SELECT email, subscription_tier FROM users WHERE email = 'stripe-test@helfa.app';
```

## 6. Verify webhook idempotency

In the Stripe dashboard, find the `checkout.session.completed` event and
click **Resend**. Spring logs should show:

```
Stripe webhook replay ignored: evt_xxx
```

The `subscriptions` row count is unchanged (no double-write). The
`stripe_webhook_events` table has exactly one row for that event id:

```sql
SELECT event_id, type FROM stripe_webhook_events ORDER BY received_at DESC LIMIT 5;
```

## 7. Verify cancellation path
In Stripe → **Customers → your test customer → Cancel subscription
immediately**. Stripe fires `customer.subscription.deleted`.

Confirm:
```sql
SELECT status, cancelled_at FROM subscriptions
WHERE user_id = (SELECT id FROM users WHERE email = 'stripe-test@helfa.app');
-- expected: status='CANCELLED', cancelled_at IS NOT NULL

SELECT subscription_tier FROM users WHERE email = 'stripe-test@helfa.app';
-- expected: 'FREE'
```

## 8. Common gotchas
- **`Invalid webhook signature`** in logs: the secret you pasted into
  Railway doesn't match the dashboard endpoint. Recreating the endpoint
  generates a new secret; rotate.
- **No subscription row written** but `200 OK` returned: check the event
  metadata. `BillingService.handleCheckoutCompleted` looks for
  `metadata.userId` and `metadata.tier` — both must be set, and we set
  them in `createCheckoutSession`. If you bypass that endpoint and create
  sessions directly from the Stripe dashboard, the metadata is missing.
- **Stripe CLI replay locally** (`stripe trigger checkout.session.completed`)
  hits the *prod* webhook from your laptop's CLI session. Useful for
  iterating without a real card; not a substitute for the full path.

## What this runbook does NOT cover
- Live mode (`sk_live_...`) — gated by KYB approval from Stripe, an
  intentional safety wall. Repeat steps 1–3 with a live-mode endpoint
  once your business is verified.
- 3DS / SCA / PSD2 challenge flows — use Stripe's other test cards
  (`4000 0027 6000 3184` etc.) to exercise these.
- Tax handling, prorations, trials — the current Phase 5 implementation
  doesn't surface those; configure in Stripe Products and they "just
  work" via Checkout, but the local Subscription row only mirrors status.
