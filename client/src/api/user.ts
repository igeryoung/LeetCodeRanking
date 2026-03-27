import { apiFetch } from './client';
import type { Language } from '../i18n';

export async function getUserSettings(): Promise<{ language: Language }> {
  return apiFetch<{ language: Language }>('/user/settings');
}

export async function updateUserSettings(language: Language): Promise<{ language: Language }> {
  return apiFetch<{ language: Language }>('/user/settings', {
    method: 'PUT',
    body: JSON.stringify({ language }),
  });
}
