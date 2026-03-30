import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';
import { requireDatabaseUrl, withRetry } from '../config/databaseRuntime.js';
import { markBootstrapFailed, markBootstrapping, markReady } from './bootstrapState.js';

interface RatingEntry {
  Rating: number;
  ID: number;
  Title: string;
  TitleZH: string;
  TitleSlug: string;
  ContestSlug: string;
  ProblemIndex: string;
  ContestID_en: string;
  ContestID_zh: string;
}

function resolveMigrationsDir() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(__dirname, '../../migrations');
}

function resolveDataPath() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(__dirname, '../../../data/leetcode-ratings.json');
}

export async function runMigrations() {
  requireDatabaseUrl();
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const { rows: applied } = await client.query('SELECT name FROM _migrations ORDER BY name');
    const appliedSet = new Set(applied.map((r) => r.name));

    const migrationsDir = resolveMigrationsDir();
    const files = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`  ✓ ${file} (already applied)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`  ✔ ${file} (applied)`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`  ✘ ${file} (failed):`, error);
        throw error;
      }
    }

    console.log('Migrations complete.');
  } finally {
    client.release();
  }
}

export async function seedProblems() {
  requireDatabaseUrl();
  const client = await pool.connect();

  try {
    const existing = await client.query('SELECT COUNT(*)::int AS count FROM problems');
    if ((existing.rows[0]?.count || 0) > 0) {
      console.log('Seed skipped. Problems table already contains data.');
      return;
    }

    const raw = fs.readFileSync(resolveDataPath(), 'utf-8');
    const entries: RatingEntry[] = JSON.parse(raw);
    const batchSize = 500;

    console.log(`Loaded ${entries.length} problems from JSON.`);

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      const values: unknown[] = [];
      const placeholders: string[] = [];

      batch.forEach((entry, idx) => {
        const offset = idx * 9;
        placeholders.push(
          `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`
        );
        values.push(
          entry.ID,
          entry.Title,
          entry.TitleZH || null,
          entry.TitleSlug,
          Math.round(entry.Rating * 10000) / 10000,
          entry.ContestSlug,
          entry.ProblemIndex,
          entry.ContestID_en,
          entry.ContestID_zh || null
        );
      });

      await client.query(
        `INSERT INTO problems (leetcode_id, title, title_zh, title_slug, rating, contest_slug, problem_index, contest_id_en, contest_id_zh)
         VALUES ${placeholders.join(', ')}
         ON CONFLICT (leetcode_id) DO UPDATE SET
           rating = EXCLUDED.rating,
           title = EXCLUDED.title,
           title_zh = EXCLUDED.title_zh,
           title_slug = EXCLUDED.title_slug,
           contest_slug = EXCLUDED.contest_slug,
           problem_index = EXCLUDED.problem_index,
           contest_id_en = EXCLUDED.contest_id_en,
           contest_id_zh = EXCLUDED.contest_id_zh`,
        values
      );

      console.log(`  Imported ${Math.min(i + batch.length, entries.length)}/${entries.length} problems...`);
    }

    console.log('Seed complete.');
  } finally {
    client.release();
  }
}

export async function bootstrapDatabase() {
  markBootstrapping();

  try {
    await withRetry('Database seed', seedProblems);
    markReady();
    console.log('Database bootstrap complete.');
  } catch (error) {
    markBootstrapFailed(error);
    throw error;
  }
}
