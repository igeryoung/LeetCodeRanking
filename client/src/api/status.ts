import { apiFetch } from './client';
import type { StatusMap, Stats } from '../types';

export async function fetchStatuses(): Promise<StatusMap> {
  return apiFetch<StatusMap>('/status');
}

export async function upsertStatus(
  leetcodeId: number,
  status: string,
  notes: string,
  timeSpent?: number
): Promise<void> {
  await apiFetch(`/status/${leetcodeId}`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes, timeSpent }),
  });
}

export async function removeStatus(leetcodeId: number): Promise<void> {
  await apiFetch(`/status/${leetcodeId}`, { method: 'DELETE' });
}

export async function fetchStats(): Promise<Stats> {
  return apiFetch<Stats>('/stats');
}
