import * as problemRepo from '../repositories/problem.repository.js';
import type { ProblemFilters } from '../types/index.js';

export async function getProblems(filters: ProblemFilters) {
  return problemRepo.findAll(filters);
}

export async function getProblemByLeetcodeId(leetcodeId: number) {
  return problemRepo.findByLeetcodeId(leetcodeId);
}
