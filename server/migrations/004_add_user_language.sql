ALTER TABLE users
  ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'en'
    CHECK (language IN ('en', 'zh-TW'));
