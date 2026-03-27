CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255),
  display_name  VARCHAR(100) NOT NULL,
  avatar_url    TEXT,
  provider      VARCHAR(20) NOT NULL,
  provider_id   VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);
