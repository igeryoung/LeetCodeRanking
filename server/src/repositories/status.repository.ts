import { query } from '../config/database.js';
import type { UserProblemStatus } from '../types/index.js';

export async function findAllByUserId(
  userId: string
): Promise<Array<UserProblemStatus & { leetcode_id: number }>> {
  const { rows } = await query(
    `SELECT ups.*, p.leetcode_id
     FROM user_problem_status ups
     JOIN problems p ON p.id = ups.problem_id
     WHERE ups.user_id = $1`,
    [userId]
  );
  return rows;
}

export async function upsert(data: {
  userId: string;
  problemId: number;
  status: string;
  notes: string;
  timeSpent?: number;
}): Promise<UserProblemStatus> {
  const { rows } = await query(
    `INSERT INTO user_problem_status (user_id, problem_id, status, notes, time_spent)
     VALUES ($1, $2, $3, $4, COALESCE($5, 0))
     ON CONFLICT (user_id, problem_id)
     DO UPDATE SET
       status = EXCLUDED.status,
       notes = EXCLUDED.notes,
       time_spent = COALESCE($5, user_problem_status.time_spent, 0),
       updated_at = NOW()
     RETURNING *`,
    [data.userId, data.problemId, data.status, data.notes, data.timeSpent ?? null]
  );
  return rows[0];
}

export async function remove(userId: string, problemId: number): Promise<boolean> {
  const result = await query(
    'DELETE FROM user_problem_status WHERE user_id = $1 AND problem_id = $2',
    [userId, problemId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getStats(userId: string) {
  const { rows } = await query(
    `SELECT status, COUNT(*) as count
     FROM user_problem_status
     WHERE user_id = $1
     GROUP BY status`,
    [userId]
  );

  const { rows: ratingBands } = await query(
    `SELECT
       CASE
         WHEN p.rating < 1200 THEN '0-1200'
         WHEN p.rating < 1400 THEN '1200-1400'
         WHEN p.rating < 1600 THEN '1400-1600'
         WHEN p.rating < 1800 THEN '1600-1800'
         WHEN p.rating < 2000 THEN '1800-2000'
         WHEN p.rating < 2200 THEN '2000-2200'
         WHEN p.rating < 2400 THEN '2200-2400'
         ELSE '2400+'
       END as band,
       ups.status,
       COUNT(*) as count
     FROM user_problem_status ups
     JOIN problems p ON p.id = ups.problem_id
     WHERE ups.user_id = $1
     GROUP BY band, ups.status
     ORDER BY band`,
    [userId]
  );

  const { rows: timeRows } = await query(
    `SELECT COALESCE(SUM(time_spent), 0) as total_time
     FROM user_problem_status
     WHERE user_id = $1`,
    [userId]
  );

  return {
    summary: Object.fromEntries(rows.map((r) => [r.status, parseInt(r.count, 10)])),
    byRating: ratingBands.map((r) => ({
      band: r.band,
      status: r.status,
      count: parseInt(r.count, 10),
    })),
    totalTimeSpent: parseInt(timeRows[0]?.total_time ?? '0', 10),
  };
}
