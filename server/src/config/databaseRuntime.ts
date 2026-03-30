import type { PoolConfig } from 'pg';

function sanitizeEnvValue(value?: string) {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function hasUnresolvedRailwayReference(value: string) {
  return value.includes('${{');
}

function buildDatabaseUrlFromPgEnv() {
  const host = sanitizeEnvValue(process.env.PGHOST);
  const port = sanitizeEnvValue(process.env.PGPORT) || '5432';
  const user = sanitizeEnvValue(process.env.PGUSER);
  const password = sanitizeEnvValue(process.env.PGPASSWORD);
  const database = sanitizeEnvValue(process.env.PGDATABASE);

  if (!host || !user || !password || !database) {
    return '';
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`;
}

export function resolveDatabaseUrl() {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.DATABASE_PRIVATE_URL,
    process.env.DATABASE_PUBLIC_URL,
    process.env.POSTGRES_URL,
    buildDatabaseUrlFromPgEnv(),
  ];

  return candidates
    .map((value) => sanitizeEnvValue(value))
    .find(Boolean);
}

function resolveDatabaseSsl(nodeEnv: string): PoolConfig['ssl'] {
  if (process.env.DATABASE_SSL === 'false' || process.env.PGSSLMODE === 'disable') {
    return false;
  }

  if (process.env.DATABASE_SSL === 'true') {
    return { rejectUnauthorized: false };
  }

  return nodeEnv === 'production' ? { rejectUnauthorized: false } : false;
}

export function getDatabasePoolConfig(nodeEnv = process.env.NODE_ENV || 'development'): PoolConfig {
  const connectionString = resolveDatabaseUrl();

  return {
    connectionString: connectionString || undefined,
    ssl: resolveDatabaseSsl(nodeEnv),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
}

export function requireDatabaseUrl() {
  const databaseUrl = resolveDatabaseUrl();

  if (!databaseUrl) {
    throw new Error('Missing database connection config. Set DATABASE_URL or Railway PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE variables.');
  }

  if (hasUnresolvedRailwayReference(databaseUrl)) {
    throw new Error(`Database URL contains an unresolved Railway reference: ${databaseUrl}. Check that the referenced service name matches exactly and remove wrapping quotes from the variable value.`);
  }

  return databaseUrl;
}

export async function withRetry<T>(
  label: string,
  operation: () => Promise<T>,
  { attempts = 10, delayMs = 3000 }: { attempts?: number; delayMs?: number } = {}
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === attempts) {
        break;
      }

      const reason = error instanceof Error ? error.message : String(error);
      console.warn(`${label} failed on attempt ${attempt}/${attempts}: ${reason}. Retrying in ${delayMs}ms.`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
