import * as statusRepo from '../repositories/status.repository.js';
import * as problemRepo from '../repositories/problem.repository.js';
import { NotFoundError } from '../utils/errors.js';

export async function getUserStatuses(userId: string) {
  const statuses = await statusRepo.findAllByUserId(userId);
  const statusMap: Record<number, { status: string; notes: string; timeSpent: number }> = {};
  for (const s of statuses) {
    statusMap[s.leetcode_id] = {
      status: s.status,
      notes: s.notes,
      timeSpent: s.time_spent ?? 0,
    };
  }
  return statusMap;
}

export async function upsertStatus(
  userId: string,
  leetcodeId: number,
  status: string,
  notes: string,
  timeSpent?: number
) {
  const problem = await problemRepo.findByLeetcodeId(leetcodeId);
  if (!problem) throw new NotFoundError(`Problem ${leetcodeId} not found`);

  return statusRepo.upsert({
    userId,
    problemId: problem.id,
    status,
    notes,
    timeSpent,
  });
}

export async function removeStatus(userId: string, leetcodeId: number) {
  const problem = await problemRepo.findByLeetcodeId(leetcodeId);
  if (!problem) throw new NotFoundError(`Problem ${leetcodeId} not found`);

  return statusRepo.remove(userId, problem.id);
}

export async function getStats(userId: string) {
  return statusRepo.getStats(userId);
}
