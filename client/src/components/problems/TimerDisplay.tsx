import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTimer } from '../../context/TimerContext';
import { useLanguage } from '../../context/LanguageContext';
import { cn } from '../../lib/utils';

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

interface Props {
  leetcodeId: number;
  isSolved: boolean;
}

export function TimerDisplay({ leetcodeId, isSolved }: Props) {
  const { t } = useLanguage();
  const { start, pause, reset, getElapsedMs, activeId, tick: _tick } = useTimer();
  const isRunning = activeId === leetcodeId;
  const elapsedMs = getElapsedMs(leetcodeId);
  const hasTime = elapsedMs > 0;

  if (!hasTime && isSolved) return null;

  return (
    <div className="flex items-center gap-1">
      {/* Time display */}
      <span
        className={cn(
          'font-mono text-xs tabular-nums min-w-[3.2rem] text-right',
          isRunning && 'text-blue-600 dark:text-blue-400 font-semibold',
          !isRunning && hasTime && isSolved && 'text-green-600 dark:text-green-400',
          !isRunning && hasTime && !isSolved && 'text-slate-400 dark:text-slate-500',
          !hasTime && 'text-slate-300 dark:text-slate-600'
        )}
      >
        {hasTime || isRunning ? formatTime(elapsedMs) : '--:--'}
      </span>

      {/* Play/Pause button */}
      {!isSolved && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isRunning) {
              pause(leetcodeId);
            } else {
              start(leetcodeId);
            }
          }}
          className={cn(
            'p-0.5 rounded cursor-pointer transition-colors',
            isRunning
              ? 'text-blue-500 hover:text-blue-700 dark:hover:text-blue-300'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          )}
          aria-label={isRunning ? t.timer.pause : t.timer.start}
          title={isRunning ? t.timer.pause : t.timer.start}
        >
          {isRunning ? <Pause size={12} /> : <Play size={12} />}
        </button>
      )}

      {/* Reset button — only show if there's accumulated time and not solved */}
      {hasTime && !isSolved && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            reset(leetcodeId);
          }}
          className="p-0.5 rounded cursor-pointer text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors"
          aria-label={t.timer.reset}
          title={t.timer.reset}
        >
          <RotateCcw size={11} />
        </button>
      )}
    </div>
  );
}
