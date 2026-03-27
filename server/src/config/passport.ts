import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import * as authService from '../services/auth.service.js';

export function configurePassport() {
  if (env.github.clientId && env.github.clientSecret) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: env.github.clientId,
          clientSecret: env.github.clientSecret,
          callbackURL: `${env.serverUrl}/api/auth/github/callback`,
          scope: ['user:email'],
        },
        async (
          _accessToken: string,
          _refreshToken: string,
          profile: { id: string; displayName?: string; username?: string; emails?: Array<{ value: string }>; photos?: Array<{ value: string }> },
          done: (err: Error | null, result?: unknown) => void
        ) => {
          try {
            const result = await authService.handleOAuthLogin({
              provider: 'github',
              providerId: profile.id,
              email: profile.emails?.[0]?.value || null,
              displayName: profile.displayName || profile.username || 'GitHub User',
              avatarUrl: profile.photos?.[0]?.value || null,
            });
            done(null, result);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  }

  if (env.google.clientId && env.google.clientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.google.clientId,
          clientSecret: env.google.clientSecret,
          callbackURL: `${env.serverUrl}/api/auth/google/callback`,
          scope: ['profile', 'email'],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const result = await authService.handleOAuthLogin({
              provider: 'google',
              providerId: profile.id,
              email: profile.emails?.[0]?.value || null,
              displayName: profile.displayName || 'Google User',
              avatarUrl: profile.photos?.[0]?.value || null,
            });
            done(null, result);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  }
}
