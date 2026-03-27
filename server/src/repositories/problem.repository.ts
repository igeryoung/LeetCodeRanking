import { query } from '../config/database.js';
import type { Problem, ProblemFilters, PaginatedResult } from '../types/index.js';

const ALLOWED_SORT_COLUMNS: Record<string, string> = {
  rating: 'rating',
  id: 'leetcode_id',
  title: 'title',
};

export async function findAll(filters: ProblemFilters): Promise<PaginatedResult<Problem>> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (filters.ratingMin !== undefined) {
    conditions.push(`rating >= $${paramIdx++}`);
    params.push(filters.ratingMin);
  }

  if (filters.ratingMax !== undefined) {
    conditions.push(`rating <= $${paramIdx++}`);
    params.push(filters.ratingMax);
  }

  if (filters.problemIndex && filters.problemIndex.length > 0) {
    conditions.push(`problem_index = ANY($${paramIdx++})`);
    params.push(filters.problemIndex);
  }

  if (filters.search) {
    conditions.push(
      `(title ILIKE $${paramIdx} OR title_zh ILIKE $${paramIdx} OR leetcode_id::text = $${paramIdx + 1})`
    );
    params.push(`%${filters.search}%`);
    params.push(filters.search);
    paramIdx += 2;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sortColumn = ALLOWED_SORT_COLUMNS[filters.sort] || 'rating';
  const sortOrder = filters.order === 'asc' ? 'ASC' : 'DESC';

  const countResult = await query(
    `SELECT COUNT(*) as count FROM problems ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (filters.page - 1) * filters.limit;
  const dataParams = [...params, filters.limit, offset];

  const { rows } = await query(
    `SELECT * FROM problems ${whereClause}
     ORDER BY ${sortColumn} ${sortOrder}
     LIMIT $${paramIdx++} OFFSET $${paramIdx}`,
    dataParams
  );

  return {
    data: rows,
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  };
}

export async function findByLeetcodeId(leetcodeId: number): Promise<Problem | null> {
  const { rows } = await query(
    'SELECT * FROM problems WHERE leetcode_id = $1',
    [leetcodeId]
  );
  return rows[0] || null;
}
