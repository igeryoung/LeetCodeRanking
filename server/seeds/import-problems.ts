import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function importProblems() {
  const dataPath = path.resolve(__dirname, '../../data/leetcode-ratings.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const entries: RatingEntry[] = JSON.parse(raw);

  console.log(`Loaded ${entries.length} problems from JSON.`);

  const client = await pool.connect();
  const BATCH_SIZE = 500;

  try {
    let inserted = 0;

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);

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

      inserted += batch.length;
      console.log(`  Imported ${inserted}/${entries.length} problems...`);
    }

    console.log(`Seed complete. ${inserted} problems imported.`);
  } finally {
    client.release();
    await pool.end();
  }
}

importProblems().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
