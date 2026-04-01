ALTER TABLE user_problem_status
ADD COLUMN IF NOT EXISTS time_spent INTEGER;

UPDATE user_problem_status
SET time_spent = 0
WHERE time_spent IS NULL;

ALTER TABLE user_problem_status
ALTER COLUMN time_spent SET DEFAULT 0;

ALTER TABLE user_problem_status
ALTER COLUMN time_spent SET NOT NULL;
