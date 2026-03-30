import dotenv from 'dotenv';
import path from 'path';
import { closePool } from '../src/config/database.js';
import { seedProblems } from '../src/databaseSetup.js';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

seedProblems()
  .then(closePool)
  .catch(async (err) => {
    console.error('Seed failed:', err);
    await closePool().catch(() => undefined);
    process.exit(1);
  });
