-- Helfa migration Phase 3: durable outbox for outbound notifications.
-- The deadline engine writes rows here on status transitions; a worker drains them.
-- For MVP the worker logs and marks SENT. FCM/APNS wiring lands in Phase 5.

CREATE TABLE notification_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    kind VARCHAR(32) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    attempts INT NOT NULL DEFAULT 0,
    last_error TEXT
);

CREATE INDEX idx_notification_outbox_pending ON notification_outbox(status, scheduled_at)
    WHERE status = 'PENDING';
