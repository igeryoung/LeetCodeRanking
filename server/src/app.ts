import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import path from 'path';
import { existsSync } from 'fs';
import { env } from './config/env.js';
import { configurePassport } from './config/passport.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();
const clientDist = path.resolve(__dirname, '../../client/dist');
const hasClientDist = existsSync(clientDist);

if (env.nodeEnv === 'production') {
  console.log(`[startup] clientDist=${clientDist} exists=${hasClientDist}`);
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

if (env.nodeEnv === 'production') {
  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => {
      console.log(`[http] ${req.method} ${req.originalUrl} -> ${res.statusCode} ${Date.now() - startedAt}ms`);
    });
    next();
  });
}

// Middleware
app.use(cors({
  origin: env.clientUrl,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Passport
configurePassport();
app.use(passport.initialize());

// API routes
app.use('/api', routes);

// Serve client in production
if (hasClientDist) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

export default app;
