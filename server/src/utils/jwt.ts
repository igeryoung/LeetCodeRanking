import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

interface TokenPayload {
  userId: string;
}

export function signAccessToken(userId: string): string {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: '15m' });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, env.jwtRefreshSecret, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;
}
