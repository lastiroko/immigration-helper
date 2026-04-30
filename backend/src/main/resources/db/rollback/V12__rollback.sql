-- Rollback for V12 (Phase 4 cutover). Recreates application_status_history shape only.

CREATE TABLE IF NOT EXISTS application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES visa_applications(id) ON DELETE CASCADE,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id),
    changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    note VARCHAR(2000)
);

CREATE INDEX IF NOT EXISTS idx_status_history_application ON application_status_history(application_id);
