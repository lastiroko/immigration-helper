-- Helfa migration Phase 3: user-owned document vault, decoupled from visa applications.
-- Coexists with the legacy `application_documents` table; the legacy table is dropped in Phase 4.
--
-- Bytes live in the storage abstraction (LocalFileStorageService for now). `encrypted_key`
-- is reserved for the per-doc DEK envelope; null until the KMS work in Phase 5.
--
-- The pre-existing `documents` table held a static visa-type → required-document catalog
-- that is fully superseded by TaskTemplate.associated_document_types. Drop it here so the
-- new user-document schema can claim the name.

DROP TABLE IF EXISTS document_visa_types;
DROP TABLE IF EXISTS documents;

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL,
    title TEXT NOT NULL,
    storage_ref TEXT NOT NULL,
    encrypted_key BYTEA,
    size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(64) NOT NULL,
    apostille_status VARCHAR(16) NOT NULL DEFAULT 'NONE',
    translation_status VARCHAR(16) NOT NULL DEFAULT 'NONE',
    expiry_date DATE,
    is_original BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_documents_user_deleted ON documents(user_id, deleted_at);
CREATE INDEX idx_documents_user_type ON documents(user_id, type);
CREATE INDEX idx_documents_expiry ON documents(expiry_date);

CREATE TABLE task_document_links (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE RESTRICT,
    role VARCHAR(16) NOT NULL DEFAULT 'REQUIRED',
    satisfied BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (task_id, document_id)
);

CREATE INDEX idx_task_document_links_doc ON task_document_links(document_id);
