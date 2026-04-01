import { useState, useEffect, useCallback } from 'react';
import { fetchStatuses, upsertStatus as apiUpsert, removeStatus as apiRemove } from '../api/status';
import { useAuth } from '../context/AuthContext';
import type { StatusMap } from '../types';

export function useStatus() {
  const { isAuthenticated } = useAuth();
  const [statusMap, setStatusMap] = useState<StatusMap>({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated) { setStatusMap({}); return; }
    setLoading(true);
    try {
      const data = await fetchStatuses();
      setStatusMap(data);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = useCallback(async (
    leetcodeId: number,
    status: string,
    notes: string,
    timeSpent?: number
  ) => {
    await apiUpsert(leetcodeId, status, notes, timeSpent);
    setStatusMap((prev) => ({
      ...prev,
      [leetcodeId]: {
        status: status as 'solved' | 'attempted' | 'todo',
        notes,
        timeSpent: typeof timeSpent === 'number' ? timeSpent : prev[leetcodeId]?.timeSpent ?? 0,
      },
    }));
  }, []);

  const deleteStatus = useCallback(async (leetcodeId: number) => {
    await apiRemove(leetcodeId);
    setStatusMap((prev) => {
      const next = { ...prev };
      delete next[leetcodeId];
      return next;
    });
  }, []);

  return { statusMap, loading, updateStatus, deleteStatus };
}
