import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import path from 'path';
import { env } from './config/env.js';
import { configurePassport } from './config/passport.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

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
if (env.nodeEnv === 'production') {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

export default app;
