-- Helfa migration Phase 5: account lifecycle + GDPR export.
-- - users gains a soft-delete state machine: ACTIVE → DELETED with a 30-day grace
-- - privacy_exports records each user-requested data export

ALTER TABLE users ADD COLUMN status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN scheduled_deletion_at TIMESTAMPTZ;

CREATE INDEX idx_users_status_scheduled ON users(status, scheduled_deletion_at);

CREATE TABLE privacy_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    storage_ref TEXT,
    error TEXT
);

CREATE INDEX idx_privacy_exports_user ON privacy_exports(user_id);
CREATE INDEX idx_privacy_exports_pending ON privacy_exports(status) WHERE status = 'PENDING';
