import { apiFetch } from './client';
import type { User } from '../types';

export async function fetchMe(): Promise<{ user: User }> {
  return apiFetch<{ user: User }>('/auth/me');
}

export async function refreshToken(): Promise<{ accessToken: string; user: User }> {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Refresh failed');
  return res.json();
}

export async function logout(): Promise<void> {
  await apiFetch('/auth/logout', { method: 'POST' });
}
