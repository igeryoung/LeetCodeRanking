import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Rate-limit only OAuth initiation routes (not callbacks, refresh, or me)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// GitHub OAuth
router.get('/github', authLimiter, passport.authenticate('github', { session: false }));

router.get(
  '/github/callback',
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('github', { session: false }, (err: Error | null, result: unknown) => {
      if (err || !result) {
        console.error('GitHub OAuth failed:', err?.message || err || 'No user result returned');
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?error=auth_failed`);
      }
      req.authResult = result as { accessToken: string; refreshToken: string };
      next();
    })(req, res, next);
  },
  authController.getGithubCallback
);

// Google OAuth
router.get('/google', authLimiter, passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', { session: false }, (err: Error | null, result: unknown) => {
      if (err || !result) {
        console.error('Google OAuth failed:', err?.message || err || 'No user result returned');
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?error=auth_failed`);
      }
      req.authResult = result as { accessToken: string; refreshToken: string };
      next();
    })(req, res, next);
  },
  authController.getGoogleCallback
);

// Token refresh
router.post('/refresh', authController.refresh);

// Get current user
router.get('/me', requireAuth, authController.getMe);

// Logout
router.post('/logout', authController.logout);

export default router;
