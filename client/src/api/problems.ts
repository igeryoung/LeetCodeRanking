import { apiFetch } from './client';
import type { PaginatedResult, Problem } from '../types';

export interface ProblemQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  ratingMin?: number;
  ratingMax?: number;
  problemIndex?: string[];
  search?: string;
}

export async function fetchProblems(query: ProblemQuery): Promise<PaginatedResult<Problem>> {
  const params = new URLSearchParams();

  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.sort) params.set('sort', query.sort);
  if (query.order) params.set('order', query.order);
  if (query.ratingMin !== undefined) params.set('ratingMin', String(query.ratingMin));
  if (query.ratingMax !== undefined) params.set('ratingMax', String(query.ratingMax));
  if (query.search) params.set('search', query.search);
  if (query.problemIndex) {
    query.problemIndex.forEach((idx) => params.append('problemIndex', idx));
  }

  return apiFetch<PaginatedResult<Problem>>(`/problems?${params.toString()}`);
}
