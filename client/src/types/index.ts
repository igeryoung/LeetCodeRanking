export interface User {
  id: string;
  email: string | null;
  display_name: string;
  avatar_url: string | null;
  provider: 'github' | 'google';
  language: 'en' | 'zh-TW';
}

export interface Problem {
  id: number;
  leetcode_id: number;
  title: string;
  title_zh: string | null;
  title_slug: string;
  rating: number;
  contest_slug: string;
  problem_index: string;
  contest_id_en: string;
  contest_id_zh: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProblemStatus {
  status: 'solved' | 'attempted' | 'todo';
  notes: string;
  timeSpent: number;
}

export interface StatusMap {
  [leetcodeId: number]: ProblemStatus;
}

export interface Stats {
  summary: Record<string, number>;
  byRating: Array<{ band: string; status: string; count: number }>;
  totalTimeSpent: number;
}
