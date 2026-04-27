-- Append-only audit log of visa application status changes
CREATE TABLE application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES visa_applications(id) ON DELETE CASCADE,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    note VARCHAR(1000)
);

CREATE INDEX idx_history_application_id ON application_status_history(application_id);
CREATE INDEX idx_history_changed_at ON application_status_history(changed_at);
