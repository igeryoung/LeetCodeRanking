import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { verifyRefreshToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';
import { env } from '../config/env.js';

export function getGithubCallback(req: Request, res: Response) {
  const { accessToken, refreshToken } = req.authResult as {
    accessToken: string;
    refreshToken: string;
  };

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.redirect(`${env.clientUrl}/auth/callback?token=${accessToken}`);
}

export function getGoogleCallback(req: Request, res: Response) {
  const { accessToken, refreshToken } = req.authResult as {
    accessToken: string;
    refreshToken: string;
  };

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.redirect(`${env.clientUrl}/auth/callback?token=${accessToken}`);
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new UnauthorizedError('No refresh token');

    const payload = verifyRefreshToken(token);
    const result = await authService.refreshTokens(payload.userId);
    if (!result) throw new UnauthorizedError('User not found');

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({ accessToken: result.accessToken, user: result.user });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response) {
  res.json({ user: req.user });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie('refreshToken', { path: '/' });
  res.json({ message: 'Logged out' });
}
