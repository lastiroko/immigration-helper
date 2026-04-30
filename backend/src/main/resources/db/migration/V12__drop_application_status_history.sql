-- Helfa migration Phase 4: drop the visa application audit log.
-- The new domain's audit lives in notification_outbox + tasks.completed_at.

DROP TABLE IF EXISTS application_status_history CASCADE;
