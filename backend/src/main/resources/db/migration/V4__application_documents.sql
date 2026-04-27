-- Uploaded documents attached to visa applications (separate from the document_visa_types checklist)
CREATE TABLE application_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES visa_applications(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_key VARCHAR(1000) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_app_docs_application_id ON application_documents(application_id);
CREATE INDEX idx_app_docs_app_and_type ON application_documents(application_id, document_type);
CREATE INDEX idx_app_docs_deleted_at ON application_documents(deleted_at);
