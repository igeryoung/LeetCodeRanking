import { useState, useEffect, useCallback } from 'react';
import { fetchProblems, type ProblemQuery } from '../api/problems';
import type { Problem, PaginatedResult } from '../types';

const DEFAULT_QUERY: ProblemQuery = {
  page: 1,
  limit: 50,
  sort: 'rating',
  order: 'desc',
};

export function useProblems(query: ProblemQuery) {
  const [result, setResult] = useState<PaginatedResult<Problem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProblems({ ...DEFAULT_QUERY, ...query });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load problems');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(query)]); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  return { result, loading, error, reload: load };
}
