-- Rollback for V11 (Phase 4 cutover). Recreates the legacy schema *shape* only.
-- Data is NOT restored — restore from the pg_dump taken before the cutover for that.
--
-- Run manually: psql -f V11__rollback.sql && psql -f V12__rollback.sql && psql -f V13__rollback.sql

CREATE TABLE IF NOT EXISTS immigration_offices (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    appointment_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offices_city ON immigration_offices(city);
CREATE INDEX IF NOT EXISTS idx_offices_location ON immigration_offices(latitude, longitude);

CREATE TABLE IF NOT EXISTS visa_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    visa_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    notes VARCHAR(2000),
    office_id BIGINT REFERENCES immigration_offices(id),
    submitted_at TIMESTAMP,
    decision_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON visa_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON visa_applications(status);

CREATE TABLE IF NOT EXISTS application_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES visa_applications(id) ON DELETE CASCADE,
    document_type VARCHAR(64) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(64) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);
