-- Add time_spent column to track how long a user spends on each problem (in seconds)
ALTER TABLE user_problem_status ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0;
