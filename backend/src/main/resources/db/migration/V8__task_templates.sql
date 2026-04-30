-- Helfa migration Phase 1: editorial library of reusable task templates (schema only).
-- Seed of the 30 MVP templates lands in Phase 2 as a repeatable migration.

CREATE TABLE task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) UNIQUE NOT NULL,
    title JSONB NOT NULL,
    description JSONB NOT NULL,
    applicable_to JSONB NOT NULL,
    default_lead_days INT,
    depends_on TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    phase VARCHAR(8) NOT NULL,
    priority INT NOT NULL DEFAULT 50,
    associated_office_type VARCHAR(32),
    associated_document_types TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_templates_phase ON task_templates(phase);
