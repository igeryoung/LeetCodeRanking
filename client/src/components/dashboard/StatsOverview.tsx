import { Check, Minus, Bookmark, Target } from 'lucide-react';
import type { Stats } from '../../types';

interface Props {
  stats: Stats;
  total: number;
}

export function StatsOverview({ stats, total }: Props) {
  const solved    = stats.summary.solved    ?? 0;
  const attempted = stats.summary.attempted ?? 0;
  const todo      = stats.summary.todo      ?? 0;
  const touched   = solved + attempted + todo;
  const pct       = total > 0 ? Math.round((solved / total) * 100) : 0;

  const cards = [
    { label: 'Solved',    value: solved,    Icon: Check,    color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Attempted', value: attempted, Icon: Minus,    color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Todo',      value: todo,      Icon: Bookmark, color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20'   },
    { label: 'Touched',   value: touched,   Icon: Target,   color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map(({ label, value, Icon, color, bg }) => (
        <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <div className={`inline-flex p-2 rounded-xl ${bg} mb-3`}>
            <Icon size={18} className={color} />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{value}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          {label === 'Solved' && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{pct}% of {total}</p>
          )}
        </div>
      ))}
    </div>
  );
}
