import { useState, useMemo, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, ExternalLink, StickyNote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProblems } from '../../hooks/useProblems';
import { useStatus } from '../../hooks/useStatus';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTimer } from '../../context/TimerContext';
import { FilterBar, type Filters } from './FilterBar';
import { SearchInput } from './SearchInput';
import { StatusSelector } from './StatusSelector';
import { TimerDisplay } from './TimerDisplay';
import { NotesModal } from './NotesModal';
import { ratingColor, cn } from '../../lib/utils';
import type { Problem } from '../../types';

const PAGE_SIZES = [15, 25, 50, 100];
const FILTER_STORAGE_KEY = 'lc-filter-settings';
const SORTING_STORAGE_KEY = 'lc-sorting-settings';

const DEFAULT_SORTING: SortingState = [{ id: 'rating', desc: true }];

function loadFilters(): Filters {
  try {
    const stored = localStorage.getItem(FILTER_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Filters;
      return {
        ratingMin: parsed.ratingMin,
        ratingMax: parsed.ratingMax,
        problemIndex: Array.isArray(parsed.problemIndex) ? parsed.problemIndex : [],
        statusFilter: Array.isArray(parsed.statusFilter) ? parsed.statusFilter : [],
      };
    }
  } catch {}
  return { problemIndex: [], statusFilter: [] };
}

