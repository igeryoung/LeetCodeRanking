import { Pool } from 'pg';
import { env } from './env.js';
import { getDatabaseDebugInfo, getDatabasePoolConfig, requireDatabaseUrl } from './databaseRuntime.js';

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

export async function closePool() {
  await pool.end();
}

export async function testDatabaseConnection() {
  const debug = getDatabaseDebugInfo(env.nodeEnv);
  console.log('[db] config', debug);

  requireDatabaseUrl();
  const result = await pool.query('SELECT 1 AS ok');
  console.log('[db] test query ok', result.rows[0]);
}
