import app from './app.js';
import { env } from './config/env.js';
import { bootstrapDatabase } from './startup/bootstrap.js';

app.listen(env.port, '::', () => {
  console.log(`Server running on port ${env.port} (${env.nodeEnv})`);
});

void bootstrapDatabase().catch((error) => {
  console.error('Database bootstrap failed:', error);
});
