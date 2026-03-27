import type { User } from './index.js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      authResult?: { accessToken: string; refreshToken: string };
    }
  }
}

export {};
