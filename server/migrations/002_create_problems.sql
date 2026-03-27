CREATE TABLE IF NOT EXISTS problems (
  id              SERIAL PRIMARY KEY,
  leetcode_id     INTEGER UNIQUE NOT NULL,
  title           VARCHAR(255) NOT NULL,
  title_zh        VARCHAR(255),
  title_slug      VARCHAR(255) NOT NULL,
  rating          NUMERIC(10, 4) NOT NULL,
  contest_slug    VARCHAR(100) NOT NULL,
  problem_index   VARCHAR(5) NOT NULL,
  contest_id_en   VARCHAR(100) NOT NULL,
  contest_id_zh   VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_problems_rating ON problems(rating);
CREATE INDEX IF NOT EXISTS idx_problems_leetcode_id ON problems(leetcode_id);
