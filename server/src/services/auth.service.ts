import * as userRepo from '../repositories/user.repository.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';
import type { User } from '../types/index.js';

interface OAuthProfile {
  provider: 'github' | 'google';
  providerId: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
}

export async function handleOAuthLogin(profile: OAuthProfile) {
  const user = await userRepo.upsert({
    email: profile.email,
    display_name: profile.displayName,
    avatar_url: profile.avatarUrl,
    provider: profile.provider,
    provider_id: profile.providerId,
  });

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  return { user, accessToken, refreshToken };
}

export async function refreshTokens(userId: string) {
  const user = await userRepo.findById(userId);
  if (!user) return null;

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  return { user, accessToken, refreshToken };
}

export async function getUser(userId: string): Promise<User | null> {
  return userRepo.findById(userId);
}
