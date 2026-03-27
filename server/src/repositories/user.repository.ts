import { query } from '../config/database.js';
import type { User } from '../types/index.js';

export async function findByProviderId(provider: string, providerId: string): Promise<User | null> {
  const { rows } = await query(
    'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
    [provider, providerId]
  );
  return rows[0] || null;
}

export async function findById(id: string): Promise<User | null> {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function upsert(data: {
  email: string | null;
  display_name: string;
  avatar_url: string | null;
  provider: string;
  provider_id: string;
}): Promise<User> {
  const { rows } = await query(
    `INSERT INTO users (email, display_name, avatar_url, provider, provider_id)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (provider, provider_id)
     DO UPDATE SET
       email = EXCLUDED.email,
       display_name = EXCLUDED.display_name,
       avatar_url = EXCLUDED.avatar_url,
       updated_at = NOW()
     RETURNING *`,
    [data.email, data.display_name, data.avatar_url, data.provider, data.provider_id]
  );
  return rows[0];
}
