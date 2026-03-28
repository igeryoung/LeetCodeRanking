export interface User {
  id: string;
  email: string | null;
  display_name: string;
  avatar_url: string | null;
  provider: 'github' | 'google';
  provider_id: string;
  language: 'en' | 'zh-TW';
  created_at: Date;
  updated_at: Date;
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
  created_at: Date;
}

export interface UserProblemStatus {
  id: string;
  user_id: string;
  problem_id: number;
  status: 'solved' | 'attempted' | 'todo';
  notes: string;
  time_spent: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProblemFilters {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  ratingMin?: number;
  ratingMax?: number;
  problemIndex?: string[];
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

