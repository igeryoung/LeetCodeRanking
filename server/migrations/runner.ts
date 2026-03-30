import dotenv from 'dotenv';
import path from 'path';
import { closePool } from '../src/config/database.js';
import { runMigrations } from '../src/databaseSetup.js';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

runMigrations()
  .then(closePool)
  .catch(async (err) => {
    console.error('Migration runner failed:', err);
    await closePool().catch(() => undefined);
    process.exit(1);
  });
