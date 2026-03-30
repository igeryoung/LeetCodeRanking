import { Pool } from 'pg';
import { env } from './env.js';
import { getDatabasePoolConfig, requireDatabaseUrl } from './databaseRuntime.js';

export const pool = new Pool({
  ...getDatabasePoolConfig(env.nodeEnv),
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export async function query(text: string, params?: unknown[]) {
  requireDatabaseUrl();
  return pool.query(text, params as unknown[]);
}
