import { Check, Minus, Bookmark, Target, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { Stats } from '../../types';

function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

interface Props {
  stats: Stats;
  total: number;
}

export function StatsOverview({ stats, total }: Props) {
  const { t } = useLanguage();
  const solved    = stats.summary.solved    ?? 0;
  const attempted = stats.summary.attempted ?? 0;
  const todo      = stats.summary.todo      ?? 0;
  const touched   = solved + attempted + todo;
  const pct       = total > 0 ? Math.round((solved / total) * 100) : 0;

  const cards = [
    { key: 'solved'    as const, label: t.dashboard.solved,    value: String(solved),                          Icon: Check,    color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { key: 'attempted' as const, label: t.dashboard.attempted, value: String(attempted),                       Icon: Minus,    color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { key: 'todo'      as const, label: t.dashboard.todo,      value: String(todo),                            Icon: Bookmark, color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20'   },
    { key: 'touched'   as const, label: t.dashboard.touched,   value: String(touched),                         Icon: Target,   color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    { key: 'totalTime' as const, label: t.timer.totalTime,     value: formatDuration(stats.totalTimeSpent ?? 0), Icon: Clock,  color: 'text-cyan-600 dark:text-cyan-400',   bg: 'bg-cyan-50 dark:bg-cyan-900/20'   },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {cards.map(({ key, label, value, Icon, color, bg }) => (
        <div key={key} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <div className={`inline-flex p-2 rounded-xl ${bg} mb-3`}>
            <Icon size={18} className={color} />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{value}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          {key === 'solved' && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t.dashboard.ofTotal(pct, total)}</p>
          )}
        </div>
      ))}
    </div>
  );
}
