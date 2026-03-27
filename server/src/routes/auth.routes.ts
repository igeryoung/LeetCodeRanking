import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GitHub OAuth
router.get('/github', passport.authenticate('github', { session: false }));

router.get(
  '/github/callback',
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('github', { session: false }, (err: Error | null, result: unknown) => {
      if (err || !result) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?error=auth_failed`);
      }
      req.authResult = result as { accessToken: string; refreshToken: string };
      next();
    })(req, res, next);
  },
  authController.getGithubCallback
);

// Google OAuth
router.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', { session: false }, (err: Error | null, result: unknown) => {
      if (err || !result) {
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
