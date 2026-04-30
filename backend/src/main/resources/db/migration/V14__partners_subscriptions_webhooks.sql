-- Helfa migration Phase 5: monetisation surface.
-- - partners: marketplace catalogue (public read)
-- - partner_referrals: click-through + conversion tracking
-- - subscriptions: durable Stripe subscription state, 1:1 with users
-- - stripe_webhook_events: idempotency table; we record event_id on first delivery
--   and short-circuit on replays.

CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category VARCHAR(32) NOT NULL,
    logo_url TEXT,
    website_url TEXT NOT NULL,
    affiliate_url_template TEXT,
    commission_disclosure TEXT NOT NULL,
    rating NUMERIC(3,2),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    supported_nationalities TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_partners_category_active ON partners(category, active);

CREATE TABLE partner_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE RESTRICT,
    product_code VARCHAR(64),
    click_id VARCHAR(64) UNIQUE NOT NULL,
    clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    converted_at TIMESTAMPTZ,
    commission NUMERIC(10,2),
    webhook_payload JSONB
);

CREATE INDEX idx_partner_referrals_user_partner ON partner_referrals(user_id, partner_id, product_code);
CREATE INDEX idx_partner_referrals_converted ON partner_referrals(converted_at);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE NOT NULL,
    stripe_subscription_id TEXT UNIQUE,
    tier VARCHAR(32) NOT NULL,
    status VARCHAR(16) NOT NULL,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    renews_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE stripe_webhook_events (
    event_id VARCHAR(128) PRIMARY KEY,
    type VARCHAR(64) NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE partner_webhook_events (
    event_id VARCHAR(128) PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
