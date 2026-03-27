import { useState, useEffect } from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const PROBLEM_INDICES = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'];
const STATUS_OPTIONS = ['solved', 'attempted', 'todo'] as const;

export interface Filters {
  ratingMin?: number;
  ratingMax?: number;
  problemIndex: string[];
  statusFilter: string[];
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

export function FilterBar({ filters, onChange }: Props) {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [localMin, setLocalMin] = useState(String(filters.ratingMin ?? ''));
  const [localMax, setLocalMax] = useState(String(filters.ratingMax ?? ''));

  useEffect(() => {
    setLocalMin(String(filters.ratingMin ?? ''));
    setLocalMax(String(filters.ratingMax ?? ''));
  }, [filters.ratingMin, filters.ratingMax]);

  const applyRating = () => {
    onChange({
      ...filters,
      ratingMin: localMin ? Number(localMin) : undefined,
      ratingMax: localMax ? Number(localMax) : undefined,
    });
  };

  const toggleIndex = (idx: string) => {
    const next = filters.problemIndex.includes(idx)
      ? filters.problemIndex.filter((i) => i !== idx)
      : [...filters.problemIndex, idx];
    onChange({ ...filters, problemIndex: next });
  };

  const toggleStatus = (s: string) => {
    const next = filters.statusFilter.includes(s)
      ? filters.statusFilter.filter((x) => x !== s)
      : [...filters.statusFilter, s];
    onChange({ ...filters, statusFilter: next });
  };

  const hasFilters =
    filters.ratingMin !== undefined ||
    filters.ratingMax !== undefined ||
    filters.problemIndex.length > 0 ||
    filters.statusFilter.length > 0;

  const reset = () => {
    setLocalMin('');
    setLocalMax('');
    onChange({ ratingMin: undefined, ratingMax: undefined, problemIndex: [], statusFilter: [] });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-3 px-4 bg-slate-50 dark:bg-slate-800/50 border-b border-l border-r border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
        <SlidersHorizontal size={13} />
        {t.filter.filters}
      </div>

      {/* Rating range */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-slate-500 dark:text-slate-400">{t.filter.rating}</span>
        <input
          type="number"
          placeholder={t.filter.min}
          value={localMin}
          onChange={(e) => setLocalMin(e.target.value)}
          onBlur={applyRating}
          onKeyDown={(e) => e.key === 'Enter' && applyRating()}
          className="w-20 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-xs text-slate-400">–</span>
        <input
          type="number"
          placeholder={t.filter.max}
          value={localMax}
          onChange={(e) => setLocalMax(e.target.value)}
          onBlur={applyRating}
          onKeyDown={(e) => e.key === 'Enter' && applyRating()}
          className="w-20 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Problem index */}
      <div className="flex items-center gap-1">
        {PROBLEM_INDICES.map((idx) => (
          <button
            key={idx}
            onClick={() => toggleIndex(idx)}
            className={cn(
              'px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer',
              filters.problemIndex.includes(idx)
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
            )}
          >
            {idx}
          </button>
        ))}
      </div>

      {/* Status filter (authenticated only) */}
      {isAuthenticated && (
        <div className="flex items-center gap-1">
          {STATUS_OPTIONS.map((s) => {
            const colors: Record<string, string> = {
              solved:    'bg-green-600 text-white',
              attempted: 'bg-amber-500 text-white',
              todo:      'bg-blue-600 text-white',
            };
            return (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer',
                  filters.statusFilter.includes(s)
                    ? colors[s]
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
                )}
              >
                {t.status[s]}
              </button>
            );
          })}
        </div>
      )}

      {hasFilters && (
        <button
          onClick={reset}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer ml-auto"
        >
          <RotateCcw size={12} />
          {t.filter.reset}
        </button>
      )}
    </div>
  );
}
