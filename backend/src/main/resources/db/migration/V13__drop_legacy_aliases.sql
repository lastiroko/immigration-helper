-- Helfa migration Phase 4: idempotent cleanup of any legacy artefacts that survived V11/V12.
--
-- The destructive Phase 4 work happens in V11 and V12. This migration exists so that
-- deployments that already ran a partial cutover (e.g., an interrupted V11) end up in
-- a clean state. It is safe to re-run.

DROP TABLE IF EXISTS application_documents CASCADE;
DROP TABLE IF EXISTS application_status_history CASCADE;
DROP TABLE IF EXISTS visa_applications CASCADE;
DROP TABLE IF EXISTS immigration_offices CASCADE;
