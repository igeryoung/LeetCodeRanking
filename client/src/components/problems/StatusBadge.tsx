import { Check, Minus, Bookmark } from 'lucide-react';
import { cn } from '../../lib/utils';

const STATUS_CONFIG = {
  solved:    { label: 'Solved',    icon: Check,    class: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  attempted: { label: 'Attempted', icon: Minus,    class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
  todo:      { label: 'Todo',      icon: Bookmark, class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'  },
} as const;

interface Props {
  status: keyof typeof STATUS_CONFIG;
  compact?: boolean;
}

export function StatusBadge({ status, compact = false }: Props) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full font-medium', config.class, compact ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs')}>
      <Icon size={11} strokeWidth={2.5} />
      {!compact && config.label}
    </span>
  );
}
