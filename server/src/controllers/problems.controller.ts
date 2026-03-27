import { Request, Response, NextFunction } from 'express';
import * as problemsService from '../services/problems.service.js';
import type { ProblemFilters } from '../types/index.js';

export async function getProblems(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as unknown as Record<string, string | string[] | undefined>;

    const filters: ProblemFilters = {
      page: parseInt(q.page as string) || 1,
      limit: Math.min(parseInt(q.limit as string) || 50, 200),
      sort: (q.sort as string) || 'rating',
      order: (q.order as string) === 'asc' ? 'asc' : 'desc',
      ratingMin: q.ratingMin ? parseFloat(q.ratingMin as string) : undefined,
      ratingMax: q.ratingMax ? parseFloat(q.ratingMax as string) : undefined,
      problemIndex: q.problemIndex
        ? Array.isArray(q.problemIndex)
          ? q.problemIndex as string[]
          : [q.problemIndex as string]
        : undefined,
      search: q.search as string | undefined,
    };

    const result = await problemsService.getProblems(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
