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

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

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
const clientDist = path.resolve(__dirname, '../../client/dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

export default app;
