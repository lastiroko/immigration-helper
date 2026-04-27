-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'FREE',
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Immigration offices table
CREATE TABLE immigration_offices (
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

CREATE INDEX idx_offices_city ON immigration_offices(city);
CREATE INDEX idx_offices_location ON immigration_offices(latitude, longitude);

-- Documents table
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    required BOOLEAN NOT NULL DEFAULT TRUE,
    notes VARCHAR(500)
);

-- Document visa types join table
CREATE TABLE document_visa_types (
    document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    visa_types VARCHAR(20) NOT NULL,
    PRIMARY KEY (document_id, visa_types)
);

CREATE INDEX idx_document_visa_types ON document_visa_types(visa_types);

-- Visa applications table
CREATE TABLE visa_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    office_id BIGINT REFERENCES immigration_offices(id) ON DELETE SET NULL,
    visa_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    documents JSONB,
    notes VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applications_user_id ON visa_applications(user_id);
CREATE INDEX idx_applications_status ON visa_applications(status);
CREATE INDEX idx_applications_visa_type ON visa_applications(visa_type);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visa_applications_updated_at
    BEFORE UPDATE ON visa_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
