-- V13 is an idempotent re-drop, so its rollback is just V11+V12's rollback applied in order.
-- This file is a placeholder to keep one rollback per forward migration in db/rollback/.
SELECT 1;