function loadSorting(): SortingState {
  try {
    const stored = localStorage.getItem(SORTING_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as SortingState;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_SORTING;
}

export function ProblemsTable() {
  const { isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>(loadSorting);
  const [filters, setFilters] = useState<Filters>(loadFilters);
  const [notesTarget, setNotesTarget] = useState<Problem | null>(null);

  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem(SORTING_STORAGE_KEY, JSON.stringify(sorting));
  }, [sorting]);

  const { statusMap, updateStatus, deleteStatus } = useStatus();
  const timer = useTimer();

  // Seed timers from server-persisted timeSpent values
  const seededRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    for (const [idStr, s] of Object.entries(statusMap)) {
      const id = Number(idStr);
      if (s.timeSpent > 0 && !seededRef.current.has(id)) {
        seededRef.current.add(id);
        timer.seed(id, s.timeSpent);
      }
    }
  }, [statusMap, timer]);

  const sortField = sorting[0];
  const query = useMemo(() => ({
    page,
    limit: pageSize,
    sort: sortField?.id ?? 'rating',
    order: (sortField?.desc ? 'desc' : 'asc') as 'asc' | 'desc',
    ratingMin: filters.ratingMin,
    ratingMax: filters.ratingMax,
    problemIndex: filters.problemIndex.length > 0 ? filters.problemIndex : undefined,
    search: search || undefined,
  }), [page, pageSize, sortField, filters, search]);

  const { result, loading } = useProblems(query);

  // Client-side status filter
  const problems = useMemo(() => {
    const rows = result?.data ?? [];
    if (!isAuthenticated || filters.statusFilter.length === 0) return rows;
    return rows.filter((p) => {
      const s = statusMap[p.leetcode_id];
      return s && filters.statusFilter.includes(s.status);
    });
  }, [result, isAuthenticated, filters.statusFilter, statusMap]);

  const columns = useMemo<ColumnDef<Problem>[]>(() => {
    const cols: ColumnDef<Problem>[] = [
      {
        id: 'rating',
        accessorKey: 'rating',
        header: t.table.rating,
        size: 90,
        cell: ({ row }) => (
          <span className={cn('font-mono font-semibold text-sm', ratingColor(row.original.rating))}>
            {Number(row.original.rating).toFixed(0)}
          </span>
        ),
      },
      {
        id: 'id',
        accessorKey: 'leetcode_id',
        header: t.table.id,
        size: 70,
        cell: ({ row }) => (
          <span className="font-mono text-sm text-slate-500 dark:text-slate-400">
            {row.original.leetcode_id}
          </span>
        ),
      },
      {
        id: 'title',
        accessorKey: 'title',
        header: t.table.problem,
        cell: ({ row }) => {
          const title = language === 'zh-TW' && row.original.title_zh
            ? row.original.title_zh
            : row.original.title;
          return (
            <div className="min-w-0">
              <a
                href={`https://leetcode.com/problems/${row.original.title_slug}/`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (isAuthenticated) {
                    timer.start(row.original.leetcode_id);
                  }
                }}
                onAuxClick={(e) => {
                  if (e.button === 1 && isAuthenticated) {
                    timer.start(row.original.leetcode_id);
                  }
                }}
                className="group flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span className="truncate">{title}</span>
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
              </a>
            </div>
          );
        },
      },
      {
        id: 'contest',
        accessorKey: 'contest_id_en',
        header: t.table.contest,
        size: 200,
        cell: ({ row }) => {
          const contestName = language === 'zh-TW' && row.original.contest_id_zh
            ? row.original.contest_id_zh
            : row.original.contest_id_en;
          return (
            <div className="min-w-0">
              <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{contestName}</p>
              <span className="inline-block text-xs font-mono px-1.5 py-0.5 mt-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                {row.original.problem_index}
              </span>
            </div>
          );
        },
      },
    ];

    if (isAuthenticated) {
      cols.push({
        id: 'status',
        header: t.table.status,
        size: 120,
        enableSorting: false,
        cell: ({ row }) => {
          const s = statusMap[row.original.leetcode_id];
          return (
            <div className="flex items-center gap-2">
              <StatusSelector
                current={s}
                leetcodeId={row.original.leetcode_id}
                onSelect={(status, notes, timeSpent) => updateStatus(row.original.leetcode_id, status, notes, timeSpent)}
                onRemove={() => {
                  timer.reset(row.original.leetcode_id);
                  return deleteStatus(row.original.leetcode_id);
                }}
              />
              {s && (
                <button
                  onClick={() => setNotesTarget(row.original)}
                  className={cn(
                    'p-1 rounded cursor-pointer transition-colors',
                    s.notes
                      ? 'text-amber-500 hover:text-amber-600'
                      : 'text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400'
                  )}
                  aria-label="Edit notes"
                >
                  <StickyNote size={13} />
                </button>
              )}
            </div>
          );
        },
      });
      cols.push({
        id: 'timer',
        header: t.table.time,
        size: 110,
        enableSorting: false,
        cell: ({ row }) => {
          const s = statusMap[row.original.leetcode_id];
          return (
            <TimerDisplay
              leetcodeId={row.original.leetcode_id}
              isSolved={s?.status === 'solved'}
            />
          );
        },
      });
    }

    return cols;
  }, [isAuthenticated, statusMap, updateStatus, deleteStatus, language, t]);

  const table = useReactTable({
    data: problems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    onSortingChange: (updater) => {
      setSorting(updater);
      setPage(1);
    },
    state: { sorting },
  });

  const total = result?.total ?? 0;
  const totalPages = result?.totalPages ?? 1;

  const handleFiltersChange = (f: Filters) => {
    setFilters(f);
    setPage(1);
  };

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <SearchInput value={search} onChange={handleSearch} />
        <div className="ml-auto flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{total.toLocaleString()} {t.table.problems}</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs cursor-pointer text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            {PAGE_SIZES.map((s) => <option key={s} value={s}>{s} {t.table.perPage}</option>)}
          </select>
        </div>
      </div>

      {/* Filters */}
      <FilterBar filters={filters} onChange={handleFiltersChange} />

      {/* Table */}
      <div className="flex-1 overflow-auto border-l border-r border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap select-none',
                        canSort && 'cursor-pointer hover:text-slate-800 dark:hover:text-slate-200'
                      )}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <span className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          sorted === 'asc' ? <ChevronUp size={13} className="text-blue-500" /> :
                          sorted === 'desc' ? <ChevronDown size={13} className="text-blue-500" /> :
                          <ChevronsUpDown size={13} className="opacity-40" />
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-slate-400 dark:text-slate-500">
                  {t.table.noResults}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const status = statusMap[row.original.leetcode_id]?.status;
                const isActive = timer.activeId === row.original.leetcode_id;
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
                      status === 'solved' && 'bg-green-50/30 dark:bg-green-950/10',
                      status === 'attempted' && 'bg-amber-50/30 dark:bg-amber-950/10',
                      isActive && 'border-l-2 border-l-blue-500 bg-blue-50/20 dark:bg-blue-950/10'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
        <span>
          {t.table.page} {page} {t.table.of} {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(1)}
            disabled={page <= 1}
            className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer disabled:cursor-default transition-colors"
          >
            «
          </button>
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer disabled:cursor-default transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
            const p = start + i;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  'px-2.5 py-1 rounded font-medium transition-colors cursor-pointer',
                  p === page
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer disabled:cursor-default transition-colors"
          >
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page >= totalPages}
            className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer disabled:cursor-default transition-colors"
          >
            »
          </button>
        </div>
      </div>

      {/* Notes modal */}
      {notesTarget && statusMap[notesTarget.leetcode_id] && (
        <NotesModal
          problem={notesTarget}
          status={statusMap[notesTarget.leetcode_id]}
          onSave={(notes) => updateStatus(notesTarget.leetcode_id, statusMap[notesTarget.leetcode_id].status, notes)}
          onClose={() => setNotesTarget(null)}
        />
      )}
    </div>
  );
}
