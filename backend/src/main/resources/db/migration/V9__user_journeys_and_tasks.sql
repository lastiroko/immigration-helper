-- Helfa migration Phase 3: journey core.
-- A user_journey is one customer narrative (student arrival, family reunion, etc.).
-- A task is a single actionable item, instantiated from a task_template at journey-start
-- so that template edits don't retroactively rewrite people's plans.

CREATE TABLE user_journeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_end_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    meta JSONB
);

CREATE INDEX idx_user_journeys_user_status ON user_journeys(user_id, status);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    journey_id UUID NOT NULL REFERENCES user_journeys(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE RESTRICT,
    template_code VARCHAR(64) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_at TIMESTAMPTZ,
    status VARCHAR(16) NOT NULL DEFAULT 'UPCOMING',
    priority INT NOT NULL DEFAULT 50,
    completed_at TIMESTAMPTZ,
    postponed_until DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Primary dashboard query: tasks for a user, filtered by status, ordered by due date.
CREATE INDEX idx_tasks_user_status_due ON tasks(user_id, status, due_at);
CREATE INDEX idx_tasks_journey ON tasks(journey_id);
CREATE INDEX idx_tasks_template ON tasks(template_id);
