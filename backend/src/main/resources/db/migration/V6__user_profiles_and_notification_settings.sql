-- Helfa migration Phase 1: per-user personalisation inputs and notification preferences.
-- Tables are created here without data; population comes from the onboarding endpoints in Phase 2.
-- city_id is nullable for now; V7 creates the cities table and adds the FK.

CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(255),
    nationality CHAR(2),
    city_id UUID,
    visa_pathway VARCHAR(32),
    family_status VARCHAR(16),
    family_in_germany BOOLEAN NOT NULL DEFAULT FALSE,
    arrival_date DATE,
    anmeldung_date DATE,
    permit_expiry_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_city_visa ON user_profiles(city_id, visa_pathway);

CREATE TABLE notification_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    digest_mode VARCHAR(16) NOT NULL DEFAULT 'IMMEDIATE',
    digest_day VARCHAR(3),
    digest_time TIME NOT NULL DEFAULT '09:00',
    quiet_hours_start TIME NOT NULL DEFAULT '22:00',
    quiet_hours_end TIME NOT NULL DEFAULT '08:00'
);
