-- Helfa migration Phase 4: cutover. Drop the visa-application aggregate.
--
-- Order: drop child rows first to satisfy FKs.
-- - application_documents references visa_applications (dropped here as well; V13 was
--   originally planned for this but we collapse to a single point of removal so the cutover
--   can never leave behind a half-deleted aggregate).
-- - application_status_history → V12.
-- - The visa_applications row references both users (kept) and immigration_offices.
--
-- Rollback: db/rollback/V11__rollback.sql restores tables + columns. We do NOT attempt to
-- restore data; rollback is for shape only. A pg_dump must be taken before deploying this.

DROP TABLE IF EXISTS application_documents CASCADE;
DROP TABLE IF EXISTS visa_applications CASCADE;
DROP TABLE IF EXISTS immigration_offices CASCADE;
