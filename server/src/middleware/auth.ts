import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { query } from '../config/database.js';
import { UnauthorizedError } from '../utils/errors.js';
import type { User } from '../types/index.js';

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    const { rows } = await query('SELECT * FROM users WHERE id = $1', [payload.userId]);
    if (rows.length === 0) {
      throw new UnauthorizedError('User not found');
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      next(err);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    const { rows } = await query('SELECT * FROM users WHERE id = $1', [payload.userId]);
    if (rows.length > 0) {
      req.user = rows[0];
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
}
