CREATE TABLE IF NOT EXISTS user_problem_status (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id  INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  status      VARCHAR(20) NOT NULL CHECK (status IN ('solved', 'attempted', 'todo')),
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_ups_user_id ON user_problem_status(user_id);
CREATE INDEX IF NOT EXISTS idx_ups_user_status ON user_problem_status(user_id, status);
