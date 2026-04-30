-- Helfa migration Phase 1: editorial city + office catalogue (schema only).
-- This `offices` table coexists with the legacy `immigration_offices` table during Phase 1-3;
-- the legacy table is dropped in Phase 4 alongside the rest of the visa-CRM domain.
-- Seed data lands in Phase 2 via repeatable migrations.

CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    bundesland VARCHAR(64) NOT NULL,
    population INT,
    supported_from_phase VARCHAR(8) NOT NULL,
    hero_image_url VARCHAR(500),
    latitude NUMERIC(8,5),
    longitude NUMERIC(8,5)
);

CREATE TABLE offices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    type VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    latitude NUMERIC(8,5),
    longitude NUMERIC(8,5),
    opening_hours JSONB,
    booking_url VARCHAR(500),
    phone VARCHAR(64),
    email VARCHAR(255),
    languages_supported TEXT[] NOT NULL DEFAULT ARRAY['de'],
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    what_to_bring JSONB,
    current_notes TEXT,
    current_notes_updated_at TIMESTAMPTZ
);

CREATE INDEX idx_offices_city_type ON offices(city_id, type);
CREATE INDEX idx_offices_last_verified_at ON offices(last_verified_at);

ALTER TABLE user_profiles
    ADD CONSTRAINT fk_user_profiles_city
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL;
